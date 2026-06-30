"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaretRight, Plus } from "@phosphor-icons/react";
import { springs } from "@/lib";
import ChannelItem from "@/components/channel/ChannelItem";

function CategoryHeader({
  category,
  isCollapsed,
  onToggle,
  isOwner,
  onAddChannel,
}) {
  return (
    <div
      onClick={onToggle}
      className="group flex items-center justify-between pt-3 pb-1 pl-4 pr-2 cursor-pointer select-none"
    >
      <div className="flex items-center gap-1">
        <motion.span
          animate={{ rotate: isCollapsed ? -90 : 0 }}
          transition={springs.snappy}
          className="flex text-(--text-ghost) shrink-0"
        >
          <CaretRight size={10} weight="bold" />
        </motion.span>
        <span className="text-2xs font-semibold tracking-widest text-(--text-muted) uppercase transition-colors duration-100 group-hover:text-(--text-secondary)">
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
          className="p-1 pr-3 bg-transparent border-none cursor-pointer rounded flex group-hover:text-(--text-muted) text-transparent hover:text-(--text-secondary) transition-colors duration-100"
        >
          <Plus size={14} />
        </motion.button>
      )}
    </div>
  );
}

export default function ChannelList({
  channels,
  categories,
  activeChannelId,
  isOwner,
  serverId,
  onAddChannel,
}) {
  const [collapsed, setCollapsed] = useState({});

  const channelsByCategory = useMemo(() => {
    const map = {};
    channels.forEach((ch) => {
      const key = ch.categoryId ?? "uncategorized";
      if (!map[key]) map[key] = [];
      map[key].push(ch);
    });
    return map;
  }, [channels]);

  const toggleCategory = (catId) =>
    setCollapsed((prev) => ({ ...prev, [catId]: !prev[catId] }));

  return (
    <div>
      {categories.map((cat) => {
        const catChannels = channelsByCategory[cat.id] ?? [];
        const isCollapsed = collapsed[cat.id] ?? false;

        return (
          <div key={cat.id}>
            <CategoryHeader
              category={cat}
              isCollapsed={isCollapsed}
              onToggle={() => toggleCategory(cat.id)}
              isOwner={isOwner}
              onAddChannel={onAddChannel}
            />

            <AnimatePresence initial={false}>
              {!isCollapsed &&
                catChannels.map((ch) => (
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    serverId={serverId}
                    isActive={ch.id === activeChannelId}
                    isOwner={isOwner}
                  />
                ))}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
