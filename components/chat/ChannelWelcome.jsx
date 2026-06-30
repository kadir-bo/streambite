"use client";

import { Hash } from "@phosphor-icons/react";
import Avatar from "@/components/layout/Avatar";

export default function ChannelWelcome({ channel, dmUser }) {
  if (dmUser) {
    return (
      <div className="px-6 pt-8 pb-6 mt-auto border-b border-(--border-subtle)">
        <div className="mb-4">
          <Avatar src={dmUser.avatarUrl} name={dmUser.displayName} size="xl" />
        </div>
        <p className="text-2xl font-bold text-(--text-primary) mb-2">
          {dmUser.displayName ?? "…"}
        </p>
        <p className="text-base text-(--text-secondary) max-w-120">
          Das ist der Anfang deiner Unterhaltung mit{" "}
          <strong className="text-(--text-primary)">
            {dmUser.displayName}
          </strong>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-6 mt-auto border-b border-(--border-subtle)">
      <div className="size-18 rounded-full bg-(--surface-raised) border border-(--border-subtle) flex items-center justify-center mb-4">
        <Hash size={36} weight="bold" className="text-(--text-muted)" />
      </div>
      <p className="text-2xl font-bold text-(--text-primary) mb-2">
        Willkommen in #{channel?.name ?? "…"}
      </p>
      <p className="text-base text-(--text-secondary) max-w-120">
        Das ist der Anfang des{" "}
        <strong className="text-(--text-primary)">#{channel?.name}</strong>{" "}
        Kanals.
        {channel?.topic && (
          <span className="ml-1 text-(--text-muted)">— {channel.topic}</span>
        )}
      </p>
    </div>
  );
}
