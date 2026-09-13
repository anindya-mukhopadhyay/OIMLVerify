import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { collections } from '../lib/firestoreCollections'
import { firebaseAuth, firestoreDb, isFirebaseConfigured } from '../lib/firebase'
import { demoUser } from '../data/demoData'
import type { UserProfile } from '../types/domain'
import { AuthContext, type AuthContextValue } from './authState'

const demoSessionKey = 'metriweigh-demo-session'

const mapFirebaseUser = async (user: User): Promise<UserProfile> => {
  if (firestoreDb) {
    const profile = await getDoc(doc(firestoreDb, collections.users, user.uid))

    if (profile.exists()) {
      return {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? user.email ?? 'MetriWeigh user',
        role: 'Viewer',
        ...profile.data(),
      } as UserProfile
    }
  }

  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email ?? 'MetriWeigh user',
    role: 'Viewer',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (firebaseAuth) {
      return null
    }

    return localStorage.getItem(demoSessionKey) === 'true' ? demoUser : null
  })
  const [loading, setLoading] = useState(Boolean(firebaseAuth))

  useEffect(() => {
    if (!firebaseAuth) {
      return undefined
    }

    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setLoading(true)
      setUser(firebaseUser ? await mapFirebaseUser(firebaseUser) : null)
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      firebaseEnabled: isFirebaseConfigured,
      login: async (email, password) => {
        if (!firebaseAuth) {
          localStorage.setItem(demoSessionKey, 'true')
          setUser({ ...demoUser, email })
          return
        }

        await signInWithEmailAndPassword(firebaseAuth, email, password)
      },
      logout: async () => {
        if (!firebaseAuth) {
          localStorage.removeItem(demoSessionKey)
          setUser(null)
          return
        }

        await signOut(firebaseAuth)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
