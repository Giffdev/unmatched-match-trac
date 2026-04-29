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
  increment,
  runTransaction,
} from 'firebase/firestore'
import { db } from './firebase'
import type { GameGroup, GroupMember, GroupInvite, UserGroupMembership } from './group-types'

// Strip undefined values for Firestore write safety
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

/**
 * Send an invite to a user to join a group.
 * Creates invite in group's invites subcollection and in user's pending invites.
 */
export async function sendInvite(
  groupId: string,
  groupName: string,
  invitedUid: string,
  invitedBy: string,
  invitedByName: string
): Promise<string> {
  const inviteRef = doc(collection(db, 'groups', groupId, 'invites'))
  const now = new Date().toISOString()

  const invite: GroupInvite = {
    id: inviteRef.id,
    groupId,
    groupName,
    invitedUid,
    invitedBy,
    invitedByName,
    status: 'pending',
    createdAt: now,
  }

  const batch = writeBatch(db)
  batch.set(inviteRef, stripUndefined(invite))
  // Add to user's pending invites for easy lookup
  batch.set(doc(db, 'users', invitedUid, 'data', 'group-invites'), {
    invites: arrayUnion(stripUndefined(invite)),
  }, { merge: true } as any)

  await batch.commit()
  return inviteRef.id
}

/**
 * Send an invite by email when no registered user exists yet.
 * Stores invite in the group's invites subcollection and in
 * `pending-email-invites/{normalizedEmail}` for lookup on sign-up.
 */
export async function sendEmailInvite(
  groupId: string,
  groupName: string,
  email: string,
  invitedBy: string,
  invitedByName: string
): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim()
  const inviteRef = doc(collection(db, 'groups', groupId, 'invites'))
  const now = new Date().toISOString()

  const invite: GroupInvite = {
    id: inviteRef.id,
    groupId,
    groupName,
    invitedEmail: normalizedEmail,
    invitedBy,
    invitedByName,
    status: 'pending',
    createdAt: now,
  }

  const pendingRef = doc(db, 'pending-email-invites', normalizedEmail)

  const batch = writeBatch(db)
  batch.set(inviteRef, stripUndefined(invite))
  batch.set(pendingRef, {
    invites: arrayUnion(stripUndefined(invite)),
  }, { merge: true } as any)

  await batch.commit()
  return inviteRef.id
}

/**
 * Check for pending email invites when a user signs up or logs in.
 * If found, migrates them to UID-based invites and cleans up.
 */
export async function checkPendingEmailInvites(
  email: string,
  uid: string
): Promise<GroupInvite[]> {
  const normalizedEmail = email.toLowerCase().trim()
  const pendingRef = doc(db, 'pending-email-invites', normalizedEmail)
  const pendingSnap = await getDoc(pendingRef)

  if (!pendingSnap.exists()) return []

  const pendingInvites: GroupInvite[] = pendingSnap.data().invites || []
  const activeInvites = pendingInvites.filter(i => i.status === 'pending')

  if (activeInvites.length === 0) return []

  // Migrate: set invitedUid on each group invite doc and add to user's pending invites
  const batch = writeBatch(db)
  const migratedInvites: GroupInvite[] = []

  for (const invite of activeInvites) {
    const migratedInvite: GroupInvite = { ...invite, invitedUid: uid }
    migratedInvites.push(migratedInvite)

    // Update the invite in the group's subcollection
    const inviteRef = doc(db, 'groups', invite.groupId, 'invites', invite.id)
    batch.update(inviteRef, { invitedUid: uid })
  }

  // Add all migrated invites to the user's pending invites
  const userInvitesRef = doc(db, 'users', uid, 'data', 'group-invites')
  batch.set(userInvitesRef, {
    invites: arrayUnion(...migratedInvites.map(i => stripUndefined(i))),
  }, { merge: true } as any)

  // Delete the pending-email-invites doc
  batch.delete(pendingRef)

  await batch.commit()
  return migratedInvites
}

/**
 * Accept an invite — atomically updates invite status AND adds user to group.
 * Uses runTransaction so if any step fails, nothing is committed.
 * The invite stays "pending" on failure so the user can retry.
 */
