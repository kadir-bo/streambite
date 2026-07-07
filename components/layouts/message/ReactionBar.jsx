"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toggleReaction } from "@/lib";

export default function ReactionBar({
  reactions,
  messageId,
  serverId,
  channelId,
  userId,
}) {
  const [pending, setPending] = useState(null);

  const entries = Object.entries(reactions ?? {}).filter(
    ([, v]) => (v?.count ?? 0) > 0,
  );
  if (entries.length === 0) return null;

  async function handleToggle(emoji, data) {
    if (pending) return;
    const hasReacted = (data?.users ?? []).includes(userId);
    setPending(emoji);
    try {
      await toggleReaction(
        serverId,
        channelId,
        messageId,
        emoji,
        userId,
        hasReacted,
      );
    } catch (e) {
      console.error(e);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {entries.map(([emoji, data]) => {
        const hasReacted = (data?.users ?? []).includes(userId);
        return (
          <motion.button
            key={emoji}
            whileTap={{ scale: 0.88 }}
            onClick={() => handleToggle(emoji, data)}
            disabled={!!pending}
            title={(data?.users ?? []).join(", ")}
            className={`inline-flex items-center gap-1.25 px-2 py-0.5 rounded-full text-sm font-medium text-zinc-400 transition-colors duration-100 ${
              pending === emoji ? "opacity-60" : "opacity-100"
            } ${pending ? "cursor-wait" : "cursor-pointer"} ${
              hasReacted
                ? "bg-white/12 border border-white/20"
                : "bg-zinc-800 border border-white/5"
            }`}
          >
            <span className="text-base">{emoji}</span>
            <span
              className={`text-xs ${hasReacted ? "text-zinc-100" : "text-zinc-500"}`}
            >
              {data?.count ?? 0}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
