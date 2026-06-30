'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeToAuthState, createUserDocument, getUserDocument, subscribeToUser, getInitials, setUsername, generateTag } from '@/lib'
import { usePresence } from '@/hooks'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined)
  const [userDoc, setUserDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  // Automatische Online/Offline-Präsenz
  usePresence({ firebaseUser, userDoc })

  useEffect(() => {
    // Safety net: if auth state never resolves (e.g. IndexedDB persistence
    // hanging on an insecure-origin mobile browser), stop showing an
    // infinite spinner so the user at least sees the login screen.
    const timeout = setTimeout(() => setLoading(false), 8000)

    const unsubscribeAuth = subscribeToAuthState(async (fbUser) => {
      clearTimeout(timeout)
      setFirebaseUser(fbUser)

      if (!fbUser) {
        setUserDoc(null)
        setLoading(false)
        return
      }

      // Auto-create Firestore doc if missing (e.g. registration failed mid-way, or first Google sign-in)
      const existing = await getUserDocument(fbUser.uid)
      if (!existing) {
        await createUserDocument(fbUser.uid, {
          displayName: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? 'Nutzer',
          email: fbUser.email,
          avatarUrl: fbUser.photoURL ?? null,
          initials: getInitials(fbUser.displayName ?? fbUser.email ?? '?'),
          username: null,
        })
      }

      const unsubscribeDoc = subscribeToUser(fbUser.uid, (doc) => {
        setUserDoc(doc)
        setLoading(false)

        // Self-heal legacy docs that already have a username but lost their tag
        // along the way (causes "username#undefined" in nameTag)
        if (doc && doc.username && !doc.tag) {
          setUsername(fbUser.uid, doc.username, generateTag())
        }
      })

      return () => unsubscribeDoc()
    })

    return () => {
      clearTimeout(timeout)
      unsubscribeAuth()
    }
  }, [])

  const value = {
    firebaseUser,
    userDoc,
    loading,
    isAuthenticated: !!firebaseUser && !loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
