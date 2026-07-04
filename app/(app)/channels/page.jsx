"use client";

import { useState, useMemo, useEffect } from "react";
import {
  UsersThree,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useLayout } from "@/context";
import { useFriends } from "@/hooks";
import {
  HomeTopbar,
  ActiveNowPanel,
  FriendRow,
} from "@/components";

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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-900">
        <HomeTopbar />

        {friends.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <UsersThree size={48} className="text-zinc-600" />
            <div className="text-center">
              <p className="text-base font-semibold text-zinc-400 mb-1">
                Noch keine Freunde
              </p>
              <p className="text-sm text-zinc-500">
                Füge oben jemanden über &quot;Freund hinzufügen&quot; hinzu.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pt-4">
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 bg-(--surface-deep) border border-white/5 rounded-[8px] px-3">
                <MagnifyingGlass
                  className="text-zinc-500 shrink-0 text-xl md:text-lg"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Suche"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-100 py-2.5"
                />
              </div>
            </div>

            <p className="px-4 pb-1.5 text-2xs font-semibold tracking-widest uppercase text-zinc-500">
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
