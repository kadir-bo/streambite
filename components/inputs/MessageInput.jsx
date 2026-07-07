"use client";

import { useState, useRef, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { Plus, PaperPlaneTilt, X, Prohibit } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import {
  sendMessage,
  uploadAttachment,
  formatBytes,
  touchDmLastMessage,
  touchChannelLastMessage,
  markRead,
  cn,
} from "@/lib";
import { EmojiPicker, ReplyPreview, IconBtn } from "@/components";
import { useIsDesktop } from "@/hooks";

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
  const isDesktop = useIsDesktop();
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
    // Desktop: Enter sendet, Shift+Enter = neue Zeile
    // Mobile: Enter = neue Zeile (kein Senden ohne physische Tastatur)
    if (e.key === "Enter" && !e.shiftKey && isDesktop) {
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
        <div className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-zinc-800 px-4 py-3 text-sm text-zinc-500">
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
          className={`flex flex-wrap gap-2 border-b border-white/5 bg-zinc-800 px-3.5 py-2.5 ${replyTarget ? "rounded-none" : "rounded-t-lg"}`}
        >
          {attachments.map((att, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg border border-white/5 bg-(--surface-deep)"
            >
              {att.preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.preview}
                    alt={att.file.name}
                    className="block size-20 object-cover"
                  />
                </>
              ) : (
                <div className="flex size-20 flex-col items-center justify-center gap-1 p-2">
                  <Paperclip className="text-zinc-500 text-xl md:text-lg" />
                  <span className="break-all text-center text-2xs leading-tight text-zinc-500">
                    {att.file.name}
                  </span>
                  <span className="text-2xs text-zinc-600">
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

      {/* Input container — Figma Design */}
      <div
        className={`flex items-start gap-3 border border-white/5 bg-surface-deep min-h-14 pt-1 pr-1 ${replyTarget || attachments.length > 0 ? "rounded-b-2xl" : "rounded-2xl"}`}
      >
        {/* Attach / Plus icon */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Datei anhängen"
          className="flex shrink-0 items-center justify-center size-12 border-none bg-transparent text-zinc-400 cursor-pointer transition-colors hover:text-zinc-200"
        >
          <Plus weight="regular" className="text-2xl" />
        </button>
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
              ? `Schreib etwas in #${channel?.name ?? "…"}`
              : `Nachricht an ${channel?.name ?? "…"}`
          }
          rows={1}
          disabled={pending}
          className={cn(
            "flex-1 self-stretch resize-none border-none bg-transparent text-[15px] leading-normal outline-none max-h-[30vh] overflow-y-auto py-3.5 placeholder:text-zinc-500",
          )}
        />

        {/* Send button — always visible */}
        <button
          type="button"
          onClick={handleSend}
          title="Senden"
          disabled={!hasContent || pending}
          className={`bg-white text-black hover:bg-zinc-200 flex shrink-0 items-center justify-center size-11 rounded-xl border-none cursor-pointer transition-all duration-150 ${
            hasContent ? "opacity-100" : "opacity-0"
          }`}
        >
          {pending ? (
            <span className="block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <PaperPlaneTilt weight="fill" className="text-lg" />
          )}
        </button>
      </div>

      {uploadError && (
        <p className="mt-1.5 px-1 text-(--text-xs)">{uploadError}</p>
      )}
    </div>
  );
}
