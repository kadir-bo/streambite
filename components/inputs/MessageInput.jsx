"use client";

import { useState, useRef, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { Plus, PaperPlaneTilt, Prohibit, Smiley } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { sendMessageWithAttachments } from "@/lib";
import {
  EmojiPicker,
  ReplyPreview,
  AttachmentPreview,
  Button,
} from "@/components";
import { useIsDesktop } from "@/hooks";
import { twMerge } from "tailwind-merge";

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
  const [attachments, setAttachments] = useState([]); // { file, preview }
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiBtnRef = useRef(null);

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
        setUploadError(`"${file.name}" ist zu groß (max. 8 MB).`);
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
      await sendMessageWithAttachments({
        serverId,
        channelId,
        content: trimmed,
        attachments,
        replyTarget,
        firebaseUser,
        userDoc,
      });

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
        <div className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-surface-card px-4 py-3 text-sm text-zinc-500">
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
      <AttachmentPreview
        attachments={attachments}
        onRemove={removeAttachment}
      />

      {/* Input container */}
      <div
        className={twMerge(
          "flex items-start gap-3 border border-white/5 bg-surface-deep min-h-14 pt-1 pr-1",
          replyTarget || attachments.length > 0
            ? "rounded-b-2xl"
            : "rounded-2xl",
        )}
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
          className={twMerge(
            "flex-1 self-stretch resize-none border-none bg-transparent text-base leading-normal outline-none max-h-[30vh] overflow-y-auto py-3.5 placeholder:text-zinc-500",
          )}
        />

        {/* Emoji button — opens popup on click */}
        <div className="relative">
          <button
            ref={emojiBtnRef}
            type="button"
            onClick={() => setEmojiOpen((v) => !v)}
            title="Emoji auswählen"
            className="flex shrink-0 items-center justify-center size-12 border-none bg-transparent text-zinc-400 cursor-pointer transition-colors hover:text-zinc-200"
          >
            <Smiley weight="regular" className="text-2xl" />
          </button>
          <AnimatePresence>
            {emojiOpen && (
              <EmojiPicker
                onSelect={insertEmoji}
                onClose={() => setEmojiOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          title="Senden"
          disabled={!hasContent || pending}
          className={twMerge(
            "flex shrink-0 items-center justify-center size-12 rounded-xl border-none transition-all duration-150",
            "font-semibold leading-none select-none",
            "bg-surface-raised text-white hover:brightness-110 shadow-xl shadow-black/20",
            hasContent ? "opacity-100" : "opacity-20 pointer-events-none",
            pending && "opacity-50 cursor-not-allowed",
          )}
        >
          {pending ? (
            <span className="block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <PaperPlaneTilt weight="fill" className="text-lg" />
          )}
        </button>
      </div>

      {uploadError && (
        <p className="mt-1.5 px-1 text-xs text-red-400">{uploadError}</p>
      )}
    </div>
  );
}
