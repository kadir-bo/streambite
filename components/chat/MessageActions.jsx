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
import EmojiPicker from "@/components/chat/EmojiPicker";

function ActionBtn({ icon: Icon, title, onClick, danger }) {
  return (
    <button
      title={title}
      onClick={onClick}
className={`size-8 max-sm:size-10 rounded-(--radius-base) flex items-center justify-center transition-colors duration-100 ${
          danger
            ? "text-(--danger) hover:bg-(--danger-subtle)"
            : "text-(--text-muted) hover:bg-(--state-hover) hover:text-(--text-primary)"
        }`}
      >
        <Icon weight="bold" className="text-xl md:text-lg" />
    </button>
  );
}

function DropdownItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-2.5 py-1.75 rounded-sm text-sm text-left transition-colors duration-100 ${
        danger
          ? "text-(--danger) hover:bg-(--danger-subtle)"
          : "text-(--text-secondary) hover:bg-(--state-hover) hover:text-(--text-primary)"
      }`}
    >
      <Icon weight="bold" className="text-xl md:text-lg" />
      {label}
    </button>
  );
}

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
      className="inline-flex items-center gap-0.5 bg-(--surface-raised) border border-(--border-default) rounded-(--radius-base) px-1 py-0.5 shadow-(--shadow-lg)"
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
              className="absolute top-[calc(100%+4px)] right-0 min-w-40 bg-(--surface-raised) border border-(--border-default) rounded-(--radius-base) shadow-(--shadow-lg) z-(--z-dropdown) overflow-hidden p-1"
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
