"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, CaretLeft } from "@phosphor-icons/react";
import { useAuth, useLayout } from "@/context";
import { useFriendActions } from "@/hooks";
import { closeDm, STATUS_LABELS } from "@/lib";
import { useLongPress } from "@/hooks";
import { Avatar, ContextMenu, DotMenu, Topbar } from "@/components";

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
    <Topbar className="gap-3 px-4">
      <button
        onClick={showList}
        title="Zurück"
        className="flex items-center justify-center size-10 rounded-full border-none bg-surface-hover text-zinc-400 cursor-pointer transition-colors hover:text-white md:hidden"
      >
        <CaretLeft weight="regular" className="text-xl" />
      </button>

      <div
        {...longPress.handlers}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="relative shrink-0">
          <Avatar src={user?.avatarUrl} name={user?.displayName} size="md" />
          <span
            className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-surface-app"
            style={{
              background:
                user?.status === "online"
                  ? "#4ac263"
                  : user?.status === "busy"
                    ? "#f5340b"
                    : "#686868",
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white leading-tight">
            {user?.displayName ?? "..."}
          </p>
          <p className="text-xs text-zinc-500">
            {STATUS_LABELS[user?.status] ?? "Offline"}
          </p>
        </div>
      </div>

      {user && <DotMenu onClick={openMenu} />}

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
