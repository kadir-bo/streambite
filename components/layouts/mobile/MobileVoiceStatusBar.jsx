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
import { ControlButton } from "@/components";

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
        <ControlButton
          danger={muted}
          onClick={toggleMute}
          title={muted ? "Stummschaltung aufheben" : "Stummschalten"}
        >
          {muted ? (
            <MicrophoneSlash weight="regular" className="text-xl" />
          ) : (
            <Microphone weight="regular" className="text-xl" />
          )}
        </ControlButton>

        {/* Headphones / Deafen */}
        <ControlButton
          danger={deafened}
          onClick={toggleDeafen}
          title={deafened ? "Hörgerät aktivieren" : "Tauben schalten"}
        >
          <Headphones weight="regular" className="text-xl" />
        </ControlButton>

        {/* Screen Share */}
        <ControlButton
          accent={screenShare}
          onClick={toggleScreenShare}
          title={screenShare ? "Bildschirmfreigabe beenden" : "Bildschirm teilen"}
        >
          <MonitorPlay weight="regular" className="text-xl" />
        </ControlButton>

        {/* Hangup */}
        <ControlButton
          danger
          onClick={disconnect}
          title="Sprachkanal verlassen"
        >
          <PhoneDisconnect weight="regular" className="text-xl" />
        </ControlButton>
      </div>
    </div>
  );
}
