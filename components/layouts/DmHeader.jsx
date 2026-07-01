"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, CaretLeft } from "@phosphor-icons/react";
import { useAuth, useLayout } from "@/context";
import { useFriendActions } from "@/hooks";
import { closeDm } from "@/lib";
import { Avatar, ContextMenu, IconBtn, DotMenu } from "@/components";

const STATUS_LABELS = {
  online: "Online",
  busy: "Beschäftigt",
  idle: "Abwesend",
  offline: "Offline",
};

export default function DmHeader({ user, dmId }) {
  const { firebaseUser } = useAuth();
  const { showList } = useLayout();
  const router = useRouter();
  const friendActions = useFriendActions(user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  function openMenu(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.right - 220, y: rect.bottom + 4 });
    setMenuOpen(true);
  }

  async function handleCloseConversation() {
    if (!firebaseUser || !dmId) return;
    await closeDm(dmId, firebaseUser.uid);
    router.push("/channels");
  }

  const menuItems = [
    ...friendActions.items,
    { divider: true },
    {
      icon: <XCircle />,
      label: "Unterhaltung schließen",
      onClick: handleCloseConversation,
    },
  ];

  return (
    <header className="flex shrink-0 items-center gap-2.5 border-b border-(--border-subtle) bg-(--surface-base) px-4 h-(--header-channel)">
      <IconBtn
        icon={CaretLeft}
        onClick={showList}
        title="Zurück"
        size="sm"
        mobileOnly
      />

        <Avatar
          src={user?.avatarUrl}
          name={user?.displayName}
          size="sm"
          status={user?.status}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-(--weight-semibold) text-(--text-primary) leading-[1.2]">
            {user?.displayName ?? "..."}
          </p>
          <p className="text-2xs text-(--text-muted)">
            {STATUS_LABELS[user?.status] ?? "Offline"}
          </p>
        </div>

        {user && (
          <DotMenu onClick={openMenu} />
      )}

      <ContextMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPos}
        width={220}
        items={menuItems}
      />
      {friendActions.modals}
    </header>
  );
}
