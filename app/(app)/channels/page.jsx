"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UsersThree,
  ChatCircleText,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import IconBtn from "@/components/ui/IconBtn";
import DotMenu from "@/components/ui/DotMenu";
import { useAuth, useLayout } from "@/context";
import { useFriends, useFriendActions } from "@/hooks";
import { ensureDm } from "@/lib";
import {
  HomeTopbar,
  ActiveNowPanel,
  ContextMenu,
} from "@/components";
import Avatar from "@/components/layout/Avatar";

const STATUS_LABELS = {
  online: "Online",
  busy: "Beschäftigt",
  idle: "Abwesend",
  offline: "Offline",
};

function FriendRow({ user }) {
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

export default function ChannelsHomePage() {
  const { friends } = useFriends();
  const { showContent } = useLayout();

  const [search, setSearch] = useState("");

  // On mobile, landing on /channels (e.g. via the "Freunde" list entry)
  // switches from the list pane to this content pane.
  useEffect(() => {
    showContent();
  }, [showContent]);

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => {
      const aOnline = a.status !== "offline";
      const bOnline = b.status !== "offline";
      if (aOnline !== bOnline) return aOnline ? -1 : 1;
      return (a.displayName ?? "").localeCompare(b.displayName ?? "");
    });
  }, [friends]);

  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedFriends;
    return sortedFriends.filter((f) =>
      (f.displayName ?? "").toLowerCase().includes(q),
    );
  }, [sortedFriends, search]);

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-(--surface-base)">
        <HomeTopbar />

        {friends.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <UsersThree size={48} className="text-(--text-ghost)" />
            <div className="text-center">
              <p className="text-base font-semibold text-(--text-secondary) mb-1">
                Noch keine Freunde
              </p>
              <p className="text-sm text-(--text-muted)">
                Füge oben jemanden über &quot;Freund hinzufügen&quot; hinzu.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pt-4">
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 bg-(--surface-deep) border border-(--border-subtle) rounded-(--radius-base) px-3">
                <MagnifyingGlass
                  className="text-(--text-muted) shrink-0 text-xl md:text-lg"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Suche"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-(--text-primary) py-2.5"
                />
              </div>
            </div>

            <p className="px-4 pb-1.5 text-2xs font-semibold tracking-widest uppercase text-(--text-muted)">
              Alle Freunde — {filteredFriends.length}
            </p>

            <div>
              {filteredFriends.map((f) => (
                <FriendRow key={f.id} user={f} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ActiveNowPanel />
    </div>
  );
}
