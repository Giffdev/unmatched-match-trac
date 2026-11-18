import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export interface User {
  id: string
  email: string
  name: string
  playerName?: string
  createdAt: string
  authProvider?: 'email' | 'google'
  displayName?: string
}

async function createUserDoc(firebaseUser: FirebaseUser, provider: 'email' | 'google') {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const existing = await getDoc(userRef)
  if (existing.exists()) return

  const emailUsername = firebaseUser.email?.split('@')[0] || 'User'
  const name = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1)

  await setDoc(userRef, {
    email: firebaseUser.email,
    name: firebaseUser.displayName || name,
    playerName: '',
    createdAt: new Date().toISOString(),
    authProvider: provider,
    displayName: firebaseUser.displayName || name,
  })
}

export async function createAccount(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await createUserDoc(credential.user, 'email')
  return credential.user
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const credential = await signInWithPopup(auth, provider)
  await createUserDoc(credential.user, 'google')
  return credential.user
}

export async function signOutUser() {
  await signOut(auth)
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}
