"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, CaretLeft } from "@phosphor-icons/react";
import { useAuth, useLayout } from "@/context";
import { useFriendActions } from "@/hooks";
import { closeDm } from "@/lib";
import { useLongPress } from "@/hooks";
import { Avatar, ContextMenu, IconBtn, DotMenu, Topbar } from "@/components";

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

  const longPress = useLongPress(user ? openMenu : undefined);

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
    <Topbar className="gap-2.5 px-4">
      <IconBtn
        icon={CaretLeft}
        onClick={showList}
        title="Zurück"
        size="xl"
        mobileOnly
        className="bg-zinc-800!"
      />

        <div {...longPress.handlers} className="flex items-center gap-2.5 flex-1 min-w-0">
          <Avatar
            src={user?.avatarUrl}
            name={user?.displayName}
            size="sm"
            status={user?.status}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-zinc-100 leading-tight">
              {user?.displayName ?? "..."}
            </p>
            <p className="text-2xs text-zinc-500">
              {STATUS_LABELS[user?.status] ?? "Offline"}
            </p>
          </div>
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
    </Topbar>
  );
}
