"use client";
import { useState } from "react";
import { Tooltip, ServerIcon } from "@/components";

export default function PendingInviteButton({ invite, onOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-center py-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => onOpen(invite)}
        className="block w-full bg-transparent border-none p-0"
      >
        <div className="px-1.5">
          <div className="relative flex size-8 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-(--accent) bg-zinc-800 cursor-pointer">
            <ServerIcon
              name={invite.serverName}
              iconUrl={invite.serverIconUrl}
              size={32}
            />
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border-2 border-zinc-950 bg-(--accent) text-2xs font-bold leading-none text-white">
              +
            </span>
          </div>
        </div>
      </button>
      {hovered && (
        <Tooltip label={`Einladung: ${invite.serverName}`} visible={hovered} />
      )}
    </div>
  );
}
