import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'
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

// --- Subcollection layer (new) ---

// Write a single match to subcollection
async function writeMatchToSubcollection(userId: string, match: Match): Promise<void> {
  const docRef = doc(db, 'users', userId, 'matches', match.id)
  await setDoc(docRef, stripUndefined(match))
}

// Delete a single match from subcollection
async function deleteMatchFromSubcollection(userId: string, matchId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'matches', matchId)
  await deleteDoc(docRef)
}

// Read all matches from subcollection
export async function getUserMatchesFromSubcollection(userId: string): Promise<Match[]> {
  const matchesRef = collection(db, 'users', userId, 'matches')
  const snap = await getDocs(matchesRef)
  const matches: Match[] = []
  for (const d of snap.docs) {
    const data = d.data()
    if (validateMatch(data)) {
      matches.push(data as Match)
    } else {
      console.warn(`[Firestore] Skipping invalid subcollection match ${d.id}`)
    }
  }
  return matches
}

// --- Migration state ---

export type MigrationState = 'legacy-only' | 'dual-write' | 'subcollection-primary' | 'cleanup-ready'

export async function getMigrationState(userId: string): Promise<MigrationState> {
  const metaRef = doc(db, 'users', userId, 'data', 'matches-meta')
  const snap = await getDoc(metaRef)
  if (!snap.exists()) return 'legacy-only'
  return (snap.data().migrationState as MigrationState) || 'legacy-only'
}

export async function setMigrationState(userId: string, state: MigrationState): Promise<void> {
  const metaRef = doc(db, 'users', userId, 'data', 'matches-meta')
  await setDoc(metaRef, { migrationState: state, updatedAt: new Date().toISOString() }, { merge: true })
}

// Admin utility — enable dual-write for a specific user
export async function enableDualWrite(userId: string): Promise<void> {
  await setMigrationState(userId, 'dual-write')
}

// --- Dual-write function ---

// Chunks an array into groups of `size` for batch processing
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * Diff-based sync: writes changes to subcollection alongside legacy full-array write.
 * Legacy write ALWAYS happens first. Subcollection is best-effort additive.
 */
export async function dualWriteMatches(
  userId: string,
  prevMatches: Match[],
  nextMatches: Match[]
): Promise<void> {
  // Always write legacy first (preserves current behavior exactly)
  await setUserMatches(userId, nextMatches)

  // Additionally write changes to subcollection
  try {
    const prevMap = new Map(prevMatches.map(m => [m.id, m]))
    const nextMap = new Map(nextMatches.map(m => [m.id, m]))

    const writes: Promise<void>[] = []

    // Find added or modified matches
    for (const [id, match] of nextMap) {
      const prev = prevMap.get(id)
      if (!prev || JSON.stringify(prev) !== JSON.stringify(match)) {
        writes.push(writeMatchToSubcollection(userId, match))
      }
    }

    // Find deleted matches
    for (const [id] of prevMap) {
      if (!nextMap.has(id)) {
        writes.push(deleteMatchFromSubcollection(userId, id))
      }
    }

    // Batch subcollection writes in chunks of 400 to stay under Firestore batch limit
    if (writes.length > 0) {
      const batches = chunk(writes, 400)
      for (const batch of batches) {
        await Promise.allSettled(batch)
      }
    }
  } catch (err) {
    // Subcollection writes are best-effort during dual-write phase
    // Legacy write already succeeded — data is safe
    console.warn('[Firestore] Subcollection dual-write failed (non-fatal):', err)
  }
}
