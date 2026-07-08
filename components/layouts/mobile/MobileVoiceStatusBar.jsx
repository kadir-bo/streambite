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
import { twMerge } from "tailwind-merge";
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
      <div className="flex w-full max-w-md items-center justify-center gap-2 rounded-3xl bg-surface-deep p-3">
        {/* Speaker */}
        <Link
          href={`/servers/${connection.serverId}/${connection.channelId}`}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-hover text-white no-underline transition-colors hover:bg-surface-raised"
        >
          <SpeakerHigh weight="regular" className="text-xl" />
        </Link>

        {/* Mic */}
        <button
          type="button"
          onClick={toggleMute}
          title={muted ? "Stummschaltung aufheben" : "Stummschalten"}
          className={twMerge(
            "flex size-12 shrink-0 items-center justify-center rounded-full border-none cursor-pointer transition-all duration-150",
            muted
              ? "bg-red text-white hover:bg-red-hover"
              : "bg-surface-hover text-white hover:bg-surface-raised",
          )}
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
          className={twMerge(
            "flex size-12 shrink-0 items-center justify-center rounded-full border-none cursor-pointer transition-all duration-150",
            deafened
              ? "bg-red text-white hover:bg-red-hover"
              : "bg-surface-hover text-white hover:bg-surface-raised",
          )}
        >
          <Headphones weight="regular" className="text-xl" />
        </button>

        {/* Screen Share */}
        <button
          type="button"
          onClick={toggleScreenShare}
          title={
            screenShare ? "Bildschirmfreigabe beenden" : "Bildschirm teilen"
          }
          className={twMerge(
            "flex size-12 shrink-0 items-center justify-center rounded-full border-none cursor-pointer transition-all duration-150",
            screenShare
              ? "bg-accent text-white hover:bg-accent-hover"
              : "bg-surface-hover text-white hover:bg-surface-raised",
          )}
        >
          <MonitorPlay weight="regular" className="text-xl" />
        </button>

        {/* Hangup */}
        <button
          type="button"
          onClick={disconnect}
          title="Sprachkanal verlassen"
          className="flex size-12 shrink-0 items-center justify-center rounded-full border-none cursor-pointer bg-red text-white transition-all duration-150 hover:bg-red-hover"
        >
          <PhoneDisconnect weight="regular" className="text-xl" />
        </button>
      </div>
    </div>
  );
}
