"use client";

import { ConfirmModal } from "@/components";

/**
 * FriendActionModals — Rendert die Confirm-Dialoge für Freund entfernen
 * und Nutzer blockieren. Bekommt den State von useFriendActions() via Props.
 *
 * <FriendActionModals
 *   state={friendActions}
 *   user={user}
 * />
 */
export default function FriendActionModals({ state, user }) {
  if (!state) return null;
  const {
    confirmRemove,
    confirmBlock,
    removing,
    blocking,
    error,
    setConfirmRemove,
    setConfirmBlock,
    handleRemove,
    handleToggleBlock,
  } = state;

  return (
    <>
      <ConfirmModal
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleRemove}
        title="Freund entfernen"
        description={`Möchtest du ${user?.displayName ?? "diesen Nutzer"} wirklich aus deiner Freundesliste entfernen?`}
        confirmLabel="Entfernen"
        loading={removing}
        error={error}
      />
      <ConfirmModal
        open={confirmBlock}
        onClose={() => setConfirmBlock(false)}
        onConfirm={handleToggleBlock}
        title="Nutzer blockieren"
        description={`Möchtest du ${user?.displayName ?? "diesen Nutzer"} wirklich blockieren? Ihr werdet automatisch keine Freunde mehr sein und könnt euch keine Nachrichten mehr senden.`}
        confirmLabel="Blockieren"
        loading={blocking}
        error={error}
      />
    </>
  );
}