export async function acceptInvite(
  inviteId: string,
  groupId: string,
  userId: string
): Promise<void> {
  const inviteRef = doc(db, 'groups', groupId, 'invites', inviteId)
  const groupRef = doc(db, 'groups', groupId)
  const userInvitesRef = doc(db, 'users', userId, 'data', 'group-invites')
  const userGroupsRef = doc(db, 'users', userId, 'data', 'groups')
  const memberRef = doc(db, 'groups', groupId, 'members', userId)
  const userDocRef = doc(db, 'users', userId)

  await runTransaction(db, async (transaction) => {
    // Read all necessary docs inside the transaction
    const inviteSnap = await transaction.get(inviteRef)
    if (!inviteSnap.exists()) throw new Error('Invite not found')
    const invite = inviteSnap.data() as GroupInvite
    if (invite.status !== 'pending') throw new Error('Invite already responded to')

    const groupSnap = await transaction.get(groupRef)
    if (!groupSnap.exists()) throw new Error('Group not found')
    const group = groupSnap.data() as GameGroup

    const userDocSnap = await transaction.get(userDocRef)
    const userData = userDocSnap.data() || {}

    const userInvitesSnap = await transaction.get(userInvitesRef)

    const now = new Date().toISOString()

    // 1. Add user as group member
    const member: GroupMember = {
      uid: userId,
      displayName: userData.displayName || userData.name || userData.playerName || '',
      playerName: userData.playerName,
      role: 'member',
      joinedAt: now,
      invitedBy: invite.invitedBy,
    }
    transaction.set(memberRef, stripUndefined(member))

    // 2. Update group doc — add to memberUids
    transaction.update(groupRef, {
      memberUids: arrayUnion(userId),
      memberCount: increment(1),
      updatedAt: now,
    })

    // 3. Add to user's group memberships
    const membership: UserGroupMembership = {
      groupId,
      groupName: group.name,
      role: 'member',
    }
    transaction.set(userGroupsRef, {
      groups: arrayUnion(stripUndefined(membership)),
    }, { merge: true })

    // 4. Remove the invite from user's pending invites (clean up — no longer needed)
    if (userInvitesSnap.exists()) {
      const currentInvites: GroupInvite[] = userInvitesSnap.data().invites || []
      const filtered = currentInvites.filter(i => i.id !== inviteId)
      transaction.set(userInvitesRef, { invites: stripUndefined(filtered) }, { merge: true })
    }

    // 5. Mark invite as accepted LAST — if anything above fails, invite stays pending
    transaction.update(inviteRef, { status: 'accepted', respondedAt: now })
  })
}

/**
 * Decline an invite — updates status only, does not add to group.
 */
export async function declineInvite(
  inviteId: string,
  groupId: string
): Promise<void> {
  const now = new Date().toISOString()
  const inviteRef = doc(db, 'groups', groupId, 'invites', inviteId)
  const snap = await getDoc(inviteRef)

  if (!snap.exists()) throw new Error('Invite not found')
  const invite = snap.data() as GroupInvite

  await updateDoc(inviteRef, { status: 'declined', respondedAt: now })

 // Remove the invite from user's pending invites (clean up — user can be re-invited)
    if (invite.invitedUid) {
      const userInvitesRef = doc(db, 'users', invite.invitedUid, 'data', 'group-invites')
      const userInvitesSnap = await getDoc(userInvitesRef)
      if (userInvitesSnap.exists()) {
        const currentInvites: GroupInvite[] = userInvitesSnap.data().invites || []
        const filtered = currentInvites.filter(i => i.id !== inviteId)
        await setDoc(userInvitesRef, { invites: stripUndefined(filtered) }, { merge: true })
      }
    }

    // Also clean up from pending-email-invites if this was an email-based invite
    if (invite.invitedEmail) {
      const pendingRef = doc(db, 'pending-email-invites', invite.invitedEmail)
      const pendingSnap = await getDoc(pendingRef)
      if (pendingSnap.exists()) {
        const pendingInvites: GroupInvite[] = pendingSnap.data().invites || []
        const filtered = pendingInvites.filter(i => i.id !== inviteId)
        if (filtered.length === 0) {
          await deleteDoc(pendingRef)
        } else {
          await setDoc(pendingRef, { invites: stripUndefined(filtered) })
        }
      }
    }
}

/**
 * Get pending invites for a user.
 */
export async function getPendingInvites(userId: string): Promise<GroupInvite[]> {
  const snap = await getDoc(doc(db, 'users', userId, 'data', 'group-invites'))
  if (!snap.exists()) return []
  const invites: GroupInvite[] = snap.data().invites || []
  return invites.filter(i => i.status === 'pending')
}

/**
 * Get all invites for a group.
 */
export async function getGroupInvites(groupId: string): Promise<GroupInvite[]> {
  const snap = await getDocs(collection(db, 'groups', groupId, 'invites'))
  return snap.docs.map(d => d.data() as GroupInvite)
}
