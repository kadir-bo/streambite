"use client";

import { useState, useEffect } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  UsersThree,
  MagnifyingGlass,
  Plus,
  ChatCircleText,
} from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { useFriends } from "@/hooks";
import { subscribeToUserDms, ensureDm } from "@/lib";
import { QuickDmSwitcher, NavRow, DmRow, Avatar } from "@/components";

export default function DmSidebar() {
  const { firebaseUser } = useAuth();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [dms, setDms] = useState([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { friends } = useFriends();
  const [opening, setOpening] = useState(null);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeToUserDms(firebaseUser.uid, setDms);
  }, [firebaseUser]);

  const isHome = pathname === "/channels";

  const onlineFriends = friends.filter(
    (f) => f.status === "online" || f.status === "busy" || f.status === "idle",
  );

  async function openDm(friend) {
    if (!firebaseUser || opening) return;
    setOpening(friend.id);
    try {
      const dmId = await ensureDm(firebaseUser.uid, friend.id);
      router.push(`/channels/dm/${dmId}`);
    } catch (err) {
      console.error("[dm] openDm failed:", err.code, err.message);
    } finally {
      setOpening(null);
    }
  }

  return (
    <div className="py-2">
      <div className="px-2 pb-2">
        <button
          onClick={() => setSwitcherOpen(true)}
          className="w-full flex items-center gap-2 py-1.75 px-2.5 rounded-(--radius-base) border-none bg-(--surface-deepest) text-(--text-muted) text-xs cursor-pointer text-left truncate hover:text-(--text-secondary) "
        >
          <MagnifyingGlass className="shrink-0 text-xl md:text-lg" />
          <span className="truncate text-sm">
            Finde oder starte ein Gespräch
          </span>
        </button>
      </div>

      <NavRow
        href="/channels"
        active={isHome}
        icon={
            <UsersThree
              weight={isHome ? "fill" : "regular"}
              className={`shrink-0 text-xl md:text-lg ${isHome ? "text-(--text-primary)" : "text-(--text-muted)"}`}
            />
        }
        textClassName="flex items-center"
        label="Freunde"
      />

      <div className="p-2">
        <button
          onClick={() => setSwitcherOpen(true)}
          title="Neues Gespräch starten"
          className="p-2 text-xs flex w-full items-center justify-between border-none bg-transparent text-(--text-muted) cursor-pointer rounded-sm hover:text-(--text-secondary)"
        >
          Direktnachrichten
          <Plus weight="bold" className="text-sm md:text-base" />
        </button>
      </div>

      {dms.length === 0 ? (
        <p className="px-4 py-1 text-xs text-(--text-ghost)">
          Noch keine Unterhaltungen
        </p>
      ) : (
        dms.map((dm) => {
          const otherUid = dm.participants.find(
            (uid) => uid !== firebaseUser?.uid,
          );
          return (
            <DmRow
              key={dm.id}
              dm={dm}
              otherUid={otherUid}
              active={params?.dmId === dm.id}
            />
          );
        })
      )}

      <QuickDmSwitcher
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
      />
    </div>
  );
}
