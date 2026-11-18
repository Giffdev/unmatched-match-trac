import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Match } from './types'
import type { GroupMatch } from './group-types'

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

export type GetGroupMatchesOptions = {
  limit?: number
  startAfter?: QueryDocumentSnapshot
}

export type GetGroupMatchesResult = {
  matches: GroupMatch[]
  lastDoc: QueryDocumentSnapshot | null
}

/**
 * Get group matches with optional pagination.
 * Returns matches and the last document snapshot for cursor-based pagination.
 */
export async function getGroupMatches(
  groupId: string,
  options?: GetGroupMatchesOptions
): Promise<GetGroupMatchesResult> {
  const matchesRef = collection(db, 'groups', groupId, 'matches')

  const constraints: any[] = [orderBy('date', 'desc')]
  if (options?.limit) {
    constraints.push(firestoreLimit(options.limit))
  }
  if (options?.startAfter) {
    constraints.push(startAfter(options.startAfter))
  }

  const q = query(matchesRef, ...constraints)
  const snap = await getDocs(q)
  const matches = snap.docs.map(d => d.data() as GroupMatch)
  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
  return { matches, lastDoc }
}

/**
 * Update a group match. Only the original logger can update.
 */
export async function updateGroupMatch(
  groupId: string,
  matchId: string,
  updates: Partial<Match>,
  userId: string
): Promise<void> {
  const matchRef = doc(db, 'groups', groupId, 'matches', matchId)
  const snap = await getDoc(matchRef)

  if (!snap.exists()) throw new Error('Match not found')
  const matchData = snap.data() as GroupMatch
  if (matchData.loggedBy !== userId) {
    throw new Error('Only the original logger can update this match')
  }

  await updateDoc(matchRef, stripUndefined({ ...updates, updatedAt: new Date().toISOString() }))
}

/**
 * Delete a group match. Only the original logger can delete.
 */
export async function deleteGroupMatch(
  groupId: string,
  matchId: string,
  userId: string
): Promise<void> {
  const matchRef = doc(db, 'groups', groupId, 'matches', matchId)
  const snap = await getDoc(matchRef)

  if (!snap.exists()) throw new Error('Match not found')
  const matchData = snap.data() as GroupMatch
  if (matchData.loggedBy !== userId) {
    throw new Error('Only the original logger can delete this match')
  }

  await deleteDoc(matchRef)
}
