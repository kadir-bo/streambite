import React from "react";
import { Avatar } from "@/components";

export default function FriendCard({ friend, opening, onClick }) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onClick(friend)}
        disabled={opening === friend.id}
        className="flex flex-col items-center gap-1.5 border-none cursor-pointer group bg-surface-card p-2 rounded-xl"
      >
        <Avatar src={friend.avatarUrl} name={friend.displayName} size="xl" />
      </button>
    </div>
  );
}
