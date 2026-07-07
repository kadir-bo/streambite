"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChatsCircle,
  ChatCircleText,
  XCircle,
} from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { subscribeToUser, ensureDm, closeDm } from "@/lib";
import { useUnread, useFriendActions, useIsDesktop, useLongPress } from "@/hooks";
import { Avatar, ContextMenu, DotMenu } from "@/components";

export default function DmRow({ dm, otherUid, active }) {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const rowRef = useRef(null);
  const [user, setUser] = useState(null);
  const { isUnread } = useUnread();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const friendActions = useFriendActions(user);
  const isDesktop = useIsDesktop();

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

  const longPress = useLongPress(openMenu);

  function openMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const row = rowRef.current?.querySelector("a");
    const rect = (row ?? e.currentTarget).getBoundingClientRect();
    const menuWidth = 220;
    const gap = 4;
    setMenuPos({
      x: rect.right - menuWidth - gap,
      y: rect.top,
    });
    setMenuOpen(true);
  }

  const menuItems = [
    {
      icon: <ChatCircleText />,
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

  const STATUS_LABELS = {
    online: "Online",
    busy: "Beschäftigt",
    idle: "Abwesend",
    offline: "Offline",
  };

  return (
    <div
      ref={rowRef}
      {...longPress.handlers}
      className="group relative"
      onContextMenu={(e) => {
        e.preventDefault();
        const menuWidth = 220;
        const gap = 4;
        setMenuPos({
          x: e.clientX - menuWidth / 2,
          y: e.clientY,
        });
        setMenuOpen(true);
      }}
    >
      <a
        href={`/channels/dm/${dm.id}`}
        onClick={(e) => {
          e.preventDefault();
          openDm();
        }}
        className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl no-underline transition-colors duration-100 ${
          active
            ? "bg-surface-hover"
            : "bg-transparent hover:bg-surface-hover/50"
        }`}
      >
        <div className="relative shrink-0">
          <Avatar
            src={user?.avatarUrl}
            name={user?.displayName ?? "?"}
            size="lg"
          />
          <span
            className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#05050b]"
            style={{
              background:
                user?.status === "online"
                  ? "#4ac263"
                  : user?.status === "busy"
                    ? "#f59e0b"
                    : "#686868",
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] truncate ${
            active || isUnread(dm.id, dm.updatedAt)
              ? "text-white font-semibold"
              : "text-zinc-300 font-medium"
          }`}>
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

      <div className={isDesktop ? "absolute right-2 top-1/2 -translate-y-1/2" : "absolute right-4 bottom-2 z-10"}>
        <DotMenu
          onClick={openMenu}
          className={isDesktop ? "" : "!opacity-100"}
        />
      </div>

      <ContextMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPos}
        width={220}
        items={menuItems}
      />

      {friendActions.modals}
    </div>
  );
}
