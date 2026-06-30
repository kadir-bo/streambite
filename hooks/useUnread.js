'use client'

import { useAuth } from '@/context'

export function useUnread() {
  const { userDoc } = useAuth()
  const lastRead = userDoc?.lastRead ?? {}

  function isUnread(threadId, lastMessageAt) {
    if (!lastMessageAt?.toMillis) return false
    const readAt = lastRead[threadId]
    if (!readAt?.toMillis) return true
    return lastMessageAt.toMillis() > readAt.toMillis()
  }

  return { isUnread }
}
