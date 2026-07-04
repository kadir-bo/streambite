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
import { NavRow, Avatar, ContextMenu, DotMenu } from "@/components";

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
    // Card-Rand statt DotMenu-Position: rechtsbündig am NavRow
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
      <NavRow
        href={`/channels/dm/${dm.id}`}
        active={active}
        unread={isUnread(dm.id, dm.updatedAt)}
        icon={
          <Avatar
            src={user?.avatarUrl}
            name={user?.displayName ?? "?"}
            size="sm"
            status={user?.status}
          />
        }
        label={user?.displayName ?? "..."}
      >
        {/* Mobile: Letzte Nachricht unter dem Namen, DotMenu rechts */}
        {/* Desktop: Letzte Nachricht + DotMenu in einer Zeile */}
        {dm.lastMessage && (
          <div className="flex items-center gap-1 relative max-sm:mt-0.5">
            <span className="truncate flex-1 text-xs text-zinc-500">
              {dm.lastMessage.content ? (
                <span className="truncate">{dm.lastMessage.content}</span>
              ) : (
                <ChatsCircle size={12} className="inline align-middle shrink-0" />
              )}
            </span>
          </div>
        )}
      </NavRow>

      {/* DotMenu außerhalb des NavRow-Contents, absolut rechts positioniert */}
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
