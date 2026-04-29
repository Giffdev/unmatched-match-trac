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
  description?: string
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
    settings: {
      allowMemberInvites: false,
      autoAddToPersonal: true,
    },
  }

  // Get user profile for denormalized member data
  const userDoc = await getDoc(doc(db, 'users', userId))
  const userData = userDoc.data() || {}

  const member: GroupMember = {
    uid: userId,
    displayName: userData.displayName || userData.name || '',
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

export async function deleteGroup(groupId: string): Promise<void> {
  // Delete members subcollection
  const membersSnap = await getDocs(collection(db, 'groups', groupId, 'members'))
  const matchesSnap = await getDocs(collection(db, 'groups', groupId, 'matches'))
  const invitesSnap = await getDocs(collection(db, 'groups', groupId, 'invites'))

  const batch = writeBatch(db)

  for (const d of membersSnap.docs) batch.delete(d.ref)
  for (const d of matchesSnap.docs) batch.delete(d.ref)
  for (const d of invitesSnap.docs) batch.delete(d.ref)
  batch.delete(doc(db, 'groups', groupId))

  await batch.commit()
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
    displayName: userData.displayName || userData.name || '',
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

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  return removeMemberFromGroup(groupId, userId)
}
