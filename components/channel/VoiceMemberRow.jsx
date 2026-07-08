"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ChatDots, Prohibit } from "@phosphor-icons/react";
import { useVoice, useLayout, useAuth, useServer } from "@/context";
import { useIsDesktop, useLongPress } from "@/hooks";
import { ensureDm } from "@/lib";
import { Avatar, ContextMenu } from "@/components";

/**
 * VoiceMemberRow — Ein Mitglied in einem Sprachkanal (Avatar + Name).
 *
 * Klick navigiert zum Channel. Bei Owner/Admin-Rechten öffnet ein
 * Long-Press / Rechtsklick ein Kontextmenü mit Aktionen.
 *
 * <VoiceMemberRow member={m} serverId={serverId} channelId={channel.id} channelName={channel.name} />
 */
export default function VoiceMemberRow({
  member,
  serverId,
  channelId,
  channelName,
}) {
  const { connect, isSpeaking } = useVoice();
  const { showContent } = useLayout();
  const { firebaseUser } = useAuth();
  const { servers, userRoles } = useServer();
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const activeServer = servers.find((s) => s.id === serverId);
  const isOwner = activeServer?.ownerId === firebaseUser?.uid;
  const canManage = isOwner || userRoles?.includes("admin");
  const isSelf = member.uid === firebaseUser?.uid;

  const longPress = useLongPress(openMenu, 500);

  function handleClick(e) {
    if (longPress.wasActive.current) {
      longPress.clear();
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    if (isDesktop) connect(serverId, channelId, channelName);
    if (!isDesktop) showContent();
  }

  function openMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    setMenuOpen(true);
  }

  async function handleSendDm() {
    if (!firebaseUser) return;
    setMenuOpen(false);
    const dmId = await ensureDm(firebaseUser.uid, member.uid);
    router.push(`/channels/dm/${dmId}`);
  }

  async function handleDisconnect() {
    if (!firebaseUser) return;
    setMenuOpen(false);
    try {
      await fetch("/api/voice-remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: `${serverId}:${channelId}`,
          identity: member.uid,
        }),
      });
    } catch (err) {
      console.error("[voice] remove failed:", err);
    }
  }

  const menuItems = [
    {
      icon: <ChatDots />,
      label: "Nachricht senden",
      onClick: handleSendDm,
    },
    ...(canManage && !isSelf
      ? [
          {
            icon: <User />,
            label: "Profil ansehen",
            onClick: handleSendDm, // DM öffnen als Profilansicht
          },
          {
            icon: <Prohibit />,
            label: "Verbindung trennen",
            danger: true,
            onClick: handleDisconnect,
          },
        ]
      : []),
  ];

  return (
    <div
      {...longPress.handlers}
      onContextMenu={menuItems.length > 0 ? openMenu : undefined}
      className="relative"
    >
      <Link
        href={`/servers/${serverId}/${channelId}`}
        onClick={handleClick}
        className="flex select-none items-center gap-1.5 no-underline rounded-lg px-2 py-1.5 hover:bg-white/5"
      >
        <Avatar
          src={member.avatarUrl}
          name={member.name}
          size="sm"
          isSpeaking={isSpeaking}
        />
        <span className="truncate text-xs text-zinc-500">{member.name}</span>
      </Link>

      {menuItems.length > 0 && (
        <ContextMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          position={menuPos}
          width={180}
          items={menuItems}
        />
      )}
    </div>
  );
}
