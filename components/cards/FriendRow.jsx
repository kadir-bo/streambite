"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatCircleText } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { useFriendActions } from "@/hooks";
import { ensureDm } from "@/lib";
import { Avatar, IconBtn, DotMenu, ContextMenu } from "@/components";

const STATUS_LABELS = {
  online: "Online",
  busy: "Beschäftigt",
  idle: "Abwesend",
  offline: "Offline",
};

export default function FriendRow({ user }) {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const friendActions = useFriendActions(user);

  async function openDm(e) {
    e?.stopPropagation();
    if (opening || !firebaseUser) return;
    setOpening(true);
    try {
      const dmId = await ensureDm(firebaseUser.uid, user.id);
      router.push(`/channels/dm/${dmId}`);
    } catch (err) {
      console.error("[dm] ensureDm failed:", err.code, err.message);
    } finally {
      setOpening(false);
    }
  }

  function openMenu(e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.right - 220, y: rect.bottom + 4 });
    setMenuOpen(true);
  }

  const menuItems = [
    {
      icon: <ChatCircleText className="text-xl md:text-lg" />,
      label: "Nachricht senden",
      onClick: openDm,
    },
    { divider: true },
    ...friendActions.items,
  ];

  return (
    <>
      <div
        onClick={openDm}
        className="flex items-center gap-3 px-4 py-2.5 border-t border-(--border-subtle) cursor-pointer hover:bg-(--state-hover)"
      >
        <Avatar
          src={user.avatarUrl}
          name={user.displayName}
          size="md"
          status={user.status}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-(--text-primary) truncate">
              {user.displayName}
            </span>
            {user.username && (
              <span className="text-xs text-(--text-muted) truncate">
                {user.username}
              </span>
            )}
          </div>
          <p className="text-xs text-(--text-muted)">
            {STATUS_LABELS[user.status] ?? "Offline"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <IconBtn
            icon={ChatCircleText}
            onClick={openDm}
            title="Nachricht senden"
            rounded="full"
            className="bg-(--surface-overlay) text-(--text-secondary) hover:text-(--text-primary)"
          />

          <DotMenu onClick={openMenu} />
        </div>
      </div>

      <ContextMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPos}
        width={220}
        items={menuItems}
      />

      {friendActions.modals}
    </>
  );
}
