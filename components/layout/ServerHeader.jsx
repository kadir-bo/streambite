"use client";
import { useState } from "react";
import { CaretDown, GearSix, UserPlus, SignOut } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { leaveServer } from "@/lib";
import ContextMenu from "@/components/ui/ContextMenu";
import ServerIcon from "@/components/server/ServerIcon";
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
            icon: <GearSix size={14} />,
            label: "Servereinstellungen",
            onClick: onOpenSettings,
          },
        ]
      : []),
    {
      icon: <UserPlus size={14} />,
      label: "Freunde einladen",
      onClick: onOpenInvite,
    },
    { divider: true },
    {
      icon: <SignOut size={14} />,
      label: "Server verlassen",
      danger: true,
      onClick: handleLeave,
    },
  ];

  return (
    <>
      <button
        onClick={openMenu}
        className="flex h-full w-full cursor-pointer items-center gap-2 bg-transparent px-3 border-none hover:bg-(--state-hover)"
      >
        <div className="size-6 shrink-0 overflow-hidden flex items-center justify-center bg-(--surface-raised) rounded-full">
          <ServerIcon name={server?.name} iconUrl={server?.iconUrl} size={24} />
        </div>
        <span className="min-w-0 truncate text-sm font-semibold text-(--text-primary)">
          {server?.name ?? "..."}
        </span>
        <CaretDown size={13} className="ml-auto shrink-0 text-(--text-muted)" />
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
