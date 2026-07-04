"use client";

import { useState } from "react";
import { Check, X } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { acceptFriendRequest, declineFriendRequest } from "@/lib";
import { Avatar } from "@/components";

export default function RequestRow({ user }) {
  const { firebaseUser } = useAuth();
  const [loading, setLoading] = useState(null);

  async function handleAccept() {
    setLoading("accept");
    try {
      await acceptFriendRequest(firebaseUser.uid, user.id);
    } finally {
      setLoading(null);
    }
  }

  async function handleDecline() {
    setLoading("decline");
    try {
      await declineFriendRequest(firebaseUser.uid, user.id);
    } finally {
      setLoading(null);
    }
  }

  return (
      <div className="flex items-center gap-2.5 px-3 py-2 max-sm:py-3 max-sm:min-h-12">
      <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-100">
          {user.displayName}
        </p>
        <p className="text-xs text-zinc-500">Möchte befreundet sein</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={handleAccept}
          disabled={!!loading}
          title="Annehmen"
          className={`flex size-6.5 max-sm:size-10 cursor-pointer items-center justify-center rounded-full border border-white/5 text-green-500 ${loading === "accept" ? "bg-white/10" : "bg-zinc-800 hover:bg-white/5"}`}
        >
          <Check size={13} weight="bold" className="max-sm:size-4" />
        </button>
        <button
          onClick={handleDecline}
          disabled={!!loading}
          title="Ablehnen"
          className={`flex size-6.5 max-sm:size-10 cursor-pointer items-center justify-center rounded-full border border-white/5 text-red-500 ${loading === "decline" ? "bg-white/10" : "bg-zinc-800 hover:bg-white/5"}`}
        >
          <X size={13} weight="bold" className="max-sm:size-4" />
        </button>
      </div>
    </div>
  );
}
