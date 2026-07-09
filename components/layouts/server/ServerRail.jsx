"use client";
import { useRef, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Plus, ChatCircleIcon } from "@phosphor-icons/react";
import { springs } from "@/lib";
import { useAuth, useLayout, useServer, useVoice } from "@/context";
import {
  RailButton,
  PendingInviteButton,
  JoinInviteModal,
  ServerIcon,
  Logo,
} from "@/components";
import { twMerge } from "tailwind-merge";

export default function ServerRail({ onOpenCreate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { servers, activeServerId } = useServer();
  const { connection } = useVoice();
  const { showContent } = useLayout();
  const { userDoc } = useAuth();
  const isDM = pathname.startsWith("/channels");
  const [activeInvite, setActiveInvite] = useState(null);
  const pendingInvites = userDoc?.pendingInvites ?? [];
  const railRef = useRef(null);
  const outerRef = useRef(null);
  const [activeTop, setActiveTop] = useState(0);

  // Determine pill visibility + active index
  const items = [
    { id: "dm", active: isDM },
    ...servers.map((s) => ({ id: s.id, active: s.id === activeServerId })),
  ];
  const hasActive = items.some((i) => i.active);

  useEffect(() => {
    if (!outerRef.current || !railRef.current) return;
    const el = railRef.current.querySelector("[data-active=true]");
    if (el) {
      const outerRect = outerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      // +4px for the RailButton's py-1 padding so the pill aligns with the icon
      setActiveTop(elRect.top - outerRect.top + 8);
    }
  }, [activeServerId, pathname]);

  return (
    <div
      ref={outerRef}
      className="relative flex w-max shrink-0 flex-col items-center gap-2 overflow-y-auto overflow-x-hidden bg-surface-sidebar py-3 px-1.5 border-r border-white/5"
    >
      {/* Single active pill */}
      <motion.div
        animate={{
          top: hasActive ? activeTop : 0,
          height: hasActive ? 32 : 0,
          opacity: hasActive ? 1 : 0,
        }}
        transition={springs.snappy}
        className="absolute left-0 w-0.5 rounded-r-full bg-white z-10 pointer-events-none"
      />

      <div ref={railRef} className="flex flex-col items-center gap-2">
        <div data-active={isDM ? "true" : "false"}>
          <RailButton
            onClick={() => {
              router.push("/channels");
              showContent();
            }}
            active={isDM}
            tooltip="Direktnachrichten"
          >
            <ChatCircleIcon
              weight={isDM ? "fill" : "regular"}
              className={twMerge(
                "h-6 w-6",
                isDM ? "text-white" : "text-zinc-500",
              )}
            />
          </RailButton>
        </div>

        {servers.map((server) => (
          <div
            key={server.id}
            data-active={server.id === activeServerId ? "true" : "false"}
          >
            <RailButton
              href={`/servers/${server.id}`}
              active={server.id === activeServerId}
              tooltip={server.name}
              voiceActive={
                connection.status === "connected" &&
                connection.serverId === server.id
              }
            >
              <ServerIcon
                name={server.name}
                iconUrl={server.iconUrl}
                size={34}
              />
            </RailButton>
          </div>
        ))}

        {pendingInvites.map((invite) => (
          <PendingInviteButton
            key={invite.serverId}
            invite={invite}
            onOpen={setActiveInvite}
          />
        ))}

        <div data-active="false">
          <RailButton
            onClick={onOpenCreate}
            tooltip="Server erstellen oder beitreten"
          >
            <Plus weight="bold" className="text-zinc-500 text-lg" />
          </RailButton>
        </div>
      </div>

      <JoinInviteModal
        open={!!activeInvite}
        onClose={() => setActiveInvite(null)}
        invite={activeInvite}
      />
    </div>
  );
}
