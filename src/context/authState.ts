import { createContext, useContext } from 'react'
import type { UserProfile } from '../types/domain'

export interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  firebaseEnabled: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return value
}
