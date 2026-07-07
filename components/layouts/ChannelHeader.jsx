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
    <Topbar className="gap-3 px-4">
      <IconBtn
        icon={CaretLeft}
        onClick={showList}
        title="Zurück"
        size="xl"
        mobileOnly
        className="bg-[#1c1c28]!"
      />

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon
          weight="regular"
          className="text-zinc-500 shrink-0 text-base"
        />
        <div className="flex flex-col md:flex-row gap-0 md:gap-2 items-start">
          <span className="text-lg font-semibold text-white truncate">
            {channel?.name ?? "..."}
          </span>

          {channel?.topic && (
            <span className="text-xs md:text-sm text-zinc-500 truncate">
              {channel.topic}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Screen-Share-Indikator */}
        {screenShare && (
          <IconBtn
            icon={MonitorPlay}
            onClick={toggleScreenShare}
            title="Bildschirmfreigabe beenden"
            size="xl"
            variant="active"
            className="bg-[#1c1c28] !text-white"
          />
        )}

        <button
          type="button"
          onClick={onToggleMembers}
          title="Mitglieder"
          className={`flex items-center justify-center size-10 rounded-full border-none cursor-pointer transition-all duration-150 ${
            showMembers
              ? "bg-[#1c1c28] text-white"
              : "bg-transparent text-zinc-400 hover:bg-[#1c1c28] hover:text-white"
          }`}
        >
          <UsersThree weight="regular" className="text-xl" />
        </button>
      </div>
    </Topbar>
  );
}
