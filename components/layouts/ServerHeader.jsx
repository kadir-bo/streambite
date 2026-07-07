"use client";
import { useState } from "react";
import { CaretDown, GearSix, UserPlus, SignOut, UsersThree } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { leaveServer } from "@/lib";
import { ContextMenu, ServerIcon } from "@/components";
import { useLongPress } from "@/hooks";
import { useRouter } from "next/navigation";

export default function ServerHeader({
  server,
  isOwner,
  onOpenSettings,
  onOpenInvite,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [menuWidth, setMenuWidth] = useState(0);
  const longPress = useLongPress(openMenu);
  const { firebaseUser } = useAuth();
  const router = useRouter();

  function openMenu(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.bottom + 4 });
    setMenuWidth(rect.width);
    setMenuOpen(true);
  }

  async function handleLeave() {
    if (!firebaseUser || !server) return;
    await leaveServer(server.id, firebaseUser.uid);
    router.push("/channels");
  }

  const menuItems = [
    ...(isOwner
      ? [
          {
            icon: <GearSix />,
            label: "Servereinstellungen",
            onClick: onOpenSettings,
          },
        ]
      : []),
    {
      icon: <UserPlus />,
      label: "Freunde einladen",
      onClick: onOpenInvite,
    },
    { divider: true },
    {
      icon: <SignOut />,
      label: "Server verlassen",
      danger: true,
      onClick: handleLeave,
    },
  ];

  return (
    <>
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Gear icon (owner only) */}
        {isOwner ? (
          <button
            onClick={onOpenSettings}
            title="Servereinstellungen"
            className="flex items-center justify-center size-10 rounded-full border-none bg-[#1c1c28] text-zinc-400 cursor-pointer transition-colors hover:text-white"
          >
            <GearSix weight="regular" className="text-xl" />
          </button>
        ) : (
          <div className="size-10" />
        )}

        {/* Center: Server name with chevron */}
        <button
          {...longPress.handlers}
          onClick={openMenu}
          className="flex items-center gap-2 border-none bg-transparent cursor-pointer"
        >
          <span className="text-lg font-bold text-white">
            {server?.name ?? "..."}
          </span>
          <CaretDown className="text-zinc-400 text-sm" />
        </button>

        {/* Right: People icon */}
        <button
          onClick={onOpenInvite}
          title="Mitglieder"
          className="flex items-center justify-center size-10 rounded-full border-none bg-[#1c1c28] text-zinc-400 cursor-pointer transition-colors hover:text-white"
        >
          <UsersThree weight="regular" className="text-xl" />
        </button>
      </div>

      <ContextMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPos}
        width={menuWidth}
        items={menuItems}
      />
    </>
  );
}
