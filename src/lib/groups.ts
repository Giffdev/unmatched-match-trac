import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  query,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import type { GameGroup, GroupMember, GroupSettings, GroupRole, UserGroupMembership } from './group-types'

// Strip undefined values for Firestore write safety (same pattern as firestore.ts)
function stripUndefined(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripUndefined)
  if (obj !== null && typeof obj === 'object') {
    const clean: Record<string, any> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) clean[k] = stripUndefined(v)
    }
    return clean
  }
  return obj
}

export async function createGroup(
  userId: string,
  name: string,
  description?: string,
  settings?: Partial<GroupSettings>
): Promise<string> {
  const groupRef = doc(collection(db, 'groups'))
  const now = new Date().toISOString()

  const group: GameGroup = {
    id: groupRef.id,
    name,
    description,
    ownerUid: userId,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
    memberUids: [userId],
    memberCount: 1,
    inviteCode: generateInviteCode(),
    settings: {
      allowMemberInvites: settings?.allowMemberInvites ?? false,
      autoAddToPersonal: settings?.autoAddToPersonal ?? true,
    },
  }

  // Get user profile for denormalized member data
  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data() || {}

  const member: GroupMember = {
    uid: userId,
    displayName: userData.displayName || userData.name || userData.playerName || '',
    playerName: userData.playerName,
    role: 'owner',
    joinedAt: now,
    invitedBy: userId,
  }

  const membership: UserGroupMembership = {
    groupId: groupRef.id,
    groupName: name,
    role: 'owner',
  }

  const batch = writeBatch(db)
  batch.set(groupRef, stripUndefined(group))
  batch.set(doc(db, 'groups', groupRef.id, 'members', userId), stripUndefined(member))
  batch.set(doc(db, 'users', userId, 'data', 'groups'), {
    groups: arrayUnion(stripUndefined(membership)),
  }, { merge: true } as any)

  // writeBatch.set doesn't accept merge in the same way — use setDoc pattern via batch
  // Actually firebase batch.set does support merge option
  await batch.commit()

  return groupRef.id
}

export async function getGroup(groupId: string): Promise<GameGroup | null> {
  const snap = await getDoc(doc(db, 'groups', groupId))
  if (!snap.exists()) return null
  return snap.data() as GameGroup
}

export async function getUserGroups(userId: string): Promise<UserGroupMembership[]> {
  const snap = await getDoc(doc(db, 'users', userId, 'data', 'groups'))
  if (!snap.exists()) return []
  return (snap.data().groups || []) as UserGroupMembership[]
}

export async function updateGroupSettings(
  groupId: string,
  settings: Partial<GroupSettings>
): Promise<void> {
  const updates: Record<string, any> = { updatedAt: new Date().toISOString() }
  if (settings.allowMemberInvites !== undefined) {
    updates['settings.allowMemberInvites'] = settings.allowMemberInvites
  }
  if (settings.autoAddToPersonal !== undefined) {
    updates['settings.autoAddToPersonal'] = settings.autoAddToPersonal
  }
  await updateDoc(doc(db, 'groups', groupId), updates)
}

