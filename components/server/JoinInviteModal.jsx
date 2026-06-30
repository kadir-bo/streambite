'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { acceptServerInvite, declineServerInvite } from '@/lib'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import ServerIcon from '@/components/server/ServerIcon'

export default function JoinInviteModal({ open, onClose, invite }) {
  const { firebaseUser } = useAuth()
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [declining, setDeclining] = useState(false)

  async function handleJoin() {
    if (!firebaseUser || !invite) return
    setJoining(true)
    try {
      const serverId = await acceptServerInvite(firebaseUser.uid, invite)
      onClose()
      router.push(`/servers/${serverId}`)
    } catch (err) {
      console.error('[invite] join failed:', err.code, err.message)
    } finally {
      setJoining(false)
    }
  }

  async function handleDecline() {
    if (!firebaseUser || !invite) return
    setDeclining(true)
    try {
      await declineServerInvite(firebaseUser.uid, invite.serverId)
      onClose()
    } catch (err) {
      console.error('[invite] decline failed:', err.code, err.message)
    } finally {
      setDeclining(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Servereinladung" maxWidth={400}>
      <div className="flex flex-col items-center gap-4 text-center">
        <ServerIcon name={invite?.serverName} iconUrl={invite?.serverIconUrl} size={64} />
        <div>
          <p className="text-lg font-semibold text-(--text-primary)">
            {invite?.serverName}
          </p>
          <p className="text-sm text-(--text-muted) mt-1">
            {invite?.invitedByName} hat dich zu diesem Server eingeladen
          </p>
        </div>

        <div className="flex gap-2.5 w-full mt-2">
          <Button variant="ghost" onClick={handleDecline} loading={declining} className="flex-1">
            Ablehnen
          </Button>
          <Button onClick={handleJoin} loading={joining} className="flex-1">
            Beitreten
          </Button>
        </div>
      </div>
    </Modal>
  )
}
