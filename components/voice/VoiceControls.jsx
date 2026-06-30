"use client";

import {
  Microphone,
  MicrophoneSlash,
  Headphones,
  PhoneDisconnect,
  MonitorPlay,
} from "@phosphor-icons/react";
import { useVoice } from "@/context";
import IconBtn from "@/components/ui/IconBtn";

export default function VoiceControls() {
  const { muted, deafened, screenShare, toggleMute, toggleDeafen, toggleScreenShare, disconnect } =
    useVoice();

  return (
    <div className="flex items-center gap-2.5">
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
      />

      <IconBtn
        icon={MonitorPlay}
        onClick={toggleScreenShare}
        title={screenShare ? "Bildschirmfreigabe beenden" : "Bildschirm teilen"}
        size="xl"
        rounded="full"
        className={screenShare ? "bg-(--accent) text-white hover:opacity-90" : "bg-(--surface-raised) text-(--text-secondary) hover:bg-(--state-hover)"}
      />

      <IconBtn
        icon={PhoneDisconnect}
        onClick={disconnect}
        title="Sprachkanal verlassen"
        size="xl"
        rounded="full"
        variant="danger-solid"
      />
    </div>
  );
}
