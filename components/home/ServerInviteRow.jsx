"use client";
import { useState } from "react";

import { IconBtn, ServerIcon } from "@/components";
import { Check, X } from "@phosphor-icons/react";
import { acceptServerInvite, declineServerInvite } from "@/lib";

export default function ServerInviteRow({ invite, uid }) {
  const [loading, setLoading] = useState(null);
  const { setInboxOpen } = useFriends();

  async function handleAccept() {
    if (!uid) return;
    setLoading("accept");
    try {
      await acceptServerInvite(uid, invite);
    } catch (err) {
      console.error("[invite] accept failed:", err);
    } finally {
      setLoading(null);
      setInboxOpen(false);
    }
  }

  async function handleDecline() {
    if (!uid) return;
    setLoading("decline");
    try {
      await declineServerInvite(uid, invite.serverId);
    } catch (err) {
      console.error("[invite] decline failed:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <div className="size-8 shrink-0 overflow-hidden rounded-md">
        <ServerIcon
          name={invite.serverName}
          iconUrl={invite.serverIconUrl}
          size={32}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-(--weight-medium) text-(--text-primary)">
          {invite.serverName}
        </p>
        <p className="text-xs text-(--text-muted)">
          {invite.invitedByName ?? "Jemand"} hat dich eingeladen
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <IconBtn
          icon={Check}
          onClick={handleAccept}
          title="Annehmen"
          variant="primary"
          disabled={!!loading}
          rounded="full"
        />
        <IconBtn
          icon={X}
          onClick={handleDecline}
          title="Ablehnen"
          variant="danger"
          disabled={!!loading}
          rounded="full"
        />
      </div>
    </div>
  );
}
