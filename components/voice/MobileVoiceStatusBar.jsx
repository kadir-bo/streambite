"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SpeakerHigh,
  Microphone,
  MicrophoneSlash,
  Headphones,
  PhoneDisconnect,
} from "@phosphor-icons/react";
import { useVoice } from "@/context";

// On desktop the persistent voice controls live in UserPanel, always visible
// in the sidebar. On mobile the sidebar is hidden while viewing the content
// pane (one-pane-at-a-time nav), so without this, anyone connected to voice
// while browsing a different channel would have no way to mute/leave. Shown
// only below md, and only while actually connected, and only away from the
// voice channel's own page (which already has its own full control toolbar).
export default function MobileVoiceStatusBar() {
  const { connection, muted, deafened, toggleMute, toggleDeafen, disconnect } = useVoice();
  const pathname = usePathname();

  if (connection.status !== "connected") return null;
  if (pathname === `/servers/${connection.serverId}/${connection.channelId}`) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-(--border-subtle) bg-(--surface-deep) px-3 py-2 md:hidden">
      <Link
        href={`/servers/${connection.serverId}/${connection.channelId}`}
        className="flex min-w-0 flex-1 items-center gap-2 no-underline"
      >
        <SpeakerHigh size={16} className="shrink-0 text-(--accent)" />
        <span className="truncate text-sm font-medium text-(--accent)">
          {connection.channelName ?? "Sprachkanal"}
        </span>
      </Link>

      <button
        onClick={toggleMute}
        title={muted ? "Stummschaltung aufheben" : "Stummschalten"}
        className={`flex size-9 shrink-0 items-center justify-center rounded-(--radius-base) border-none bg-transparent cursor-pointer ${
          muted ? "text-(--danger)" : "text-(--text-secondary)"
        }`}
      >
        {muted ? <MicrophoneSlash size={18} /> : <Microphone size={18} />}
      </button>
      <button
        onClick={toggleDeafen}
        title={deafened ? "Hörgerät aktivieren" : "Tauben schalten"}
        className={`flex size-9 shrink-0 items-center justify-center rounded-(--radius-base) border-none bg-transparent cursor-pointer ${
          deafened ? "text-(--danger)" : "text-(--text-secondary)"
        }`}
      >
        <Headphones size={18} />
      </button>
      <button
        onClick={disconnect}
        title="Sprachkanal verlassen"
        className="flex size-9 shrink-0 items-center justify-center rounded-(--radius-base) border-none bg-transparent text-(--danger) cursor-pointer"
      >
        <PhoneDisconnect size={18} />
      </button>
    </div>
  );
}
