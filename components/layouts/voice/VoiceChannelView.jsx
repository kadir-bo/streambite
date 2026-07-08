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
  CaretLeftIcon,
} from "@phosphor-icons/react";
import { useVoice, useLayout } from "@/context";
import {
  ScreenShareTile,
  InviteModal,
  VoiceControls,
  VoiceParticipantCard,
} from "@/components";
import { twMerge } from "tailwind-merge";

const MAX_VISIBLE = 4;

export default function VoiceChannelView({ serverId, channel, isOwner }) {
  const {
    connection,
    participants,
    screenShareHasAudio,
    muted,
    deafened,
    screenShare,
    connect,
    disconnect,
    toggleMute,
    toggleDeafen,
    toggleScreenShare,
  } = useVoice();
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
    (p) => p.isScreenSharing && (!p.isLocal || screenShare),
  );
  const hasScreenShare = screenSharers.length > 0;
  const showAudioWarning =
    !screenShareHasAudio &&
    participants.some((p) => p.isLocal && p.isScreenSharing);

  const connectedElsewhere =
    connection.status === "connected" && !isThisChannel;

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-surface-app">
      {/* Topbar */}
      {isConnected && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 md:hidden">
          <button
            onClick={showList}
            className="flex items-center justify-center size-10 rounded-full border-none bg-surface-hover text-zinc-400 cursor-pointer transition-colors hover:text-white"
          >
            <CaretLeftIcon className="text-xl" weight="regular" />
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
      )}
      {/* Error */}
      {connection.error && (status === "error" || isConnected) && (
        <div className="mx-6 mb-2 shrink-0 flex max-w-md flex-col items-center gap-2.5 rounded-2xl border border-red-500 bg-red-500/10 px-5 py-4 text-center">
          <Warning size={22} className="text-red-500" />
          <p className="text-sm text-zinc-100">{connection.error}</p>
        </div>
      )}

      {isConnected ? (
        <div
          className={
            hasScreenShare
              ? "flex flex-1 flex-col overflow-hidden px-4 py-4 pb-28"
              : "flex flex-1 flex-col overflow-y-auto px-4 py-4 pb-28"
          }
        >
          {/* Audio Warning */}
          {showAudioWarning && (
            <div className="shrink-0 flex max-w-md items-center gap-3 mb-4 rounded-2xl border border-yellow-500 bg-yellow-500/10 px-5 py-3 text-sm text-zinc-100">
              <Warning size={20} className="shrink-0 text-yellow-500" />
              <span>
                Kein Audio beim Teilen. Teile einen <strong>Chrome-Tab</strong>{" "}
                und aktiviere <strong>&bdquo;Tab-Audio teilen&ldquo;</strong> im
                Dialog.
              </span>
            </div>
          )}

          {/* Screen Share — echte Höhe durch flex-1 im non-scroll Parent */}
          {hasScreenShare && (
            <div className="flex-1 min-h-0 mb-4 rounded-2xl overflow-hidden bg-surface-deep">
              {screenSharers.map((p) => (
                <ScreenShareTile key={`${p.identity}-screen`} participant={p} />
              ))}
            </div>
          )}

          {hasScreenShare ? (
            /* === ScreenShare aktiv: unterer Bereich scrollbar === */
            <div className="shrink-0 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 justify-center max-w-lg mx-auto w-full items-center">
                {visibleParticipants.map((p) => (
                  <VoiceParticipantCard
                    key={p.identity}
                    participant={p}
                    isOwner={isOwner}
                  />
                ))}
                <button
                  onClick={() => setInviteOpen(true)}
                  className={twMerge(
                    "flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-deep border border-white/5 aspect-square cursor-pointer transition-colors hover:bg-surface-hover",
                  )}
                >
                  <div className="flex items-center justify-center size-16 rounded-full border-2 border-zinc-600">
                    <UserPlus weight="regular" className="text-2xl text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-400">Einladen</span>
                </button>
              </div>
              {hasHidden && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className={twMerge(
                    "mt-3 shrink-0 flex cursor-pointer items-center justify-center gap-1.5 self-center rounded-2xl border border-white/5 bg-surface-deep px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-surface-hover",
                  )}
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
            /* === Kein ScreenShare: Grid füllt Höhe (original) === */
            <>
              <div className="grid grid-cols-2 gap-3 justify-center max-w-lg mx-auto w-full h-full items-center">
                {visibleParticipants.map((p) => (
                  <VoiceParticipantCard
                    key={p.identity}
                    participant={p}
                    isOwner={isOwner}
                  />
                ))}
                <button
                  onClick={() => setInviteOpen(true)}
                  className={twMerge(
                    "flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface-deep border border-white/5 aspect-square cursor-pointer transition-colors hover:bg-surface-hover",
                  )}
                >
                  <div className="flex items-center justify-center size-16 rounded-full border-2 border-zinc-600">
                    <UserPlus weight="regular" className="text-2xl text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-400">Einladen</span>
                </button>
              </div>
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
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-6">
          <button
            onClick={() => connect(serverId, channel.id, channel.name)}
            disabled={isConnecting}
            className="flex items-center gap-2 rounded-2xl bg-surface-deep px-6 py-3 text-base font-semibold text-white cursor-pointer hover:bg-surface-hover disabled:opacity-60 disabled:cursor-not-allowed duration-100 border border-surface-border/5 hover:border-surface-border"
          >
            <PhoneCall weight="regular" className="text-xl" />
            {isConnecting ? "Verbinde…" : `${channel.name} beitreten`}
          </button>
        </div>
      )}

      {/* Floating Voice Controls */}
      {isConnected && (
        <VoiceControls
          muted={muted}
          deafened={deafened}
          screenShare={screenShare}
          onToggleMute={toggleMute}
          onToggleDeafen={toggleDeafen}
          onToggleScreenShare={toggleScreenShare}
          onDisconnect={disconnect}
        />
      )}

      {/* Connected elsewhere */}
      {connectedElsewhere && (
        <div className="absolute flex items-center gap-2 bottom-4 left-1/2 -translate-x-1/2 rounded-2xl border border-white/5 bg-surface-deep px-4 py-2 shadow-md">
          <SpeakerHigh weight="fill" className="size-4 text-accent" />
          <span className="text-xs text-zinc-400 whitespace-nowrap">
            Verbunden mit{" "}
            <span className="text-zinc-200 font-medium">
              {connection.channelName}
            </span>
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
