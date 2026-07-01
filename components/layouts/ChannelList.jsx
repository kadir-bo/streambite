"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "motion/react";
import { CategoryHeader, ChannelItem } from "@/components";

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
