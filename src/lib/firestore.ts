import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import type { Match } from './types'

// Strip undefined values from objects/arrays so Firestore doesn't throw
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
 * Runtime validation for a single match object from Firestore.
 * Returns true if the match has all required fields with correct types.
 */
export function validateMatch(entry: unknown): entry is Match {
  if (entry === null || typeof entry !== 'object') return false
  const m = entry as Record<string, unknown>
  return (
    typeof m.id === 'string' && m.id.length > 0 &&
    typeof m.date === 'string' &&
    typeof m.mapId === 'string' &&
    Array.isArray(m.players) && m.players.length > 0 &&
    typeof m.isDraw === 'boolean' &&
    typeof m.userId === 'string'
  )
}

/**
 * Validates an array of matches from Firestore. Filters out malformed entries
 * and logs warnings rather than crashing.
 */
function validateMatches(data: unknown): Match[] {
  if (!Array.isArray(data)) {
    console.warn('[Firestore] Expected matches array, got:', typeof data)
    return []
  }
  const valid: Match[] = []
  for (let i = 0; i < data.length; i++) {
    if (validateMatch(data[i])) {
      valid.push(data[i])
    } else {
      console.warn(`[Firestore] Skipping malformed match at index ${i}:`, data[i])
    }
  }
  return valid
}

// User matches stored at: users/{userId}/data/matches (as a document with a `matches` array field)
// User owned sets stored at: users/{userId}/data/owned-sets

export async function getUserMatches(userId: string): Promise<Match[]> {
  const docRef = doc(db, 'users', userId, 'data', 'matches')
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return []
  return validateMatches(docSnap.data().matches)
}

export async function setUserMatches(userId: string, matches: Match[]): Promise<void> {
  const docRef = doc(db, 'users', userId, 'data', 'matches')
  await setDoc(docRef, { matches: stripUndefined(matches) }, { merge: true })
}

export async function getUserOwnedSets(userId: string): Promise<string[]> {
  const docRef = doc(db, 'users', userId, 'data', 'owned-sets')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data().sets || []) : []
}

export async function setUserOwnedSets(userId: string, sets: string[]): Promise<void> {
  const docRef = doc(db, 'users', userId, 'data', 'owned-sets')
  await setDoc(docRef, { sets }, { merge: true })
}

export async function getAllUserMatches(): Promise<Match[]> {
  const usersSnap = await getDocs(collection(db, 'users'))
  const allMatches: Match[] = []

  for (const userDoc of usersSnap.docs) {
    const matchesRef = doc(db, 'users', userDoc.id, 'data', 'matches')
    const matchesSnap = await getDoc(matchesRef)
    if (matchesSnap.exists()) {
      const matches = validateMatches(matchesSnap.data().matches)
      allMatches.push(...matches)
    }
  }

  return allMatches
}

export async function getUserProfile(userId: string) {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? docSnap.data() : null
}

export async function updateUserProfile(userId: string, data: Record<string, any>): Promise<void> {
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, data)
}