export async function updateGroupInfo(
  groupId: string,
  data: { name?: string; description?: string; settings?: Partial<GroupSettings> }
): Promise<void> {
  const updates: Record<string, any> = { updatedAt: new Date().toISOString() }
  if (data.name !== undefined) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description
  if (data.settings?.allowMemberInvites !== undefined) {
    updates['settings.allowMemberInvites'] = data.settings.allowMemberInvites
  }
  if (data.settings?.autoAddToPersonal !== undefined) {
    updates['settings.autoAddToPersonal'] = data.settings.autoAddToPersonal
  }

  if (data.name === undefined) {
    // No name change — simple update, no denormalized data to sync
    await updateDoc(doc(db, 'groups', groupId), updates)
    return
  }

  // Name changed: update group doc + denormalized groupName in all members and pending invites
  const groupSnap = await getDoc(doc(db, 'groups', groupId))
  if (!groupSnap.exists()) throw new Error(`Group ${groupId} not found`)
  const group = groupSnap.data() as GameGroup
  const memberUids: string[] = group.memberUids || []

  // Collect member docs to update — build the full replacement array for each user
  const memberUpdates: { ref: any; updatedGroups: UserGroupMembership[] }[] = []
  for (const uid of memberUids) {
    const userGroupsRef = doc(db, 'users', uid, 'data', 'groups')
    const userGroupsSnap = await getDoc(userGroupsRef)
    if (userGroupsSnap.exists()) {
      const currentGroups: UserGroupMembership[] = (userGroupsSnap.data() as any).groups || []
      const hasEntry = currentGroups.some(g => g.groupId === groupId)
      if (hasEntry) {
        const updatedGroups = currentGroups.map(g =>
          g.groupId === groupId ? stripUndefined({ ...g, groupName: data.name! }) : g
        )
        memberUpdates.push({ ref: userGroupsRef, updatedGroups })
      }
    }
  }

  // Collect pending invites that reference this group
  const invitesSnap = await getDocs(collection(db, 'groups', groupId, 'invites'))
  const pendingInviteRefs = invitesSnap.docs
    .filter(d => d.data().status === 'pending')
    .map(d => d.ref)

  // Write everything atomically in a batch
  const batch = writeBatch(db)
  batch.update(doc(db, 'groups', groupId), updates)

  for (const mu of memberUpdates) {
    batch.set(mu.ref, { groups: mu.updatedGroups }, { merge: true })
  }

  for (const inviteRef of pendingInviteRefs) {
    batch.update(inviteRef, { groupName: data.name })
  }

  await batch.commit()
}

export async function deleteGroup(groupId: string): Promise<void> {
  const BATCH_LIMIT = 450

  // Fetch all subcollection docs and collect member UIDs for cleanup
  const membersSnap = await getDocs(collection(db, 'groups', groupId, 'members'))
  const matchesSnap = await getDocs(collection(db, 'groups', groupId, 'matches'))
  const invitesSnap = await getDocs(collection(db, 'groups', groupId, 'invites'))

  // Collect all subcollection docs to delete
  const allDeletions = [
    ...membersSnap.docs.map(d => d.ref),
    ...matchesSnap.docs.map(d => d.ref),
    ...invitesSnap.docs.map(d => d.ref),
  ]

  // Delete subcollections in batches of BATCH_LIMIT
  for (let i = 0; i < allDeletions.length; i += BATCH_LIMIT) {
    const chunk = allDeletions.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    for (const ref of chunk) batch.delete(ref)
    await batch.commit()
  }

  // Final batch: delete group doc + cleanup user group memberships
  // Collect membership cleanup operations
  const memberCleanupOps: { ref: any; entry: UserGroupMembership }[] = []
  for (const memberDoc of membersSnap.docs) {
    const memberId = memberDoc.id
    const userGroupsRef = doc(db, 'users', memberId, 'data', 'groups')
    const userGroupsSnap = await getDoc(userGroupsRef)
    if (userGroupsSnap.exists()) {
      const currentGroups: UserGroupMembership[] = userGroupsSnap.data().groups || []
      const entry = currentGroups.find(g => g.groupId === groupId)
      if (entry) {
        memberCleanupOps.push({ ref: userGroupsRef, entry })
      }
    }
  }

  // Write final cleanup in batches (group doc deletion + member user-groups updates)
  const finalOps = memberCleanupOps
  for (let i = 0; i < finalOps.length; i += BATCH_LIMIT - 1) {
    const chunk = finalOps.slice(i, i + BATCH_LIMIT - 1)
    const batch = writeBatch(db)
    // Include group doc deletion in the first batch only
    if (i === 0) {
      batch.delete(doc(db, 'groups', groupId))
    }
    for (const op of chunk) {
      batch.update(op.ref, {
        groups: arrayRemove(stripUndefined(op.entry)),
      })
    }
    await batch.commit()
  }

  // If no member cleanup ops, still need to delete the group doc
  if (finalOps.length === 0) {
    const batch = writeBatch(db)
    batch.delete(doc(db, 'groups', groupId))
    await batch.commit()
  }
}

