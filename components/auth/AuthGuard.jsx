'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { UsernamePromptModal } from '@/components'

export default function AuthGuard({ children }) {
  const { firebaseUser, userDoc, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace('/login')
    }
  }, [loading, firebaseUser, router])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950">
        <div className="size-6 rounded-full animate-spin border-2 border-white/10 border-t-zinc-400" />
      </div>
    )
  }

  if (!firebaseUser) return null

  const needsUsername = !!userDoc && !userDoc.username

  return (
    <>
      {children}
      <UsernamePromptModal
        open={needsUsername}
        uid={firebaseUser.uid}
        tag={userDoc?.tag}
        onDone={() => {}}
      />
    </>
  )
}
