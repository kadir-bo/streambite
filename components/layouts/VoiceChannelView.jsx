"use client";

import { useState } from "react";
import {
  SpeakerHigh,
  Warning,
  PhoneCall,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { useVoice } from "@/context";
import { ParticipantTile, VoiceControls, ScreenShareTile } from "@/components";

// Connection lives in VoiceContext, not here - staying connected when the
// user navigates to another channel/DM (and showing a floating bar) is the
// whole point, so this view must NOT disconnect on unmount.
const MAX_VISIBLE = 4;

export default function VoiceChannelView({ serverId, channel, isOwner }) {
  const { connection, participants, screenShareHasAudio, connect } = useVoice();
  const [showAll, setShowAll] = useState(false);
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

  return (
    <div className="relative flex flex-1 pt-4 flex-col overflow-hidden bg-zinc-900">
      {/* Header - immer sichtbar */}
      {connection.error && (status === "error" || status === "connected") && (
        <div className="mx-6 mb-2 shrink-0 flex max-w-md flex-col items-center gap-2.5 rounded-[8px] border border-red-500 bg-red-500/10 px-5 py-4 text-center">
          <Warning size={22} className="text-red-500" />
          <p className="text-sm text-zinc-100">{connection.error}</p>
        </div>
      )}

      {status === "connected" ? (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden px-6 pb-28">
          {/* Warnung bei Screen-Share ohne Audio */}
          {showAudioWarning && (
            <div className="shrink-0 flex max-w-md items-center gap-3 rounded-[8px] border border-(--warning) bg-(--warning-subtle) px-5 py-3 text-sm text-zinc-100">
              <Warning size={20} className="shrink-0 text-(--warning)" />
              <span>
                Kein Audio beim Teilen. Teile einen <strong>Chrome-Tab</strong>{" "}
                und aktiviere <strong>&bdquo;Tab-Audio teilen&ldquo;</strong> im Dialog.
              </span>
            </div>
          )}

          {hasScreenShare ? (
            <>
              {/* Screen-Share nimmt den verfügbaren Platz */}
              <div className="flex-1 min-h-0">
                {screenSharers.map((p) => (
                  <ScreenShareTile
                    key={`${p.identity}-screen`}
                    participant={p}
                  />
                ))}
              </div>

              {/* Teilnehmer als kompakte Reihe */}
              {participants.length > 0 && (
                <div className="shrink-0 flex flex-wrap justify-center gap-3">
                  {visibleParticipants.map((p) => (
                    <div key={p.identity} className="w-32 shrink-0">
                      <ParticipantTile participant={p} isOwner={isOwner} />
                    </div>
                  ))}
                </div>
              )}
              {hasHidden && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="shrink-0 flex cursor-pointer items-center justify-center gap-1.5 self-center rounded-[8px] border border-white/5 bg-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/5"
                >
                  {showAll ? (
                    <>
                      <CaretUp size={14} /> Weniger anzeigen
                    </>
                  ) : (
                    <>
                      <CaretDown size={14} /> {hiddenCount} weitere anzeigen
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center -mt-8 gap-3">
              {/* Ohne Screen-Share: Teilnehmer zentriert */}
              <div
                className="w-full max-w-4xl mx-auto"
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: `repeat(${Math.min(Math.max(Math.ceil(Math.sqrt(visibleParticipants.length)), 1), 4)}, 1fr)`,
                }}
              >
                {visibleParticipants.map((p) => (
                  <ParticipantTile
                    key={p.identity}
                    participant={p}
                    isOwner={isOwner}
                  />
                ))}
              </div>
              {hasHidden && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-white/5 bg-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/5"
                >
                  {showAll ? (
                    <>
                      <CaretUp size={14} /> Weniger anzeigen
                    </>
                  ) : (
                    <>
                      <CaretDown size={14} /> {hiddenCount} weitere anzeigen
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Nicht verbunden: Zentrierter Beitreten-Button */
        <div className="flex flex-1 items-center justify-center px-6">
          <button
            onClick={() => connect(serverId, channel.id, channel.name)}
            disabled={status === "connecting"}
            className="flex items-center gap-2 rounded-[8px] bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white border-none cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <PhoneCall />
            {status === "connecting"
              ? "Verbinde…"
              : `${channel.name} beitreten`}
          </button>
        </div>
      )}

      {status === "connected" && (
        <div className="absolute w-full max-w-xs md:max-w-max bottom-8 md:bottom-5 left-1/2 -translate-x-1/2 rounded-[9999px] border border-white/5 bg-zinc-800 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          <VoiceControls />
        </div>
      )}
    </div>
  );
}
