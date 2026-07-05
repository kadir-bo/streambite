"use client";

import {
  Microphone,
  MicrophoneSlash,
  Headphones,
  PhoneDisconnect,
  MonitorPlay,
} from "@phosphor-icons/react";
import { useVoice } from "@/context";
import { IconBtn } from "@/components";
import { cn } from "@/lib";

export default function VoiceControls({ compact = false }) {
  const {
    muted,
    deafened,
    screenShare,
    toggleMute,
    toggleDeafen,
    toggleScreenShare,
    disconnect,
  } = useVoice();

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <IconBtn
          icon={muted ? MicrophoneSlash : Microphone}
          onClick={toggleMute}
          title={muted ? "Stummschaltung aufheben" : "Stummschalten"}
          size="sm"
          rounded="full"
          variant={muted ? "danger" : "ghost"}
        />
        <IconBtn
          icon={PhoneDisconnect}
          onClick={disconnect}
          title="Sprachkanal verlassen"
          size="sm"
          rounded="full"
          variant="danger"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <IconBtn
        icon={muted ? MicrophoneSlash : Microphone}
        onClick={toggleMute}
        title={muted ? "Stummschaltung aufheben" : "Stummschalten"}
        size="xl"
        rounded="full"
        variant={muted ? "danger-solid" : "ghost"}
      />

      <IconBtn
        icon={Headphones}
        onClick={toggleDeafen}
        title={deafened ? "Hörgerät aktivieren" : "Tauben schalten"}
        size="xl"
        rounded="full"
        variant={deafened ? "danger-solid" : "ghost"}
        className="hidden md:flex"
      />

      <IconBtn
        icon={MonitorPlay}
        onClick={toggleScreenShare}
        title={screenShare ? "Bildschirmfreigabe beenden" : "Bildschirm teilen"}
        size="xl"
        rounded="full"
        className={cn(
          "hidden md:flex",
          screenShare
            ? "bg-(--accent) text-white hover:opacity-90"
            : "bg-zinc-800 text-zinc-400 hover:bg-white/5",
        )}
      />

      <IconBtn
        icon={PhoneDisconnect}
        onClick={disconnect}
        title="Sprachkanal verlassen"
        size="xl"
        rounded="full"
        variant="danger"
      />
    </div>
  );
}
