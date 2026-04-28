import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  linkWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
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

export interface AuthSession {
  userId: string
  email: string
  authProvider?: 'email' | 'google'
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

export function getCurrentSession(): Promise<AuthSession | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      if (user) {
        resolve({
          userId: user.uid,
          email: user.email || '',
          authProvider: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
        })
      } else {
        resolve(null)
      }
    })
  })
}

export async function linkEmailPassword(password: string) {
  const user = auth.currentUser
  if (!user || !user.email) throw new Error('No authenticated user')

  const credential = EmailAuthProvider.credential(user.email, password)
  await linkWithCredential(user, credential)
}

export function getLinkedProviders(): string[] {
  const user = auth.currentUser
  if (!user) return []
  return user.providerData.map((p) => p.providerId)
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}
