"use client";

import { Hash } from "@phosphor-icons/react";
import { Avatar } from "@/components";

export default function ChannelWelcome({ channel, dmUser }) {
  if (dmUser) {
    return (
      <div className="px-6 pt-8 pb-6 mt-auto border-b border-white/5 flex items-center gap-4 ">
        <Avatar src={dmUser.avatarUrl} name={dmUser.displayName} size="xl" />
        <div>
          <span className="text-xl font-bold text-zinc-100 mb-2">
            {dmUser.displayName ?? "…"}
          </span>
          <p className="text-sm text-zinc-400 max-w-120">
            Das ist der Anfang deiner Unterhaltung mit{" "}
            <strong className="text-zinc-100 font-medium">
              {dmUser.displayName}
            </strong>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-6 mt-auto border-b border-white/5">
      <div className="size-18 rounded-full bg-surface-card border border-white/5 flex items-center justify-center mb-4">
        <Hash size={36} weight="bold" className="text-zinc-500" />
      </div>
      <p className="text-2xl font-bold text-zinc-100 mb-2">
        Willkommen in #{channel?.name ?? "…"}
      </p>
      <p className="text-base text-zinc-400 max-w-120">
        Das ist der Anfang des{" "}
        <strong className="text-zinc-100">#{channel?.name}</strong> Kanals.
        {channel?.topic && (
          <span className="ml-1 text-zinc-500">- {channel.topic}</span>
        )}
      </p>
    </div>
  );
}
