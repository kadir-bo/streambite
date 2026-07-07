"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SpeakerHigh,
  Microphone,
  MicrophoneSlash,
  Headphones,
  MonitorPlay,
  PhoneDisconnect,
} from "@phosphor-icons/react";
import { useVoice } from "@/context";

/**
 * MobileVoiceBar — Figma Design
 *
 * 5 runde Buttons in einer Zeile: Speaker, Mic, Headphones, Screen, Hangup
 * Container: rounded-2xl, bg #111119, padding 12px
 * Buttons: 48x48, fully round
 * Normal: bg #1c1c28, Muted/Hangup: bg #7d1021
 */
export default function MobileVoiceStatusBar() {
  const {
    connection,
    muted,
    deafened,
    screenShare,
    toggleMute,
    toggleDeafen,
    toggleScreenShare,
    disconnect,
  } = useVoice();
  const pathname = usePathname();

  if (connection.status !== "connected") return null;
  if (pathname === `/servers/${connection.serverId}/${connection.channelId}`) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center justify-center px-3 pb-2 pt-1 md:hidden">
      <div className="flex w-full max-w-md items-center justify-center gap-2 rounded-3xl bg-[#111119] p-3">
        {/* Speaker */}
        <Link
          href={`/servers/${connection.serverId}/${connection.channelId}`}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1c1c28] text-white no-underline transition-colors hover:bg-[#252535]"
        >
          <SpeakerHigh weight="regular" className="text-xl" />
        </Link>

        {/* Mic */}
        <button
          type="button"
          onClick={toggleMute}
          title={muted ? "Stummschaltung aufheben" : "Stummschalten"}
          className={`flex size-12 shrink-0 items-center justify-center rounded-full border-none cursor-pointer transition-all duration-150 ${
            muted
              ? "bg-[#7d1021] text-white hover:bg-[#9a1a2d]"
              : "bg-[#1c1c28] text-white hover:bg-[#252535]"
          }`}
        >
          {muted ? (
            <MicrophoneSlash weight="regular" className="text-xl" />
          ) : (
            <Microphone weight="regular" className="text-xl" />
          )}
        </button>

        {/* Headphones / Deafen */}
        <button
          type="button"
          onClick={toggleDeafen}
          title={deafened ? "Hörgerät aktivieren" : "Tauben schalten"}
          className={`flex size-12 shrink-0 items-center justify-center rounded-full border-none cursor-pointer transition-all duration-150 ${
            deafened
              ? "bg-[#7d1021] text-white hover:bg-[#9a1a2d]"
              : "bg-[#1c1c28] text-white hover:bg-[#252535]"
          }`}
        >
          <Headphones weight="regular" className="text-xl" />
        </button>

        {/* Screen Share */}
        <button
          type="button"
          onClick={toggleScreenShare}
          title={
            screenShare
              ? "Bildschirmfreigabe beenden"
              : "Bildschirm teilen"
          }
          className={`flex size-12 shrink-0 items-center justify-center rounded-full border-none cursor-pointer transition-all duration-150 ${
            screenShare
              ? "bg-[#8a38f5] text-white hover:bg-[#7a2de0]"
              : "bg-[#1c1c28] text-white hover:bg-[#252535]"
          }`}
        >
          <MonitorPlay weight="regular" className="text-xl" />
        </button>

        {/* Hangup */}
        <button
          type="button"
          onClick={disconnect}
          title="Sprachkanal verlassen"
          className="flex size-12 shrink-0 items-center justify-center rounded-full border-none cursor-pointer bg-[#7d1021] text-white transition-all duration-150 hover:bg-[#9a1a2d]"
        >
          <PhoneDisconnect weight="regular" className="text-xl" />
        </button>
      </div>
    </div>
  );
}
