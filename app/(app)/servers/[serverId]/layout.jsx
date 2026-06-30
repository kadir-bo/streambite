'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useServer } from '@/context'
import { MemberSidebar } from '@/components'

export default function ServerLayout({ children }) {
  const { serverId } = useParams()
  const { setActiveServerId } = useServer()

  useEffect(() => {
    setActiveServerId(serverId)
    return () => setActiveServerId(null)
  }, [serverId, setActiveServerId])

  return (
    <>
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {children}
      </div>
      <MemberSidebar />
    </>
  )
}
