import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import type { Match } from './types'

// User matches stored at: users/{userId}/data/matches (as a document with a `matches` array field)
// User owned sets stored at: users/{userId}/data/owned-sets

export async function getUserMatches(userId: string): Promise<Match[]> {
  const docRef = doc(db, 'users', userId, 'data', 'matches')
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data().matches || []) : []
}

export async function setUserMatches(userId: string, matches: Match[]): Promise<void> {
  const docRef = doc(db, 'users', userId, 'data', 'matches')
  await setDoc(docRef, { matches }, { merge: true })
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
      const matches = matchesSnap.data().matches || []
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
