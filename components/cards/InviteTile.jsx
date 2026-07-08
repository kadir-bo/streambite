"use client";

import { UserPlus } from "@phosphor-icons/react";

/**
 * InviteTile — Quadratische Kachel "Einladen" für VoiceChannelView.
 *
 * <InviteTile onClick={() => setInviteOpen(true)} />
 */
export default function InviteTile({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-deep border border-white/5 aspect-square cursor-pointer transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-center justify-center size-16 rounded-full border-2 border-zinc-600">
        <UserPlus weight="regular" className="text-2xl text-zinc-400" />
      </div>
      <span className="text-sm text-zinc-400">Einladen</span>
    </button>
  );
}