export async function addMemberToGroup(
  groupId: string,
  userId: string,
  invitedBy: string,
  role: GroupRole = 'member'
): Promise<void> {
  const groupSnap = await getDoc(doc(db, 'groups', groupId))
  if (!groupSnap.exists()) throw new Error('Group not found')
  const group = groupSnap.data() as GameGroup

  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data() || {}

  const now = new Date().toISOString()

  const member: GroupMember = {
    uid: userId,
    displayName: userData.displayName || userData.name || userData.playerName || '',
    playerName: userData.playerName,
    role,
    joinedAt: now,
    invitedBy,
  }

  const membership: UserGroupMembership = {
    groupId,
    groupName: group.name,
    role,
  }

  const batch = writeBatch(db)
  batch.update(doc(db, 'groups', groupId), {
    memberUids: arrayUnion(userId),
    memberCount: increment(1),
    updatedAt: now,
  })
  batch.set(doc(db, 'groups', groupId, 'members', userId), stripUndefined(member))
  batch.set(doc(db, 'users', userId, 'data', 'groups'), {
    groups: arrayUnion(stripUndefined(membership)),
  }, { merge: true } as any)

  await batch.commit()
}

export async function removeMemberFromGroup(groupId: string, userId: string): Promise<void> {
  // Read user's groups to find the membership entry to remove
  const userGroupsSnap = await getDoc(doc(db, 'users', userId, 'data', 'groups'))
  const currentGroups: UserGroupMembership[] = userGroupsSnap.exists()
    ? (userGroupsSnap.data().groups || [])
    : []
  const membershipEntry = currentGroups.find(g => g.groupId === groupId)

  const batch = writeBatch(db)
  batch.update(doc(db, 'groups', groupId), {
    memberUids: arrayRemove(userId),
    memberCount: increment(-1),
    updatedAt: new Date().toISOString(),
  })
  batch.delete(doc(db, 'groups', groupId, 'members', userId))

  if (membershipEntry) {
    batch.update(doc(db, 'users', userId, 'data', 'groups'), {
      groups: arrayRemove(stripUndefined(membershipEntry)),
    })
  }

  await batch.commit()
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const snap = await getDocs(collection(db, 'groups', groupId, 'members'))
  return snap.docs.map(d => d.data() as GroupMember)
}

/**
 * Generate a short random invite code (8 chars, alphanumeric).
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Get or create an invite code for a group.
 * If the group already has an invite code, returns it. Otherwise generates one.
 */
export async function getOrCreateInviteCode(groupId: string): Promise<string> {
  const groupRef = doc(db, 'groups', groupId)
  const groupSnap = await getDoc(groupRef)
  if (!groupSnap.exists()) throw new Error('Group not found')

  const group = groupSnap.data() as GameGroup
  if (group.inviteCode) return group.inviteCode

  const code = generateInviteCode()
  await updateDoc(groupRef, { inviteCode: code })
  return code
}

/**
 * Look up a group by its invite code.
 */
export async function getGroupByInviteCode(inviteCode: string): Promise<GameGroup | null> {
  const groupsRef = collection(db, 'groups')
  const q = query(groupsRef, where('inviteCode', '==', inviteCode))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs[0].data() as GameGroup
}

/**
 * Join a group using an invite code. Returns the group name on success.
 */
export async function joinGroupByInviteCode(inviteCode: string, userId: string): Promise<string> {
  const group = await getGroupByInviteCode(inviteCode)
  if (!group) throw new Error('Invalid invite code')

  if (group.memberUids.includes(userId)) {
    throw new Error('You are already a member of this group')
  }

  await addMemberToGroup(group.id, userId, group.ownerUid, 'member')
  return group.name
}

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const groupSnap = await getDoc(doc(db, 'groups', groupId))
  if (!groupSnap.exists()) throw new Error('Group not found')
  const group = groupSnap.data() as GameGroup
  if (group.ownerUid === userId) {
    throw new Error('The group owner cannot leave. Transfer ownership or delete the group instead.')
  }
  return removeMemberFromGroup(groupId, userId)
}

