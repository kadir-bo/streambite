"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowBendUpLeft } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { formatTime, editMessage, deleteMessage } from "@/lib";
import Avatar from "@/components/layout/Avatar";
import MessageActions from "@/components/chat/MessageActions";
import ReactionBar from "@/components/chat/ReactionBar";
import ConfirmModal from "@/components/modals/ConfirmModal";
import MarkdownText from "@/components/chat/MarkdownText";
import MessageContent from "@/components/chat/MessageContent";

export default function Message({
  message,
  isFirst,
  serverId,
  channelId,
  onReply,
}) {
  const { firebaseUser } = useAuth();
  const isOwn = firebaseUser?.uid === message.authorId;

  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content ?? "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editRef = useRef(null);

  // Auto-focus + resize edit textarea
  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
      editRef.current.setSelectionRange(
        editRef.current.value.length,
        editRef.current.value.length,
      );
    }
  }, [editing]);

  async function handleSaveEdit() {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === message.content) {
      setEditing(false);
      return;
    }
    setSavingEdit(true);
    try {
      await editMessage(serverId, channelId, message.id, trimmed);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingEdit(false);
    }
  }

  function handleEditKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      setEditing(false);
      setEditContent(message.content ?? "");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMessage(serverId, channelId, message.id);
      setConfirmDelete(false);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  const isDeleted = message.deleted;

  return (
    <>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        // Hover doesn't fire on touch devices, so the action bar would
        // otherwise be unreachable on mobile — a tap toggles it there too.
        onClick={() => setHovered((h) => !h)}
        className={`flex gap-4 relative hover:bg-(--state-hover) transition-colors duration-100 ${
          isFirst ? "px-4 pt-4 pb-0.5" : "px-4 py-0.5"
        }`}
      >
        {/* Avatar column */}
        <div className="w-10 shrink-0">
          {isFirst ? (
            <Avatar
              src={message.authorAvatar}
              name={message.authorName}
              size="md"
            />
          ) : (
            /* Inline timestamp for grouped messages */
            <AnimatePresence>
              {hovered && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="block text-right text-2xs font-mono text-(--text-ghost) pt-0.75 select-none"
                >
                  {formatTime(message.createdAt)}
                </motion.span>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          {/* Reply reference */}
          {message.type === "reply" && message.replyTo && (
            <div className="flex items-center gap-1.5 mb-1 text-xs text-(--text-muted) cursor-pointer">
              <ArrowBendUpLeft size={12} />
              <Avatar
                src={message.replyTo.authorAvatar}
                name={message.replyTo.authorName}
                size="xs"
              />
              <span className="font-medium text-(--text-secondary)">
                {message.replyTo.authorName}
              </span>
              <span className="max-w-75 truncate">
                {message.replyTo.content || "(Nachricht gelöscht)"}
              </span>
            </div>
          )}

          {/* Header (first message only) */}
          {isFirst && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-base font-semibold text-(--text-primary)">
                {message.authorName}
              </span>
              <span className="text-2xs text-(--text-ghost) font-mono">
                {formatTime(message.createdAt)}
              </span>
            </div>
          )}

          {/* Message body */}
          {isDeleted ? (
            <p className="text-base text-(--text-ghost) italic">
              (Nachricht gelöscht)
            </p>
          ) : editing ? (
            <div>
              <textarea
                ref={editRef}
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={handleEditKeyDown}
                disabled={savingEdit}
                className="w-full resize-none bg-(--surface-deep) border border-(--border-strong) rounded-(--radius-base) px-3 py-2 text-base text-(--text-primary) outline-none leading-normal min-h-10 overflow-y-hidden"
              />
              <p className="text-xs text-(--text-muted) mt-1">
                Enter zum Speichern · Escape zum Abbrechen
              </p>
            </div>
          ) : (
            <p className="text-base text-(--text-primary) leading-normal wrap-break-word">
              <MessageContent content={message.content} />
              {message.editedAt && !isDeleted && (
                <span className="text-2xs text-(--text-ghost) ml-1.5 italic">
                  (bearbeitet)
                </span>
              )}
            </p>
          )}

          {/* Attachments */}
          {(message.attachments ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachments.map((att, i) =>
                att.type === "image" ? (
                  <img
                    key={i}
                    src={att.url}
                    alt={att.name}
                    loading="lazy"
                    className="max-w-90 max-h-75 rounded-(--radius-base) border border-(--border-subtle) cursor-pointer object-cover block"
                    onClick={() => window.open(att.url, "_blank")}
                  />
                ) : (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-(--surface-raised) border border-(--border-subtle) rounded-(--radius-base) text-sm text-(--text-secondary) no-underline"
                  >
                    📎 {att.name}
                  </a>
                ),
              )}
            </div>
          )}

          {/* Reactions */}
          {!isDeleted && (
            <ReactionBar
              reactions={message.reactions}
              messageId={message.id}
              serverId={serverId}
              channelId={channelId}
              userId={firebaseUser?.uid}
            />
          )}
        </div>

        {/* Hover actions */}
        <AnimatePresence>
          {hovered && !editing && !isDeleted && (
            <div className="absolute -top-5 right-4 z-(--z-raised)">
              <MessageActions
                message={message}
                serverId={serverId}
                channelId={channelId}
                userId={firebaseUser?.uid}
                isOwn={isOwn}
                onReply={() => onReply?.(message)}
                onEdit={() => {
                  setEditing(true);
                  setEditContent(message.content ?? "");
                }}
                onDelete={() => setConfirmDelete(true)}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Nachricht löschen"
        description="Möchtest du diese Nachricht wirklich löschen? Dies kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        loading={deleting}
      />
    </>
  );
}
