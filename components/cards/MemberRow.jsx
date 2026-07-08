"use client";
import { useState } from "react";
import { Shield, UserMinus, UserPlus } from "@phosphor-icons/react";
import { setMemberRoles, kickMember, sendFriendRequest } from "@/lib";
import { useAuth, useVoice } from "@/context";
import { useLongPress } from "@/hooks";
import {
  Avatar,
  ContextMenu,
  DotMenu,
  RoleBadge,
  ConfirmModal,
} from "@/components";
import { twMerge } from "tailwind-merge";

export default function MemberRow({ member, isOffline, serverId, canManage }) {
  const { userDoc, firebaseUser } = useAuth();
  const { isSpeaking } = useVoice();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [confirmKick, setConfirmKick] = useState(false);
  const [kicking, setKicking] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  const isAdmin = member.roles?.includes("admin");
  const isOwner = member.roles?.includes("owner");
  const isSelf = firebaseUser?.uid === member.id;

  const isFriend = userDoc?.friends?.includes(member.id);
  const hasOutgoingRequest = userDoc?.outgoingRequests?.includes(member.id);
  const canFriendRequest = !isSelf && !isFriend && !hasOutgoingRequest;

  const longPress = useLongPress(!isSelf ? openMenu : undefined);

  function openMenu(e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.right - 200, y: rect.bottom + 4 });
    setMenuOpen(true);
  }

  async function handleFriendRequest() {
    if (!firebaseUser || friendLoading) return;
    setFriendLoading(true);
    try {
      await sendFriendRequest(firebaseUser.uid, member.id);
      setMenuOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setFriendLoading(false);
    }
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

  const menuItems = [];

  if (canFriendRequest) {
    menuItems.push({
      icon: <UserPlus />,
      label: "Freundschaftsanfrage senden",
      onClick: handleFriendRequest,
    });
  }

  if (canManage && !isOwner) {
    if (canFriendRequest) menuItems.push({ divider: true });
    menuItems.push(
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
    );
  }

  return (
    <>
      <div
        {...longPress.handlers}
        onContextMenu={!isSelf ? openMenu : undefined}
        className={twMerge(
          "group flex items-center gap-1.5 px-2 py-1.25 rounded-lg cursor-default justify-between hover:bg-surface-card/50",
          isOffline ? "opacity-45" : "opacity-100",
        )}
      >
        <div className="flex gap-1.5">
          <Avatar
            src={member.avatarUrl}
            name={member.displayName ?? "?"}
            size="sm"
            status={isOffline ? "offline" : (member.status ?? "online")}
          />
          <div className="flex flex-col">
            <RoleBadge roles={member.roles} />
            <span className="text-xs font-medium text-zinc-400 truncate flex-1">
              {member.displayName ?? "Nutzer"}
            </span>
          </div>
        </div>
        {!isSelf && (
          <DotMenu
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
            onClick={openMenu}
          />
        )}
      </div>

      <ContextMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPos}
        width={220}
        items={menuItems}
      />

      {canManage && !isOwner && (
        <ConfirmModal
          open={confirmKick}
          onClose={() => setConfirmKick(false)}
          onConfirm={handleKick}
          title="Mitglied entfernen"
          description={`Möchtest du ${member.displayName ?? "dieses Mitglied"} wirklich vom Server entfernen?`}
          confirmLabel="Entfernen"
          loading={kicking}
        />
      )}
    </>
  );
}
