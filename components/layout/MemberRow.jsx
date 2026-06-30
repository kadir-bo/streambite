"use client";
import { useState } from "react";
import { DotsThreeVertical, Shield, UserMinus } from "@phosphor-icons/react";
import { setMemberRoles, kickMember } from "@/lib";
import Avatar from "@/components/layout/Avatar";
import ContextMenu from "@/components/ui/ContextMenu";
import ConfirmModal from "@/components/modals/ConfirmModal";

function RoleBadge({ roles }) {
  if (roles?.includes("owner")) {
    return (
      <span className="text-2xs font-semibold uppercase tracking-wide text-(--accent) shrink-0">
        Owner
      </span>
    );
  }
  if (roles?.includes("admin")) {
    return (
      <span className="text-2xs font-semibold uppercase tracking-wide text-(--text-muted) shrink-0">
        Admin
      </span>
    );
  }
  return null;
}

export default function MemberRow({ member, isOffline, serverId, canManage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [confirmKick, setConfirmKick] = useState(false);
  const [kicking, setKicking] = useState(false);
  const isAdmin = member.roles?.includes("admin");
  const isOwner = member.roles?.includes("owner");

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
      icon: <Shield size={14} />,
      label: isAdmin ? "Admin entfernen" : "Admin machen",
      onClick: toggleAdmin,
    },
    { divider: true },
    {
      icon: <UserMinus size={14} />,
      label: "Vom Server entfernen",
      danger: true,
      onClick: () => setConfirmKick(true),
    },
  ];

  return (
    <>
      <div
        className={`group flex items-center gap-2 px-2 py-1.25 rounded-(--radius-base) cursor-default hover:bg-(--state-hover) ${
          isOffline ? "opacity-[0.45]" : "opacity-100"
        }`}
      >
        <Avatar
          src={member.avatarUrl}
          name={member.displayName ?? "?"}
          size="sm"
          status={isOffline ? "offline" : (member.status ?? "online")}
        />
        <span className="text-sm font-medium text-(--text-secondary) truncate flex-1">
          {member.displayName ?? "Nutzer"}
        </span>
        <RoleBadge roles={member.roles} />
        {canManage && !isOwner && (
          <button
            onClick={openMenu}
            className="flex shrink-0 size-6 items-center justify-center rounded-(--radius-sm) border-none bg-transparent text-(--text-muted) opacity-0 group-hover:opacity-100 hover:bg-(--state-active) hover:text-(--text-secondary) cursor-pointer"
          >
            <DotsThreeVertical size={16} weight="bold" />
          </button>
        )}
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
