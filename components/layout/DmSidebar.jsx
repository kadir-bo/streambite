"use client";

import { useState, useEffect } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { UsersThree, MagnifyingGlass, Plus, ChatCircleText } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { useFriends } from "@/hooks";
import { subscribeToUserDms, ensureDm } from "@/lib";
import QuickDmSwitcher from "@/components/layout/QuickDmSwitcher";
import NavRow from "@/components/layout/NavRow";
import DmRow from "@/components/layout/DmRow";
import Avatar from "@/components/layout/Avatar";

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
          <MagnifyingGlass size={13} className="shrink-0" />
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
            size={20}
            weight={isHome ? "fill" : "regular"}
            className={`shrink-0 ${isHome ? "text-(--text-primary)" : "text-(--text-muted)"}`}
          />
        }
        textClassName="flex items-center"
        label="Freunde"
      />

      {/* Online-Freunde */}
      {onlineFriends.length > 0 && (
        <div className="px-2 pt-1 pb-1">
          <p className="px-1 py-1 text-2xs font-semibold uppercase tracking-wider text-(--text-muted)">
            Online — {onlineFriends.length}
          </p>
          <div className="flex flex-col gap-0.5">
            {onlineFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => openDm(friend)}
                disabled={!!opening}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-(--radius-base) border-none bg-transparent cursor-pointer text-left w-full ${
                  opening && opening !== friend.id
                    ? "opacity-50"
                    : "opacity-100"
                } hover:bg-(--state-hover)`}
              >
                <Avatar
                  src={friend.avatarUrl}
                  name={friend.displayName}
                  size="sm"
                  status={friend.status}
                />
                <span className="flex-1 text-sm font-medium text-(--text-primary) truncate">
                  {friend.displayName}
                </span>
                <ChatCircleText
                  size={14}
                  className="text-(--text-muted) shrink-0"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-2">
        <button
          onClick={() => setSwitcherOpen(true)}
          title="Neues Gespräch starten"
          className="p-2 text-xs flex w-full items-center justify-between border-none bg-transparent text-(--text-muted) cursor-pointer rounded-sm hover:text-(--text-secondary)"
        >
          Direktnachrichten
          <Plus size={12} weight="bold" />
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
