"use client";
import { useState } from "react";
import {
  CaretDown,
  GearSix,
  UserPlus,
  SignOut,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { leaveServer } from "@/lib";
import { ContextMenu, ServerIcon, IconBtn } from "@/components";
import { useLongPress } from "@/hooks";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

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
      <div className="flex h-full items-center justify-between px-2 md:px-4 gap-2">
        {/* Center: Server name with chevron */}
        <button
          {...longPress.handlers}
          onClick={openMenu}
          className={twMerge(
            "flex items-center gap-1 border-none bg-transparent hover:bg-surface-raised/50 cursor-pointer py-2 px-4 rounded-lg w-full md:w-max",
            menuOpen ? "bg-surface-raised/50" : "",
          )}
        >
          <span>{server?.name ?? "..."}</span>
          <CaretDown className="text-white" weight="bold" />
        </button>

        {/* Right: People icon */}
        <IconBtn icon={UserPlusIcon} onClick={onOpenInvite} title="Mitglieder" variant="surface" rounded="full" size="xl" />
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
