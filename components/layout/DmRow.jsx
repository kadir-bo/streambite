"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChatsCircle,
  DotsThreeVertical,
  ChatCircleText,
  XCircle,
} from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { subscribeToUser, ensureDm, closeDm } from "@/lib";
import { useUnread, useFriendActions } from "@/hooks";
import NavRow from "@/components/layout/NavRow";
import Avatar from "@/components/layout/Avatar";
import ContextMenu from "@/components/ui/ContextMenu";

export default function DmRow({ dm, otherUid, active }) {
  const { firebaseUser } = useAuth();
  const router = useRouter();
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

  function openMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    // rechtsbündig am Button, 4px Abstand nach unten
    setMenuPos({ x: rect.right - 220, y: rect.bottom + 4 });
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
      className="group relative"
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuPos({ x: e.clientX, y: e.clientY });
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
        <div className="flex items-center gap-1 relative">
          <span className="truncate flex-1 leading-0">
            {dm.lastMessage && (
              <span className="text-xs text-(--text-muted)">
                {dm.lastMessage.content || (
                  <ChatsCircle size={12} className="inline align-middle" />
                )}
              </span>
            )}
          </span>

          <button
            onClick={openMenu}
            title="Mehr"
            className="size-5 flex items-center justify-center rounded-sm border-none bg-transparent text-(--text-muted) group-hover:opacity-100 hover:bg-(--state-active) hover:text-(--text-secondary) cursor-pointer shrink-0 max-sm:size-10 max-sm:opacity-100 text-sm md:text-base"
          >
            <DotsThreeVertical weight="bold" />
          </button>
        </div>
      </NavRow>

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
