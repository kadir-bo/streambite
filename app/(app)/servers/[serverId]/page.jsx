'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useServer } from '@/context'

export default function ServerDefaultPage() {
  const { serverId } = useParams()
  const { channels } = useServer()
  const router = useRouter()

  useEffect(() => {
    const firstText = channels.find((ch) => ch.type === 'text')
    if (firstText) {
      router.replace(`/servers/${serverId}/${firstText.id}`)
    }
  }, [channels, serverId, router])

  return (
    <div className="flex-1 flex items-center justify-center bg-(--surface-base)">
      <div className="size-6 rounded-full border-2 border-(--border-default) border-t-(--text-muted) animate-spin" />
    </div>
  )
}
