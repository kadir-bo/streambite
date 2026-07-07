"use client";
import { useState } from "react";
import { Shield, UserMinus } from "@phosphor-icons/react";
import { setMemberRoles, kickMember } from "@/lib";
import { useLongPress } from "@/hooks";
import {
  Avatar,
  ContextMenu,
  DotMenu,
  RoleBadge,
  ConfirmModal,
} from "@/components";

export default function MemberRow({ member, isOffline, serverId, canManage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [confirmKick, setConfirmKick] = useState(false);
  const [kicking, setKicking] = useState(false);
  const isAdmin = member.roles?.includes("admin");
  const isOwner = member.roles?.includes("owner");
  const longPress = useLongPress(canManage && !isOwner ? openMenu : undefined);

  function openMenu(e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.right - 200, y: rect.bottom + 4 });
    setMenuOpen(true);
  }

  async function toggleAdmin() {
    const nextRoles = isAdmin ? [] : ["admin"];
    await setMemberRoles(serverId, member.id, nextRoles);
  }

  async function handleKick() {
    setKicking(true);
    try {
      await kickMember(serverId, member.id);
      setConfirmKick(false);
    } finally {
      setKicking(false);
    }
  }

  const menuItems = [
    {
      icon: <Shield />,
      label: isAdmin ? "Admin entfernen" : "Admin machen",
      onClick: toggleAdmin,
    },
    { divider: true },
    {
      icon: <UserMinus />,
      label: "Vom Server entfernen",
      danger: true,
      onClick: () => setConfirmKick(true),
    },
  ];

  return (
    <>
      <div
        {...longPress.handlers}
        className={`group flex items-center gap-2 px-2 py-1.25 rounded-lg cursor-default hover:bg-white/5 border border-white/5 h-14 md:h-12  ${
          isOffline ? "opacity-45" : "opacity-100"
        }`}
      >
        <Avatar
          src={member.avatarUrl}
          name={member.displayName ?? "?"}
          size="md"
          status={isOffline ? "offline" : (member.status ?? "online")}
        />
        <div className="flex flex-col">
          <RoleBadge roles={member.roles} />
          <span className="text-sm font-medium text-zinc-400 truncate flex-1">
            {member.displayName ?? "Nutzer"}
          </span>
        </div>
        {canManage && !isOwner && <DotMenu onClick={openMenu} />}
      </div>

      {canManage && !isOwner && (
        <>
          <ContextMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            position={menuPos}
            width={200}
            items={menuItems}
          />
          <ConfirmModal
            open={confirmKick}
            onClose={() => setConfirmKick(false)}
            onConfirm={handleKick}
            title="Mitglied entfernen"
            description={`Möchtest du ${member.displayName ?? "dieses Mitglied"} wirklich vom Server entfernen?`}
            confirmLabel="Entfernen"
            loading={kicking}
          />
        </>
      )}
    </>
  );
}
