"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatCircle, ChatsCircle, XCircle } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import {
  subscribeToUser,
  ensureDm,
  closeDm,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib";
import { useUnread, useFriendActions, useLongPress } from "@/hooks";
import { Avatar, ContextMenu, DotMenu } from "@/components";
import { twMerge } from "tailwind-merge";

const MENU_WIDTH = 220;
const MENU_GAP = 4;

function getMenuPosFromAnchor(el, menuWidth) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.right - menuWidth - MENU_GAP,
    y: rect.top,
  };
}

export default function DmRow({ dm, otherUid, active }) {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const rowRef = useRef(null);
  const [user, setUser] = useState(null);
  const { isUnread } = useUnread();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const friendActions = useFriendActions(user);

  useEffect(() => {
    if (!otherUid) return;
    return subscribeToUser(otherUid, setUser);
  }, [otherUid]);

  async function openDm() {
    if (!firebaseUser || !user) return;
    const dmId = await ensureDm(firebaseUser.uid, user.id);
    router.push(`/channels/dm/${dmId}`);
  }

  async function handleCloseConversation() {
    if (!firebaseUser) return;
    await closeDm(dm.id, firebaseUser.uid);
  }

  const longPress = useLongPress(openMenuFromAnchor);

  function openMenuFromAnchor() {
    const row = rowRef.current?.querySelector("a");
    if (!row) return;
    setMenuPos(getMenuPosFromAnchor(row, MENU_WIDTH));
    setMenuOpen(true);
  }

  function openMenuAtCursor(e) {
    e.preventDefault();
    setMenuPos({
      x: e.clientX - MENU_WIDTH / 2,
      y: e.clientY,
    });
    setMenuOpen(true);
  }

  const menuItems = [
    {
      icon: <ChatCircle />,
      label: "Nachricht senden",
      onClick: openDm,
    },
    { divider: true },
    ...friendActions.items,
    { divider: true },
    {
      icon: <XCircle />,
      label: "Unterhaltung schließen",
      onClick: handleCloseConversation,
    },
  ];

  return (
    <div
      ref={rowRef}
      {...longPress.handlers}
      className={twMerge(
        "group flex items-center mx-2 rounded-xl",
        active
          ? "bg-surface-hover"
          : "bg-transparent hover:bg-surface-hover/50",
      )}
      onContextMenu={openMenuAtCursor}
    >
      <a
        href={`/channels/dm/${dm.id}`}
        onClick={(e) => {
          e.preventDefault();
          openDm();
        }}
        className="flex items-center gap-3 px-3 py-2.5 flex-1 min-w-0 no-underline transition-colors duration-100"
      >
        <div className="relative shrink-0">
          <Avatar
            src={user?.avatarUrl}
            name={user?.displayName ?? "?"}
            size="md"
            status={user?.status}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={twMerge(
              "text-base truncate",
              active || isUnread(dm.id, dm.updatedAt)
                ? "text-white font-semibold"
                : "text-zinc-300 font-medium",
            )}
          >
            {user?.displayName ?? "..."}
          </p>
          {dm.lastMessage ? (
            <p className="truncate text-xs text-zinc-500">
              {dm.lastMessage.content || (
                <ChatsCircle size={12} className="inline align-middle" />
              )}
            </p>
          ) : (
            <p className="truncate text-xs text-zinc-500">
              {STATUS_LABELS[user?.status] ?? "Offline"}
            </p>
          )}
        </div>
      </a>

      <DotMenu
        onClick={openMenuFromAnchor}
        className="shrink-0 ml-auto hover:bg-transparent!"
      />

      <ContextMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPos}
        width={MENU_WIDTH}
        items={menuItems}
      />

      {friendActions.modals}
    </div>
  );
}
