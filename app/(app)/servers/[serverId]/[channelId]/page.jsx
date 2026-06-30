'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth, useServer, useLayout } from '@/context'
import { markRead } from '@/lib'
import { ChannelHeader, MessageList, MessageInput } from '@/components'
import VoiceChannelView from '@/components/voice/VoiceChannelView'

export default function ChannelPage() {
  const { serverId, channelId } = useParams()
  const { firebaseUser } = useAuth()
  const { channels, servers, showMembers, toggleMembers } = useServer()
  const { showContent } = useLayout()
  const [replyTarget, setReplyTarget] = useState(null)

  const channel = channels.find((ch) => ch.id === channelId)
  const isVoice = channel?.type === 'voice'
  const server = servers.find((s) => s.id === serverId)
  const isOwner = server?.ownerId === firebaseUser?.uid

  useEffect(() => {
    if (firebaseUser && channelId && !isVoice) markRead(firebaseUser.uid, channelId).catch(console.error)
  }, [firebaseUser, channelId, isVoice])

  // On mobile, opening a channel switches from the list pane to this content pane.
  useEffect(() => {
    showContent()
  }, [channelId, showContent])

  return (
    <div
      className="flex-1 flex flex-col min-w-0 overflow-hidden bg-(--surface-base)"
    >
      <ChannelHeader
        channel={channel}
        showMembers={showMembers}
        onToggleMembers={toggleMembers}
      />

      {isVoice ? (
        channel && (
          <VoiceChannelView serverId={serverId} channel={channel} isOwner={isOwner} />
        )
      ) : (
        <>
          <MessageList
            serverId={serverId}
            channelId={channelId}
            channel={channel}
            onReply={setReplyTarget}
          />

          <MessageInput
            serverId={serverId}
            channelId={channelId}
            channel={channel}
            replyTarget={replyTarget}
            onCancelReply={() => setReplyTarget(null)}
          />
        </>
      )}
    </div>
  )
}
