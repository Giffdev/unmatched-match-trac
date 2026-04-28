import { createContext, useContext } from 'react'

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  name?: string
  playerName?: string
  authProvider?: 'email' | 'google'
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  refreshProfile?: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}
