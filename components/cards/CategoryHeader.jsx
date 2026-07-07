"use client";

import { motion } from "motion/react";
import { CaretRight, Plus } from "@phosphor-icons/react";
import { springs } from "@/lib";

export default function CategoryHeader({
  category,
  isCollapsed,
  onToggle,
  isOwner,
  onAddChannel,
}) {
  return (
    <div
      onClick={onToggle}
      className="group flex items-center justify-between pt-4 pb-2 pl-4 pr-2 cursor-pointer select-none"
    >
      <div className="flex items-center gap-1">
        <motion.span
          animate={{ rotate: isCollapsed ? -90 : 0 }}
          transition={springs.snappy}
          className="flex text-zinc-500 shrink-0"
        >
          <CaretRight weight="bold" className="text-xs" />
        </motion.span>
        <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase transition-colors duration-100 group-hover:text-zinc-400">
          {category.name}
        </span>
      </div>

      {isOwner && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={(e) => {
            e.stopPropagation();
            onAddChannel?.(category);
          }}
          className="p-1 pr-3 bg-transparent border-none cursor-pointer rounded flex text-zinc-500 hover:text-zinc-400 transition-colors duration-100"
        >
          <Plus className="text-sm" />
        </motion.button>
      )}
    </div>
  );
}
