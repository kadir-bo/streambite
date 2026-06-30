"use client";

import { Hash, SpeakerHigh, UsersThree, CaretLeft } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useLayout } from "@/context";

const TYPE_ICON = { text: Hash, voice: SpeakerHigh };

function HeaderIconBtn({ icon, title, onClick, active }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      title={title}
      onClick={onClick}
      className={`w-7 h-7 rounded-(--radius-base) flex items-center justify-center border-none cursor-pointer ${
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
        className="flex size-7 shrink-0 items-center justify-center rounded-(--radius-base) border-none bg-transparent text-(--text-muted) cursor-pointer md:hidden hover:bg-(--state-hover) hover:text-(--text-secondary)"
      >
        <CaretLeft size={18} />
      </button>

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Icon
          size={20}
          weight="regular"
          className="text-(--text-muted) shrink-0"
        />
        <span className="text-base font-semibold text-(--text-primary) truncate">
          {channel?.name ?? "..."}
        </span>

        {channel?.topic && (
          <>
            <div className="w-px h-4.5 bg-(--border-default) shrink-0 mx-1" />
            <span className="text-sm text-(--text-muted) truncate">
              {channel.topic}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <HeaderIconBtn
          icon={<UsersThree size={18} />}
          title="Mitglieder"
          onClick={onToggleMembers}
          active={showMembers}
        />
      </div>
    </header>
  );
}
