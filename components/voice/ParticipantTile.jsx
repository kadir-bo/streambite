"use client";

import { useState } from "react";
import { MicrophoneSlash, DotsThreeVertical, UserMinus } from "@phosphor-icons/react";
import { useVoice } from "@/context";
import Avatar from "../layout/Avatar";
import ContextMenu from "@/components/ui/ContextMenu";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function ParticipantTile({ participant, isOwner }) {
  const { removeFromVoice } = useVoice();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const canManage = isOwner && !participant.isLocal;

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
    <div className="group relative flex select-none flex-col items-center gap-3 rounded-(--radius-base) bg-(--surface-raised) border border-(--border-subtle) p-4 w-full min-w-0">
      {canManage && (
        <button
          onClick={openMenu}
          className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-(--radius-sm) border-none bg-transparent text-(--text-muted) opacity-0 group-hover:opacity-100 hover:bg-(--state-hover) hover:text-(--text-secondary) cursor-pointer"
        >
          <DotsThreeVertical size={16} weight="bold" />
        </button>
      )}

      <div
        className={`rounded-full p-1.5 transition-colors duration-150 ${
          participant.isSpeaking ? "ring-2 ring-(--accent)" : ""
        }`}
      >
        <Avatar name={participant.name} size="xl" />
      </div>
      <div className="flex items-center justify-center gap-2 max-w-full">
        <span className="text-sm font-medium text-(--text-primary) truncate">
          {participant.name}
          {participant.isLocal ? " (Du)" : ""}
        </span>
        {participant.isMicMuted && (
          <MicrophoneSlash size={14} className="text-(--text-muted) shrink-0" />
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
                icon: <UserMinus size={14} />,
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
