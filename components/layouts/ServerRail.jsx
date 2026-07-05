"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { useAuth, useLayout, useServer } from "@/context";
import {
  RailButton,
  PendingInviteButton,
  JoinInviteModal,
  ServerIcon,
  Logo,
} from "@/components";

export default function ServerRail({ onOpenCreate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { servers, activeServerId } = useServer();
  const { showContent } = useLayout();
  const { userDoc } = useAuth();
  const isDM = pathname.startsWith("/channels");
  const [activeInvite, setActiveInvite] = useState(null);
  const pendingInvites = userDoc?.pendingInvites ?? [];

  return (
    <div className="flex w-max shrink-0 flex-col items-stretch overflow-y-auto overflow-x-hidden bg-zinc-950 pt-2 pb-2 border-r border-white/5">
      <RailButton
        onClick={() => {
          router.push("/channels");
          showContent();
        }}
        active={isDM}
        tooltip="Direktnachrichten"
      >
        <Logo
          variant="icon"
          className={`h-5 w-5 ${isDM ? "opacity-100" : "opacity-50"}`}
        />
      </RailButton>

      <div className="mx-auto my-1 h-px w-6 shrink-0 bg-white/10" />

      {servers.map((server) => (
        <RailButton
          key={server.id}
          href={`/servers/${server.id}`}
          active={server.id === activeServerId}
          tooltip={server.name}
        >
          <ServerIcon name={server.name} iconUrl={server.iconUrl} size={34} />
        </RailButton>
      ))}

      {pendingInvites.map((invite) => (
        <PendingInviteButton
          key={invite.serverId}
          invite={invite}
          onOpen={setActiveInvite}
        />
      ))}

      <RailButton
        onClick={onOpenCreate}
        tooltip="Server erstellen oder beitreten"
      >
        <Plus
          weight="bold"
          className="text-zinc-500 text-sm md:text-base"
        />
      </RailButton>

      <JoinInviteModal
        open={!!activeInvite}
        onClose={() => setActiveInvite(null)}
        invite={activeInvite}
      />
    </div>
  );
}
