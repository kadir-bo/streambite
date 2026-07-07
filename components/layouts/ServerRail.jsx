"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, ChatCircleText } from "@phosphor-icons/react";
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
    <div className="flex w-max shrink-0 flex-col items-center gap-2 overflow-y-auto overflow-x-hidden bg-[#05050b] py-3 px-1.5">
      <RailButton
        onClick={() => {
          router.push("/channels");
          showContent();
        }}
        active={isDM}
        tooltip="Direktnachrichten"
      >
        <ChatCircleText
          weight={isDM ? "fill" : "regular"}
          className={`h-6 w-6 ${isDM ? "text-[#8a38f5]" : "text-zinc-500"}`}
        />
      </RailButton>

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
          className="text-zinc-500 text-lg"
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
