"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { dropdown } from "@/lib";

const EMOJI_GROUPS = [
  {
    label: "Häufig",
    emojis: [
      "👍",
      "❤️",
      "😂",
      "😮",
      "😢",
      "😡",
      "🎉",
      "🙏",
      "👏",
      "🔥",
      "✅",
      "💯",
    ],
  },
  {
    label: "Gesichter",
    emojis: [
      "😀",
      "😎",
      "🤔",
      "🥳",
      "😴",
      "🤯",
      "😅",
      "🥺",
      "😤",
      "🤣",
      "😍",
      "🤩",
    ],
  },
  {
    label: "Sonstiges",
    emojis: [
      "💪",
      "🚀",
      "⭐",
      "💡",
      "🎯",
      "🙌",
      "💥",
      "✨",
      "🎮",
      "🎵",
      "💻",
      "🎨",
    ],
  },
];

export default function EmojiPicker({ onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    function onOutside(e) {
      if (!rootRef.current?.contains(e.target)) onCloseRef.current();
    }
    const tid = setTimeout(
      () => document.addEventListener("mousedown", onOutside),
      0,
    );
    return () => {
      clearTimeout(tid);
      document.removeEventListener("mousedown", onOutside);
    };
  }, []);

  const allEmojis = EMOJI_GROUPS.flatMap((g) => g.emojis);
  const groups = search.trim()
    ? [{ label: "Ergebnisse", emojis: allEmojis }]
    : EMOJI_GROUPS;

  return (
    <motion.div
      ref={rootRef}
      variants={dropdown}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="absolute bottom-[calc(100%+8px)] right-0 w-70 bg-(--surface-raised) border border-(--border-default) rounded-lg shadow-(--shadow-xl) z-(--z-dropdown) overflow-hidden"
    >
      <div className="px-2.5 py-2 border-b border-(--border-subtle)">
        <div className="flex items-center gap-1.5 bg-(--surface-deep) rounded-(--radius-base) p-2">
          <MagnifyingGlass className="text-(--text-muted) shrink-0 text-xl md:text-lg" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen…"
            className="flex-1 bg-transparent border-none outline-none text-sm text-(--text-primary)"
          />
        </div>
      </div>

      <div className="max-h-50 overflow-y-auto px-2 py-1.5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-2xs font-semibold text-(--text-muted) uppercase tracking-widest px-1 pt-1.5 pb-1">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-0.5">
              {group.emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSelect(emoji);
                    onClose();
                  }}
                  className="size-8 rounded-sm text-lg flex items-center justify-center transition-colors duration-100 hover:bg-(--state-hover)"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
