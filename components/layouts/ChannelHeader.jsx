"use client";

import {
  Hash,
  SpeakerHigh,
  UsersThree,
  CaretLeft,
  MonitorPlay,
} from "@phosphor-icons/react";
import { IconBtn, Topbar } from "@/components";
import { useLayout, useVoice } from "@/context";

const TYPE_ICON = { text: Hash, voice: SpeakerHigh };

export default function ChannelHeader({
  channel,
  showMembers,
  onToggleMembers,
}) {
  const Icon = TYPE_ICON[channel?.type] ?? Hash;
  const { showList } = useLayout();
  const { screenShare, toggleScreenShare } = useVoice();

  return (
    <Topbar className="gap-2 px-4">
      <IconBtn
        icon={CaretLeft}
        onClick={showList}
        title="Zurück"
        size="xl"
        mobileOnly
        className="bg-zinc-800!"
      />

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <Icon
          weight="regular"
          className="text-zinc-500 shrink-0 text-sm md:text-"
        />
        <div className="flex flex-col md:flex-row gap-0 md:gap-2 items-start">
          <span className="text-base font-semibold text-zinc-100 truncate">
            {channel?.name ?? "..."}
          </span>

          {channel?.topic && (
            <span className="text-xs md:text-sm text-zinc-500 truncate">
              {channel.topic}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {/* Screen-Share-Indikator: sichtbar wenn aktiv gestreamt wird */}
        {screenShare && (
          <IconBtn
            icon={MonitorPlay}
            onClick={toggleScreenShare}
            title="Bildschirmfreigabe beenden"
            size="xl"
            variant="active"
            className="bg-(--accent) !text-white"
          />
        )}

        <IconBtn
          icon={UsersThree}
          onClick={onToggleMembers}
          title="Mitglieder"
          size="xl"
          variant={showMembers ? "active" : "ghost"}
        />
      </div>
    </Topbar>
  );
}
