"use client";

import {
  Microphone,
  MicrophoneSlash,
  Headphones,
  PhoneDisconnect,
  MonitorPlay,
} from "@phosphor-icons/react";
import { useVoice } from "@/context";

export default function VoiceControls() {
  const { muted, deafened, screenShare, toggleMute, toggleDeafen, toggleScreenShare, disconnect } =
    useVoice();

  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={toggleMute}
        title={muted ? "Stummschaltung aufheben" : "Stummschalten"}
        className={`flex size-10 items-center justify-center rounded-full border-none cursor-pointer ${
          muted
            ? "bg-(--danger) text-white"
            : "bg-(--surface-raised) text-(--text-secondary) hover:bg-(--state-hover)"
        }`}
      >
        {muted ? <MicrophoneSlash className="text-xl md:text-lg" /> : <Microphone className="text-xl md:text-lg" />}
      </button>

      <button
        onClick={toggleDeafen}
        title={deafened ? "Hörgerät aktivieren" : "Tauben schalten"}
        className={`flex size-10 items-center justify-center rounded-full border-none cursor-pointer ${
          deafened
            ? "bg-(--danger) text-white"
            : "bg-(--surface-raised) text-(--text-secondary) hover:bg-(--state-hover)"
        }`}
      >
        <Headphones className="text-xl md:text-lg" />
      </button>

      <button
        onClick={toggleScreenShare}
        title={screenShare ? "Bildschirmfreigabe beenden" : "Bildschirm teilen"}
        className={`flex size-10 items-center justify-center rounded-full border-none cursor-pointer ${
          screenShare
            ? "bg-(--accent) text-white"
            : "bg-(--surface-raised) text-(--text-secondary) hover:bg-(--state-hover)"
        }`}
      >
        <MonitorPlay className="text-xl md:text-lg" />
      </button>

      <button
        onClick={disconnect}
        title="Sprachkanal verlassen"
        className="flex size-10 items-center justify-center rounded-full border-none bg-(--danger) text-white cursor-pointer hover:opacity-90"
      >
        <PhoneDisconnect className="text-xl md:text-lg" />
      </button>
    </div>
  );
}
