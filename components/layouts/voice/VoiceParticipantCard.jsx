"use client";

import { useState } from "react";
import { MicrophoneSlashIcon } from "@phosphor-icons/react";
import { useVoice } from "@/context";
import { Avatar } from "@/components";
import { cn } from "@/lib";

export default function VoiceParticipantCard({
  participant,
  isOwner,
  className = "",
}) {
  const { removeFromVoice } = useVoice();
  const [confirmRemove, setConfirmRemove] = useState(false);

  const isActiveSpeaker = participant.isSpeaking;
  const isMuted = participant.isMicMuted;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-deep border aspect-square p-4 w-full transition-all duration-200",
        isActiveSpeaker
          ? "border-green ring-2 ring-green/30"
          : "border-white/5",
        className,
      )}
    >
      <div className="flex flex-col gap-3 items-center justify-between w-full">
        <Avatar name={participant.name} size="xl" />
        <span className="text-sm font-medium text-white truncate">
          {participant.name}
          {participant.isLocal ? " (Du)" : ""}
        </span>
        {!isMuted && (
          <MicrophoneSlashIcon className="text-zinc-500 shrink-0" size={16} />
        )}
      </div>
    </div>
  );
}
