"use client";

import { useState, useRef, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import {
  Paperclip,
  Smiley,
  PaperPlaneTilt,
  X,
  Prohibit,
} from "@phosphor-icons/react";
import { useAuth } from "@/context";
import {
  sendMessage,
  uploadAttachment,
  formatBytes,
  touchDmLastMessage,
  touchChannelLastMessage,
  markRead,
} from "@/lib";
import { EmojiPicker, ReplyPreview, IconBtn } from "@/components";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export default function MessageInput({
  serverId,
  channelId,
  channel,
  dmUser,
  replyTarget,
  onCancelReply,
}) {
  const { firebaseUser, userDoc } = useAuth();
  const iBlockedThem = !!(dmUser && userDoc?.blockedUsers?.includes(dmUser.id));
  const theyBlockedMe = !!(
    dmUser &&
    firebaseUser &&
    dmUser.blockedUsers?.includes(firebaseUser.uid)
  );
  const blocked = iBlockedThem || theyBlockedMe;
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [attachments, setAttachments] = useState([]); // { file, preview, error }
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  function resizeTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height =
      Math.min(el.scrollHeight, window.innerHeight * 0.3) + "px";
  }

  function handleChange(e) {
    setContent(e.target.value);
    resizeTextarea();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && replyTarget) {
      onCancelReply?.();
    }
  }

  function handleFiles(files) {
    setUploadError(null);
    const toAdd = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`"${file.name}" ist zu gro\u00df (max. 8 MB).`);
        continue;
      }
      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null;
      toAdd.push({
        file,
        preview,
        type: file.type.startsWith("image/") ? "image" : "file",
      });
    }
    setAttachments((prev) => [...prev, ...toAdd]);
  }

  function removeAttachment(i) {
    setAttachments((prev) => {
      const next = [...prev];
      if (next[i].preview) URL.revokeObjectURL(next[i].preview);
      next.splice(i, 1);
      return next;
    });
  }

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if ((!trimmed && attachments.length === 0) || pending) return;

    setPending(true);
    setUploadError(null);

    try {
      // Upload attachments first
      const uploadedAttachments = await Promise.all(
        attachments.map(async (att) => {
          const url = await uploadAttachment(serverId, channelId, att.file);
          return {
            url,
            type: att.type,
            name: att.file.name,
            size: att.file.size,
          };
        }),
      );

      const replyTo = replyTarget
        ? {
            messageId: replyTarget.id,
            authorId: replyTarget.authorId,
            authorName: replyTarget.authorName,
            authorAvatar: replyTarget.authorAvatar ?? null,
            content: (replyTarget.content ?? "").slice(0, 100),
          }
        : null;

      await sendMessage(serverId, channelId, {
        content: trimmed,
        authorId: firebaseUser.uid,
        authorName:
          userDoc?.displayName ?? firebaseUser.displayName ?? "Nutzer",
        authorAvatar: userDoc?.avatarUrl ?? null,
        type: replyTo ? "reply" : "default",
        replyTo,
        attachments: uploadedAttachments,
        reactions: {},
      });

      if (!serverId) {
        touchDmLastMessage(channelId, {
          content:
            trimmed ||
            (uploadedAttachments.length ? "\uD83D\uDCCE Anhang" : ""),
          authorId: firebaseUser.uid,
        }).catch(console.error);
      } else {
        touchChannelLastMessage(serverId, channelId).catch(console.error);
      }
      // Sending counts as having read up to this point \u2014 avoids the sender
      // immediately seeing their own thread marked unread.
      markRead(firebaseUser.uid, channelId).catch(console.error);

      setContent("");
      setAttachments([]);
      onCancelReply?.();

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (e) {
      console.error(e);
      setUploadError(
        "Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.",
      );
    } finally {
      setPending(false);
    }
  }, [
    content,
    attachments,
    pending,
    replyTarget,
    serverId,
    channelId,
    firebaseUser,
    userDoc,
    onCancelReply,
  ]);

  function insertEmoji(emoji) {
    setContent((prev) => prev + emoji);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  }

  const hasContent = content.trim().length > 0 || attachments.length > 0;

  if (blocked) {
    return (
      <div className="shrink-0 px-4 pb-5">
        <div className="flex items-center gap-2.5 rounded-(--radius-base) border border-(--border-subtle) bg-(--surface-raised) px-4 py-3 text-sm text-(--text-muted)">
          <Prohibit className="shrink-0 text-xl md:text-lg" />
          {iBlockedThem
            ? "Du hast diese Person blockiert. Entblocke sie, um wieder Nachrichten zu senden."
            : "Du kannst dieser Person keine Nachrichten senden."}
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 px-4 pb-5">
      <AnimatePresence>
        {replyTarget && (
          <ReplyPreview target={replyTarget} onCancel={onCancelReply} />
        )}
      </AnimatePresence>

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div
          className={`flex flex-wrap gap-2 border-b border-(--border-subtle) bg-(--surface-raised) px-3.5 py-2.5 ${replyTarget ? "rounded-none" : "rounded-t-(--radius-base)"}`}
        >
          {attachments.map((att, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-(--radius-base) border border-(--border-subtle) bg-(--surface-deep)"
            >
              {att.preview ? (
                <img
                  src={att.preview}
                  alt={att.file.name}
                  className="block size-20 object-cover"
                />
              ) : (
                <div className="flex size-20 flex-col items-center justify-center gap-1 p-2">
                  <Paperclip className="text-(--text-muted) text-xl md:text-lg" />
                  <span className="break-all text-center text-2xs leading-[1.2] text-(--text-muted)">
                    {att.file.name}
                  </span>
                  <span className="text-2xs text-(--text-ghost)">
                    {formatBytes(att.file.size)}
                  </span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <X className="text-xl md:text-lg" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container */}
      <div
        className={`flex items-end gap-2 p-1 mt-5 border border-(--border-subtle) bg-(--surface-raised) ${replyTarget || attachments.length > 0 ? "rounded-b-(--radius-base)" : "rounded-(--radius-base)"}`}
      >
        {/* Attach */}
        <IconBtn
          icon={Paperclip}
          onClick={() => fileInputRef.current?.click()}
          title="Datei anh\u00e4ngen"
          rounded="sm"
          className="hover:text-(--text-primary)"
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.txt,.zip"
          className="hidden"
          onChange={(e) => {
            handleFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            serverId
              ? `Schreib etwas in #${channel?.name ?? "\u2026"}`
              : `Nachricht an ${channel?.name ?? "\u2026"}`
          }
          rows={1}
          disabled={pending}
          className="flex-1 resize-none border-none bg-transparent pt-1 mb-0.5 text-(--text-base) leading-normal outline-none max-h-[30vh] overflow-y-auto"
        />

        {/* Emoji */}
        <div className="relative shrink-0">
          <IconBtn
            icon={Smiley}
            onClick={() => setEmojiOpen((v) => !v)}
            title="Emoji"
            rounded="sm"
            className="hover:text-(--text-primary)"
          />
          <AnimatePresence>
            {emojiOpen && (
              <EmojiPicker
                onSelect={insertEmoji}
                onClose={() => setEmojiOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Send */}
        <AnimatePresence>
          {hasContent && (
            <IconBtn
              icon={PaperPlaneTilt}
              onClick={handleSend}
              title="Senden"
              rounded="sm"
              variant="primary"
              disabled={pending}
              iconWeight="fill"
            >
              {pending && (
                <span className="block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
            </IconBtn>
          )}
        </AnimatePresence>
      </div>

      {uploadError && (
        <p className="mt-1.5 px-1 text-(--text-xs)">{uploadError}</p>
      )}
    </div>
  );
}
