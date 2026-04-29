import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthContext } from '@/hooks/use-auth'
import { getUserProfile } from '@/lib/firestore'
import { checkPendingEmailInvites } from '@/lib/group-invites'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (firebaseUser: any) => {
    if (!firebaseUser) {
      setUser(null)
      return
    }
    const profile = await getUserProfile(firebaseUser.uid)
    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      name: profile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      playerName: profile?.playerName,
      authProvider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
    })

    // Check for pending email invites and migrate them to UID-based
    if (firebaseUser.email) {
      try {
        await checkPendingEmailInvites(firebaseUser.email, firebaseUser.uid)
      } catch (err) {
        console.error('Failed to check pending email invites:', err)
      }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const firebaseUser = auth.currentUser
    if (firebaseUser) {
      await loadProfile(firebaseUser)
    }
  }, [loadProfile])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await loadProfile(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [loadProfile])

  return (
    <AuthContext.Provider value={{ user, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