/**
 * Write a single newly-logged personal match to one or more groups.
 * Uses writeBatch to atomically write to ALL groups — either all succeed or none do.
 * Returns the groupRef for the first group (used as the dedup signal on the personal match).
 * The caller should only set groupRef on the personal match AFTER this returns successfully.
 */
export async function addMatchToGroups(
  groupIds: string[],
  match: import('./types').Match,
  userId: string,
  userName: string
): Promise<{ groupId: string; groupMatchId: string } | null> {
  if (groupIds.length === 0) return null

  const BATCH_LIMIT = 450
  let firstRef: { groupId: string; groupMatchId: string } | null = null

  // Pre-generate all document references and data
  const operations: { ref: any; data: any; groupId: string }[] = []
  for (const groupId of groupIds) {
    const matchRef = doc(collection(db, 'groups', groupId, 'matches'))
    const groupMatch = {
      ...match,
      id: matchRef.id,
      groupId,
      loggedBy: userId,
      loggedByName: userName,
      sourceMatchId: match.id,
    }
    operations.push({ ref: matchRef, data: stripUndefined(groupMatch), groupId })

    if (!firstRef) {
      firstRef = { groupId, groupMatchId: matchRef.id }
    }
  }

  // Write all operations in batches (unlikely to exceed 450 for group selection, but safe)
  for (let i = 0; i < operations.length; i += BATCH_LIMIT) {
    const chunk = operations.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    for (const op of chunk) {
      batch.set(op.ref, op.data)
    }
    await batch.commit()
  }

  return firstRef
}

/**
 * Import existing personal matches into a group.
 * Creates copies in the group's matches subcollection and adds groupRef to personal matches.
 * Reads personal matches ONCE, batches group writes, then does a single personal matches update.
 */
export async function importMatchesToGroup(
  groupId: string,
  matches: import('./types').Match[],
  userId: string,
  userName: string
): Promise<{ imported: number }> {
  if (matches.length === 0) return { imported: 0 }

  const BATCH_SIZE = 450
  const allGroupMatchRefs: { personalMatchId: string; groupMatchId: string }[] = []

  // Write group match copies in batches
  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const chunk = matches.slice(i, i + BATCH_SIZE)
    const batch = writeBatch(db)

    for (const match of chunk) {
      const matchRef = doc(collection(db, 'groups', groupId, 'matches'))
      const groupMatch = {
        ...match,
        id: matchRef.id,
        groupId,
        loggedBy: userId,
        loggedByName: userName,
        sourceMatchId: match.id,
      }
      batch.set(matchRef, stripUndefined(groupMatch))
      allGroupMatchRefs.push({ personalMatchId: match.id, groupMatchId: matchRef.id })
    }

    await batch.commit()
  }

  // Single read + single write for personal matches groupRef update
  const userMatchesRef = doc(db, 'users', userId, 'data', 'matches')
  const userMatchesSnap = await getDoc(userMatchesRef)
  if (userMatchesSnap.exists()) {
    const allMatches: any[] = userMatchesSnap.data().matches || []
    let updated = false
    for (const ref of allGroupMatchRefs) {
      const idx = allMatches.findIndex((m: any) => m.id === ref.personalMatchId)
      if (idx !== -1 && !allMatches[idx].groupRef) {
        allMatches[idx] = {
          ...allMatches[idx],
          groupRef: { groupId, groupMatchId: ref.groupMatchId },
        }
        updated = true
      }
    }
    if (updated) {
      await setDoc(userMatchesRef, { matches: stripUndefined(allMatches) }, { merge: true })
    }
  }

  return { imported: allGroupMatchRefs.length }
}
