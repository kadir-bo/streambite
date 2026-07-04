"use client";

import { useState } from "react";
import {
  MicrophoneSlash,
  UserMinus,
} from "@phosphor-icons/react";
import { useVoice } from "@/context";
import { useLongPress } from "@/hooks";
import { Avatar, ContextMenu, ConfirmModal, DotMenu } from "@/components";

export default function ParticipantTile({ participant, isOwner }) {
  const { removeFromVoice } = useVoice();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const canManage = isOwner && !participant.isLocal;
  const longPress = useLongPress(canManage ? openMenu : undefined);

  function openMenu(e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.right - 180, y: rect.bottom + 4 });
    setMenuOpen(true);
  }

  async function handleRemove() {
    setRemoving(true);
    setError("");
    try {
      await removeFromVoice(participant.identity);
      setConfirmRemove(false);
    } catch (err) {
      setError(err.message || "Entfernen fehlgeschlagen.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div
      {...longPress.handlers}
      className="group relative flex select-none flex-col items-center gap-3 rounded-[8px] bg-zinc-800 border border-white/5 aspect-video p-4 w-full min-w-0 justify-center"
    >
      {canManage && (
        <DotMenu
          onClick={openMenu}
          className="absolute right-1.5 top-1.5"
        />
      )}

      <div
        className={`rounded-full p-1.5 transition-colors duration-150 ${
          participant.isSpeaking ? "ring-2 ring-(--accent)" : ""
        }`}
      >
        <Avatar name={participant.name} size="xl" />
      </div>
      <div className="flex items-center justify-center gap-2 max-w-full">
        <span className="text-sm font-medium text-zinc-100 truncate">
          {participant.name}
          {participant.isLocal ? " (Du)" : ""}
        </span>
        {participant.isMicMuted && (
          <MicrophoneSlash className="text-zinc-500 shrink-0 text-xl md:text-lg" />
        )}
      </div>

      {canManage && (
        <>
          <ContextMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            position={menuPos}
            width={180}
            items={[
              {
                icon: <UserMinus />,
                label: "Vom Sprachkanal entfernen",
                danger: true,
                onClick: () => setConfirmRemove(true),
              },
            ]}
          />
          <ConfirmModal
            open={confirmRemove}
            onClose={() => setConfirmRemove(false)}
            onConfirm={handleRemove}
            title="Vom Sprachkanal entfernen"
            description={`Möchtest du ${participant.name} wirklich aus dem Sprachkanal entfernen? Die Person kann jederzeit wieder beitreten.`}
            confirmLabel="Entfernen"
            loading={removing}
            error={error}
          />
        </>
      )}
    </div>
  );
}
