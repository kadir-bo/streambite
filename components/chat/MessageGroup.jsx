'use client'

import Message from '@/components/chat/Message'

export default function MessageGroup({ group, serverId, channelId, onReply }) {
  return (
    <div>
      {group.messages.map((message, i) => (
        <Message
          key={message.id}
          message={message}
          isFirst={i === 0}
          serverId={serverId}
          channelId={channelId}
          onReply={onReply}
        />
      ))}
    </div>
  )
}
