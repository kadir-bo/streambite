"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SpeakerHigh,
  Microphone,
  MicrophoneSlash,
  MonitorPlay,
  PhoneDisconnect,
} from "@phosphor-icons/react";
import { useVoice } from "@/context";
import { IconBtn } from "@/components";

// On desktop the persistent voice controls live in UserPanel, always visible
// in the sidebar. On mobile the sidebar is hidden while viewing the content
// pane (one-pane-at-a-time nav), so without this, anyone connected to voice
// while browsing a different channel would have no way to mute/leave. Shown
// only below md, and only while actually connected, and only away from the
// voice channel's own page (which already has its own full control toolbar).
export default function MobileVoiceStatusBar() {
  const {
    connection,
    muted,
    screenShare,
    toggleMute,
    toggleScreenShare,
    disconnect,
  } = useVoice();
  const pathname = usePathname();

  if (connection.status !== "connected") return null;
  if (pathname === `/servers/${connection.serverId}/${connection.channelId}`) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-white/5 bg-(--surface-deep) px-3 py-2 pb-safe-2 md:hidden">
      <Link
        href={`/servers/${connection.serverId}/${connection.channelId}`}
        className="flex min-w-0 flex-1 items-center gap-2 no-underline"
      >
        <SpeakerHigh className="shrink-0 text-(--accent) text-xl md:text-lg" />
        <span className="truncate text-sm font-medium text-(--accent)">
          {connection.channelName ?? "Sprachkanal"}
        </span>
      </Link>

      <IconBtn
        icon={muted ? MicrophoneSlash : Microphone}
        onClick={toggleMute}
        title={muted ? "Stummschaltung aufheben" : "Stummschalten"}
        size="lg"
        variant={muted ? "danger" : "ghost"}
      />

      {/* Screen-Share-Button: nur sichtbar wenn aktiv gestreamt wird */}
      {screenShare && (
        <IconBtn
          icon={MonitorPlay}
          onClick={toggleScreenShare}
          title="Bildschirmfreigabe beenden"
          size="lg"
          className="bg-(--accent) text-white"
        />
      )}

      <IconBtn
        icon={PhoneDisconnect}
        onClick={disconnect}
        title="Sprachkanal verlassen"
        size="lg"
        variant="danger"
      />
    </div>
  );
}
