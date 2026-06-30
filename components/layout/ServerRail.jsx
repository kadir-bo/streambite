'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { House, Plus } from '@phosphor-icons/react'
import { useAuth, useServer } from '@/context'
import RailButton from '@/components/layout/RailButton'
import PendingInviteButton from '@/components/layout/PendingInviteButton'
import JoinInviteModal from '@/components/server/JoinInviteModal'
import ServerIcon from '@/components/server/ServerIcon'

export default function ServerRail({ onOpenCreate }) {
  const pathname = usePathname()
  const { servers, activeServerId } = useServer()
  const { userDoc } = useAuth()
  const isDM = pathname.startsWith('/channels')
  const [activeInvite, setActiveInvite] = useState(null)
  const pendingInvites = userDoc?.pendingInvites ?? []

  return (
    <div className="flex w-12 shrink-0 flex-col items-stretch overflow-y-auto overflow-x-hidden bg-(--surface-deepest) pt-2 pb-2 border-r border-(--border-subtle)">
      <RailButton href="/channels" active={isDM} tooltip="Direktnachrichten">
        <House weight="fill" size={18} className={isDM ? 'text-(--text-primary)' : 'text-(--text-muted)'} />
      </RailButton>

      <div className="mx-auto my-1 h-px w-6 shrink-0 bg-(--border-default)" />

      {servers.map((server) => (
        <RailButton
          key={server.id}
          href={`/servers/${server.id}`}
          active={server.id === activeServerId}
          tooltip={server.name}
        >
          <ServerIcon name={server.name} iconUrl={server.iconUrl} size={34} />
        </RailButton>
      ))}

      {pendingInvites.map((invite) => (
        <PendingInviteButton key={invite.serverId} invite={invite} onOpen={setActiveInvite} />
      ))}

      <RailButton onClick={onOpenCreate} tooltip="Server erstellen oder beitreten">
        <Plus size={18} weight="bold" className="text-(--text-muted)" />
      </RailButton>

      <JoinInviteModal
        open={!!activeInvite}
        onClose={() => setActiveInvite(null)}
        invite={activeInvite}
      />
    </div>
  )
}
