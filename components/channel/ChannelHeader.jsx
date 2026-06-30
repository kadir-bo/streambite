"use client";

import {
  Hash,
  SpeakerHigh,
  UsersThree,
  CaretLeft,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useLayout } from "@/context";

const TYPE_ICON = { text: Hash, voice: SpeakerHigh };

function HeaderIconBtn({ icon, title, onClick, active }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      title={title}
      onClick={onClick}
      className={`size-7 max-sm:size-10 rounded-(--radius-base) flex items-center justify-center border-none cursor-pointer text-xl md:text-lg ${
        active
          ? "text-(--text-primary) bg-(--state-active)"
          : "text-(--text-muted) bg-transparent hover:text-(--text-secondary) hover:bg-(--state-hover)"
      }`}
    >
      {icon}
    </motion.button>
  );
}

export default function ChannelHeader({
  channel,
  showMembers,
  onToggleMembers,
}) {
  const Icon = TYPE_ICON[channel?.type] ?? Hash;
  const { showList } = useLayout();

  return (
    <header className="h-(--header-channel) bg-(--surface-base) border-b border-(--border-subtle) flex items-center px-4 gap-2 shrink-0">
      <button
        onClick={showList}
        title="Zurück"
        className="flex size-7 max-sm:size-10 shrink-0 items-center justify-center rounded-(--radius-base) border-none bg-transparent text-(--text-muted) cursor-pointer md:hidden hover:bg-(--state-hover) hover:text-(--text-secondary) text-xl md:text-lg"
      >
        <CaretLeft />
      </button>

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Icon
          weight="regular"
          className="text-(--text-muted) shrink-0 text-sm md:text-"
        />
        <div className="flex flex-col md:flex-row gap-0 md:gap-2 items-center">
          <span className="text-base font-semibold text-(--text-primary) truncate">
            {channel?.name ?? "..."}
          </span>

          {channel?.topic && (
            <span className="text-xs md:text-sm text-(--text-muted) truncate">
              {channel.topic}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <HeaderIconBtn
          icon={<UsersThree />}
          title="Mitglieder"
          onClick={onToggleMembers}
          active={showMembers}
        />
      </div>
    </header>
  );
}
