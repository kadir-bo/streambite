"use client";
import { useState } from "react";
import { CaretDown, GearSix, UserPlus, SignOut } from "@phosphor-icons/react";
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

  // Measured (not hardcoded) so the dropdown always matches the channel
  // column's actual rendered width, even if that width changes elsewhere later.
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
      <button
        {...longPress.handlers}
        onClick={openMenu}
        className="flex h-full w-full cursor-pointer items-center gap-2 bg-transparent px-3 border-none hover:bg-white/5"
      >
        <div className="size-10 shrink-0 overflow-hidden flex items-center justify-center bg-zinc-800 rounded-full">
          <ServerIcon name={server?.name} iconUrl={server?.iconUrl} size={34} />
        </div>
        <span className="min-w-0 truncate text-sm font-semibold text-zinc-100">
          {server?.name ?? "..."}
        </span>
        <CaretDown className="ml-auto shrink-0 text-zinc-500 text-sm md:text-base" />
      </button>

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
