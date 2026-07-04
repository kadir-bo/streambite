"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context";
import { ensureDm } from "@/lib";
import { Avatar } from "@/components";

const STATUS_LABELS = {
  online: "Online",
  busy: "Beschäftigt",
  idle: "Abwesend",
};

export default function ActiveFriendRow({ friend }) {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  async function openDm() {
    if (opening || !firebaseUser) return;
    setOpening(true);
    try {
      const dmId = await ensureDm(firebaseUser.uid, friend.id);
      router.push(`/channels/dm/${dmId}`);
    } catch (err) {
      console.error("[dm] activeNow openDm failed:", err.code, err.message);
    } finally {
      setOpening(false);
    }
  }

  return (
    <button
      onClick={openDm}
      disabled={opening}
      className="w-full flex items-center gap-2.5 p-2 rounded-[8px] border-none bg-transparent text-left cursor-pointer hover:bg-white/5 max-sm:min-h-12"
    >
      <Avatar
        src={friend.avatarUrl}
        name={friend.displayName}
        size="sm"
        status={friend.status}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-100 truncate">
          {friend.displayName}
        </p>
        <p className="text-xs text-zinc-500">
          {STATUS_LABELS[friend.status] ?? "Online"}
        </p>
      </div>
    </button>
  );
}
