"use client";

import { motion } from "motion/react";
import { ArrowBendUpLeft, X } from "@phosphor-icons/react";
import { replyPreview } from "@/lib";

export default function ReplyPreview({ target, onCancel }) {
  const preview = (target?.content ?? "").slice(0, 80);

  return (
    <motion.div
      variants={replyPreview}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3.5 py-1.5 bg-(--surface-raised) rounded-t-(--radius-base) border-b border-(--border-subtle)">
        <ArrowBendUpLeft className="text-(--text-muted) shrink-0 text-xl md:text-lg" />
        <span className="text-xs text-(--text-muted) flex-1 min-w-0 truncate">
          Antwort an{" "}
          <strong className="text-(--text-primary)">
            @{target?.authorName}
          </strong>
          {preview && (
            <span className="ml-1 text-(--text-ghost)">
              — {preview}
              {(target?.content?.length ?? 0) > 80 ? "…" : ""}
            </span>
          )}
        </span>
        <button
          onClick={onCancel}
          className="p-1 rounded-sm text-(--text-muted) flex items-center shrink-0 hover:text-(--text-primary) text-xl md:text-lg"
        >
          <X />
        </button>
      </div>
    </motion.div>
  );
}
