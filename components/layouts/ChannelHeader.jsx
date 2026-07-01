"use client";

import {
  Hash,
  SpeakerHigh,
  UsersThree,
  CaretLeft,
} from "@phosphor-icons/react";
import { IconBtn } from "@/components";
import { useLayout } from "@/context";

const TYPE_ICON = { text: Hash, voice: SpeakerHigh };

export default function ChannelHeader({
  channel,
  showMembers,
  onToggleMembers,
}) {
  const Icon = TYPE_ICON[channel?.type] ?? Hash;
  const { showList } = useLayout();

  return (
    <header className="h-(--header-channel) bg-(--surface-base) border-b border-(--border-subtle) flex items-center px-4 gap-2 shrink-0">
      <IconBtn
        icon={CaretLeft}
        onClick={showList}
        title="Zurück"
        size="sm"
        mobileOnly
      />

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
        <IconBtn
          icon={UsersThree}
          onClick={onToggleMembers}
          title="Mitglieder"
          variant={showMembers ? "active" : "ghost"}
        />
      </div>
    </header>
  );
}
