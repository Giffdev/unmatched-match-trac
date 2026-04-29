import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export type DiscoveredUser = {
  uid: string
  displayName: string
  playerName?: string
  email: string
}

/**
 * Search for a user by exact email match.
 */
export async function searchUserByEmail(email: string): Promise<DiscoveredUser | null> {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('email', '==', email.toLowerCase().trim()))
  const snap = await getDocs(q)

  if (snap.empty) return null
  const doc = snap.docs[0]
  const data = doc.data()
  return {
    uid: doc.id,
    displayName: data.displayName || data.name || '',
    playerName: data.playerName,
    email: data.email,
  }
}

/**
 * Search for users by playerName prefix (case-insensitive).
 * Requires a `playerNameLower` field in user docs for the range query.
 */
export async function searchUserByPlayerName(prefix: string): Promise<DiscoveredUser[]> {
  if (!prefix || prefix.length < 2) return []

  const lowerPrefix = prefix.toLowerCase().trim()
  const endPrefix = lowerPrefix + '\uf8ff' // Firestore range trick for prefix matching

  const usersRef = collection(db, 'users')
  const q = query(
    usersRef,
    where('playerNameLower', '>=', lowerPrefix),
    where('playerNameLower', '<=', endPrefix)
  )
  const snap = await getDocs(q)

  return snap.docs.map(doc => {
    const data = doc.data()
    return {
      uid: doc.id,
      displayName: data.displayName || data.name || '',
      playerName: data.playerName,
      email: data.email,
    }
  })
}
