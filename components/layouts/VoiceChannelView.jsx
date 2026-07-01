"use client";

import { SpeakerHigh, Warning, PhoneCall } from "@phosphor-icons/react";
import { useVoice } from "@/context";
import { ParticipantTile, VoiceControls, ScreenShareTile } from "@/components";

// Connection lives in VoiceContext, not here - staying connected when the
// user navigates to another channel/DM (and showing a floating bar) is the
// whole point, so this view must NOT disconnect on unmount.
export default function VoiceChannelView({ serverId, channel, isOwner }) {
  const { connection, participants, screenShareHasAudio, connect } = useVoice();
  const isThisChannel =
    connection.serverId === serverId && connection.channelId === channel.id;
  const status = isThisChannel ? connection.status : "idle";

  const screenSharers = participants.filter(
    (p) => p.isScreenSharing && p.screenShareTrack,
  );
  const hasScreenShare = screenSharers.length > 0;
  const showAudioWarning =
    !screenShareHasAudio &&
    participants.some((p) => p.isLocal && p.isScreenSharing);

  return (
    <div className="relative flex flex-1 pt-4 flex-col overflow-hidden bg-(--surface-base)">
      {/* Header - immer sichtbar */}
      {connection.error && (status === "error" || status === "connected") && (
        <div className="mx-6 mb-2 shrink-0 flex max-w-md flex-col items-center gap-2.5 rounded-(--radius-base) border border-(--danger) bg-(--danger-subtle) px-5 py-4 text-center">
          <Warning size={22} className="text-(--danger)" />
          <p className="text-sm text-(--text-primary)">{connection.error}</p>
        </div>
      )}

      {status === "connected" ? (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden px-6 pb-28">
          {/* Warnung bei Screen-Share ohne Audio */}
          {showAudioWarning && (
            <div className="shrink-0 flex max-w-md items-center gap-3 rounded-(--radius-base) border border-(--warning) bg-(--warning-subtle) px-5 py-3 text-sm text-(--text-primary)">
              <Warning size={20} className="shrink-0 text-(--warning)" />
              <span>
                Kein Audio beim Teilen. Teile einen <strong>Chrome-Tab</strong>{" "}
                und aktiviere <strong>„Tab-Audio teilen"</strong> im Dialog.
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
                  {participants.map((p) => (
                    <div key={p.identity} className="w-32 shrink-0">
                      <ParticipantTile participant={p} isOwner={isOwner} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center -mt-8">
              {/* Ohne Screen-Share: Teilnehmer zentriert */}
              <div
                className="w-full max-w-4xl mx-auto"
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: `repeat(${Math.min(Math.max(Math.ceil(Math.sqrt(participants.length)), 1), 4)}, 1fr)`,
                }}
              >
                {participants.map((p) => (
                  <ParticipantTile
                    key={p.identity}
                    participant={p}
                    isOwner={isOwner}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Nicht verbunden: Zentrierter Beitreten-Button */
        <div className="flex flex-1 items-center justify-center px-6">
          <button
            onClick={() => connect(serverId, channel.id, channel.name)}
            disabled={status === "connecting"}
            className="flex items-center gap-2 rounded-(--radius-base) bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white border-none cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <PhoneCall />
            {status === "connecting"
              ? "Verbinde…"
              : `${channel.name} beitreten`}
          </button>
        </div>
      )}

      {status === "connected" && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-(--radius-base) border border-(--border-subtle) bg-(--surface-raised) px-4 py-3 shadow-(--shadow-lg)">
          <VoiceControls />
        </div>
      )}
    </div>
  );
}
