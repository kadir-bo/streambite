"use client";

import { useState } from "react";
import {
  SpeakerHigh,
  Warning,
  PhoneCall,
  PhoneDisconnect,
  CaretDown,
  CaretUp,
  UserPlus,
  UsersThree,
  MicrophoneSlash,
  Microphone,
  ArrowExpand,
  Pause,
} from "@phosphor-icons/react";
import { useVoice, useLayout } from "@/context";
import { Avatar, ScreenShareTile, InviteModal } from "@/components";

const MAX_VISIBLE = 4;

export default function VoiceChannelView({ serverId, channel, isOwner }) {
  const { connection, participants, screenShareHasAudio, connect, disconnect } = useVoice();
  const { showList } = useLayout();
  const [showAll, setShowAll] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const isThisChannel =
    connection.serverId === serverId && connection.channelId === channel.id;
  const status = isThisChannel ? connection.status : "idle";

  const visibleParticipants = showAll
    ? participants
    : participants.slice(0, MAX_VISIBLE);
  const hasHidden = participants.length > MAX_VISIBLE;
  const hiddenCount = participants.length - MAX_VISIBLE;

  const screenSharers = participants.filter(
    (p) => p.isScreenSharing && p.screenShareTrack,
  );
  const hasScreenShare = screenSharers.length > 0;
  const showAudioWarning =
    !screenShareHasAudio &&
    participants.some((p) => p.isLocal && p.isScreenSharing);

  const connectedElsewhere =
    connection.status === "connected" && !isThisChannel;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-surface-app">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          onClick={showList}
          className="flex items-center justify-center size-10 rounded-full border-none bg-surface-hover text-zinc-400 cursor-pointer transition-colors hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <SpeakerHigh weight="fill" className="text-white text-xl" />
          <span className="text-lg font-bold text-white">
            {channel?.name ?? "..."}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInviteOpen(true)}
            title="Freunde einladen"
            className="flex items-center justify-center size-10 rounded-full border-none bg-surface-hover text-zinc-400 cursor-pointer transition-colors hover:text-white"
          >
            <UserPlus weight="regular" className="text-xl" />
          </button>
          <button
            title="Mitglieder"
            className="flex items-center justify-center size-10 rounded-full border-none bg-surface-hover text-zinc-400 cursor-pointer transition-colors hover:text-white"
          >
            <UsersThree weight="regular" className="text-xl" />
          </button>
        </div>
      </div>

      {/* Error */}
      {connection.error && (status === "error" || status === "connected") && (
        <div className="mx-6 mb-2 shrink-0 flex max-w-md flex-col items-center gap-2.5 rounded-2xl border border-red-500 bg-red-500/10 px-5 py-4 text-center">
          <Warning size={22} className="text-red-500" />
          <p className="text-sm text-zinc-100">{connection.error}</p>
        </div>
      )}

      {status === "connected" ? (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 pb-28">
          {/* Audio Warning */}
          {showAudioWarning && (
            <div className="shrink-0 flex max-w-md items-center gap-3 rounded-2xl border border-yellow-500 bg-yellow-500/10 px-5 py-3 text-sm text-zinc-100">
              <Warning size={20} className="shrink-0 text-yellow-500" />
              <span>
                Kein Audio beim Teilen. Teile einen <strong>Chrome-Tab</strong>{" "}
                und aktiviere <strong>&bdquo;Tab-Audio teilen&ldquo;</strong> im Dialog.
              </span>
            </div>
          )}

          {/* Screen Share */}
          {hasScreenShare && (
            <div className="flex-1 min-h-0 rounded-2xl overflow-hidden bg-surface-deep">
              {screenSharers.map((p) => (
                <ScreenShareTile
                  key={`${p.identity}-screen`}
                  participant={p}
                />
              ))}
            </div>
          )}

          {/* Participant Grid */}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(Math.max(Math.ceil(Math.sqrt(visibleParticipants.length + 1)), 2), 2)}, 1fr)`,
            }}
          >
            {visibleParticipants.map((p) => (
              <VoiceParticipantCard
                key={p.identity}
                participant={p}
                isOwner={isOwner}
              />
            ))}

            {/* Einladen Card */}
            <button
              onClick={() => setInviteOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-deep border border-white/5 aspect-square cursor-pointer transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-center justify-center size-16 rounded-full border-2 border-zinc-600">
                <UserPlus weight="regular" className="text-2xl text-zinc-400" />
              </div>
              <span className="text-sm text-zinc-400">Einladen</span>
            </button>
          </div>

          {/* Show more/less */}
          {hasHidden && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="shrink-0 flex cursor-pointer items-center justify-center gap-1.5 self-center rounded-2xl border border-white/5 bg-surface-deep px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-surface-hover"
            >
              {showAll ? (
                <><CaretUp size={14} /> Weniger anzeigen</>
              ) : (
                <><CaretDown size={14} /> {hiddenCount} weitere anzeigen</>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-6">
          <button
            onClick={() => connect(serverId, channel.id, channel.name)}
            disabled={status === "connecting"}
            className="flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-base font-semibold text-white border-none cursor-pointer hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <PhoneCall />
            {status === "connecting"
              ? "Verbinde…"
              : `${channel.name} beitreten`}
          </button>
        </div>
      )}

      {/* Floating Voice Controls */}
      {status === "connected" && (
        <div className="absolute flex items-center justify-center gap-2 bottom-4 left-0 right-0 px-4">
          <div className="flex items-center gap-2 rounded-3xl bg-surface-deep p-3">
            <button
              type="button"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-hover text-white border-none cursor-pointer transition-colors hover:bg-surface-raised"
            >
              <SpeakerHigh weight="regular" className="text-xl" />
            </button>
            <button
              type="button"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red text-white border-none cursor-pointer transition-colors hover:bg-red-hover"
            >
              <MicrophoneSlash weight="regular" className="text-xl" />
            </button>
            <button
              type="button"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-hover text-white border-none cursor-pointer transition-colors hover:bg-surface-raised"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
            </button>
            <button
              type="button"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-hover text-white border-none cursor-pointer transition-colors hover:bg-surface-raised"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={disconnect}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red text-white border-none cursor-pointer transition-colors hover:bg-red-hover"
            >
              <PhoneDisconnect weight="regular" className="text-xl" />
            </button>
          </div>
        </div>
      )}

      {/* Connected elsewhere */}
      {connectedElsewhere && (
        <div className="absolute flex items-center gap-2 bottom-4 left-1/2 -translate-x-1/2 rounded-2xl border border-white/5 bg-surface-deep px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          <SpeakerHigh weight="fill" className="size-4 text-[#8a38f5]" />
          <span className="text-xs text-zinc-400 whitespace-nowrap">
            Verbunden mit <span className="text-zinc-200 font-medium">{connection.channelName}</span>
          </span>
          <button
            onClick={disconnect}
            title="Sprachkanal verlassen"
            className="flex items-center justify-center size-8 rounded-full bg-red text-white border-none cursor-pointer hover:bg-red-hover"
          >
            <PhoneDisconnect size={14} />
          </button>
        </div>
      )}

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        server={{ id: serverId }}
      />
    </div>
  );
}

function VoiceParticipantCard({ participant, isOwner }) {
  const { removeFromVoice } = useVoice();
  const [confirmRemove, setConfirmRemove] = useState(false);

  const isActiveSpeaker = participant.isSpeaking;
  const isMuted = participant.isMicMuted;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-deep border aspect-square p-4 transition-all duration-200 ${
        isActiveSpeaker
          ? "border-[#4ac263] shadow-[0_0_0_2px_rgba(74,194,99,0.3)]"
          : "border-white/5"
      }`}
    >
      <div className="relative">
        <Avatar name={participant.name} size="xl" />
      </div>

      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium text-white truncate">
          {participant.name}
          {participant.isLocal ? " (Du)" : ""}
        </span>
        {isMuted ? (
          <MicrophoneSlash className="text-zinc-500 shrink-0" size={16} />
        ) : (
          <div className="size-2 rounded-full bg-[#4ac263] shrink-0" />
        )}
      </div>
    </div>
  );
}
