'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowDown } from '@phosphor-icons/react'
import { groupMessages } from '@/lib'
import { useMessages } from '@/hooks'
import ChannelWelcome from '@/components/chat/ChannelWelcome'
import MessageGroup from '@/components/chat/MessageGroup'

export default function MessageList({ serverId, channelId, channel, dmUser, onReply }) {
  const { messages, loading } = useMessages(serverId, channelId)
  const groups = groupMessages(messages)

  const containerRef = useRef(null)
  const bottomRef = useRef(null)
  const isAtBottomRef = useRef(true)
  const prevCountRef = useRef(0)
  const [showNewMsg, setShowNewMsg] = useState(false)

  // Track whether user is at bottom
  function handleScroll() {
    const el = containerRef.current
    if (!el) return
    const threshold = 80
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    if (isAtBottomRef.current) setShowNewMsg(false)
  }

  function scrollToBottom(behavior = 'smooth') {
    bottomRef.current?.scrollIntoView({ behavior })
  }

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom('instant')
      prevCountRef.current = messages.length
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // React to new messages
  useEffect(() => {
    if (messages.length <= prevCountRef.current) {
      prevCountRef.current = messages.length
      return
    }

    const newMsg = messages[messages.length - 1]
    const isOwnMessage = newMsg?.authorId && typeof window !== 'undefined' &&
      // We detect own by checking if we scrolled to bottom recently (approximate)
      isAtBottomRef.current

    if (isAtBottomRef.current) {
      scrollToBottom('smooth')
    } else {
      setShowNewMsg(true)
    }

    prevCountRef.current = messages.length
  }, [messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto flex flex-col"
      >
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="size-6 rounded-full border-2 border-(--border-default) border-t-(--text-muted) [animation:spin_0.7s_linear_infinite] block" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-end">
            <ChannelWelcome channel={channel} dmUser={dmUser} />
          </div>
        ) : (
          <div className="pb-2">
            {/* Welcome at top */}
            <ChannelWelcome channel={channel} dmUser={dmUser} />

            {/* Message groups */}
            {groups.map((group) => (
              <MessageGroup
                key={group.id}
                group={group}
                serverId={serverId}
                channelId={channelId}
                onReply={onReply}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* New message indicator */}
      <AnimatePresence>
        {showNewMsg && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={() => { scrollToBottom('smooth'); setShowNewMsg(false) }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-(--surface-overlay) border border-(--border-default) rounded-(--radius-pill) text-sm font-medium text-(--text-primary) shadow-(--shadow-lg) cursor-pointer whitespace-nowrap"
          >
            <ArrowDown size={14} weight="bold" />
            Neue Nachricht
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
