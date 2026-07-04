"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatCircleText } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { useFriendActions, useLongPress } from "@/hooks";
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

  const longPress = useLongPress(openMenu);

  async function openDm(e) {
    if (longPress.wasActive.current) {
      longPress.clear();
      return;
    }
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
        {...longPress.handlers}
        onClick={openDm}
        className="flex items-center gap-3 px-4 py-2.5 border-t border-white/5 cursor-pointer hover:bg-white/5 max-sm:min-h-12"
      >
        <Avatar
          src={user.avatarUrl}
          name={user.displayName}
          size="md"
          status={user.status}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-zinc-100 truncate">
              {user.displayName}
            </span>
            {user.username && (
              <span className="text-xs text-zinc-500 truncate">
                {user.username}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            {STATUS_LABELS[user.status] ?? "Offline"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <IconBtn
            icon={ChatCircleText}
            onClick={openDm}
            title="Nachricht senden"
            rounded="full"
            className="bg-zinc-700 text-zinc-400 hover:text-zinc-100"
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
