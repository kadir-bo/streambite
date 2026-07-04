"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Smiley,
  ArrowBendUpLeft,
  PencilSimple,
  Trash,
  DotsThree,
  Copy,
} from "@phosphor-icons/react";
import { messageActions, toggleReaction } from "@/lib";
import { EmojiPicker, ActionBtn, DropdownItem } from "@/components";

export default function MessageActions({
  message,
  serverId,
  channelId,
  userId,
  isOwn,
  onReply,
  onEdit,
  onDelete,
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    if (!moreOpen) return;
    function onOutside(e) {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [moreOpen]);

  function handleSelectEmoji(emoji) {
    const hasReacted = (message.reactions?.[emoji]?.users ?? []).includes(
      userId,
    );
    toggleReaction(
      serverId,
      channelId,
      message.id,
      emoji,
      userId,
      hasReacted,
    ).catch(console.error);
    setEmojiOpen(false);
  }

  function copyContent() {
    navigator.clipboard.writeText(message.content ?? "").catch(() => {});
    setMoreOpen(false);
  }

  return (
    <motion.div
      variants={messageActions}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="inline-flex items-center gap-0.5 bg-zinc-800 border border-white/10 rounded-[8px] px-1 py-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
    >
      {/* Emoji */}
      <div className="relative">
        <ActionBtn
          icon={Smiley}
          title="Reaktion hinzufügen"
          onClick={() => {
            setEmojiOpen((v) => !v);
            setMoreOpen(false);
          }}
        />
        <AnimatePresence>
          {emojiOpen && (
            <EmojiPicker
              onSelect={handleSelectEmoji}
              onClose={() => setEmojiOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Reply */}
      <ActionBtn icon={ArrowBendUpLeft} title="Antworten" onClick={onReply} />

      {/* Edit (own only) */}
      {isOwn && !message.deleted && (
        <ActionBtn icon={PencilSimple} title="Bearbeiten" onClick={onEdit} />
      )}

      {/* More */}
      <div className="relative" ref={moreRef}>
        <ActionBtn
          icon={DotsThree}
          title="Mehr"
          onClick={() => {
            setMoreOpen((v) => !v);
            setEmojiOpen(false);
          }}
        />
        <AnimatePresence>
          {moreOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.1 }}
              className="absolute top-[calc(100%+4px)] right-0 min-w-40 bg-zinc-800 border border-white/10 rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-[100] overflow-hidden p-1"
            >
              <DropdownItem
                icon={Copy}
                label="Nachricht kopieren"
                onClick={copyContent}
              />
              {isOwn && (
                <DropdownItem
                  icon={Trash}
                  label="Löschen"
                  onClick={() => {
                    setMoreOpen(false);
                    onDelete();
                  }}
                  danger
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
