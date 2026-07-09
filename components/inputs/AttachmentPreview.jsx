"use client";

import { Paperclip, X } from "@phosphor-icons/react";
import { formatBytes } from "@/lib";

export default function AttachmentPreview({ attachments, onRemove, replyTarget }) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-white/5 bg-surface-card px-3.5 py-2.5 rounded-t-lg">
      {attachments.map((att, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-lg border border-white/5 bg-(--surface-deep)"
        >
          {att.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={att.preview}
              alt={att.file.name}
              className="block size-20 object-cover"
            />
          ) : (
            <div className="flex size-20 flex-col items-center justify-center gap-1 p-2">
              <Paperclip className="text-zinc-500 text-xl" />
              <span className="break-all text-center text-2xs leading-tight text-zinc-500">
                {att.file.name}
              </span>
              <span className="text-2xs text-zinc-600">
                {formatBytes(att.file.size)}
              </span>
            </div>
          )}
          <button
            onClick={() => onRemove(i)}
            className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white"
          >
            <X className="text-xl" />
          </button>
        </div>
      ))}
    </div>
  );
}
