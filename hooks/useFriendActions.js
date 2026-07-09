"use client";

import { useState } from "react";
import { Prohibit, UserCheck, UserMinus } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { removeFriend, blockUser, unblockUser } from "@/lib";

// Shared Block/Unblock + Remove-friend menu items, reused by the DM
// sidebar list, the Friends list, and the DM header - so the three
// surfaces can't drift out of sync with each other.
//
// Confirm-Modals werden separat über <FriendActionModals> gerendert.
export function useFriendActions(user) {
  const { firebaseUser, userDoc } = useAuth();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [error, setError] = useState("");

  const isFriend = !!(user && userDoc?.friends?.includes(user.id));
  const isBlocked = !!(user && userDoc?.blockedUsers?.includes(user.id));

  async function handleRemove() {
    if (!firebaseUser || !user) return;
    setRemoving(true);
    setError("");
    try {
      await removeFriend(firebaseUser.uid, user.id);
      setConfirmRemove(false);
    } catch (err) {
      setError(err.message || "Fehler beim Entfernen.");
    } finally {
      setRemoving(false);
    }
  }

  async function handleToggleBlock() {
    if (!firebaseUser || !user) return;
    setBlocking(true);
    setError("");
    try {
      if (isBlocked) await unblockUser(firebaseUser.uid, user.id);
      else await blockUser(firebaseUser.uid, user.id);
      setConfirmBlock(false);
    } catch (err) {
      setError(err.message || "Fehler.");
    } finally {
      setBlocking(false);
    }
  }

  const items = [
    ...(isFriend
      ? [
          {
            icon: <UserMinus className="text-xl md:text-lg" />,
            label: "Freund entfernen",
            danger: true,
            onClick: () => setConfirmRemove(true),
          },
        ]
      : []),
    {
      icon: isBlocked ? (
        <UserCheck className="text-xl md:text-lg" />
      ) : (
        <Prohibit className="text-xl md:text-lg" />
      ),
      label: isBlocked ? "Entblocken" : "Blockieren",
      danger: !isBlocked,
      onClick: () => (isBlocked ? handleToggleBlock() : setConfirmBlock(true)),
    },
  ];

  return {
    items,
    isFriend,
    isBlocked,
    confirmRemove,
    confirmBlock,
    removing,
    blocking,
    error,
    setConfirmRemove,
    setConfirmBlock,
    handleRemove,
    handleToggleBlock,
  };
}
