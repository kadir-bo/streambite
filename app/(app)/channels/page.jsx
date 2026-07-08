"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UsersThree,
  MagnifyingGlass,
  ArrowBendUpRight,
  ChatCircleText,
} from "@phosphor-icons/react";
import { useLayout, useAuth } from "@/context";
import { useFriends } from "@/hooks";
import { ensureDm } from "@/lib";
import { HomeTopbar, Avatar, DmRow, FriendCard } from "@/components";

export default function ChannelsHomePage() {
  const { friends } = useFriends();
  const { showContent } = useLayout();
  const { firebaseUser } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [opening, setOpening] = useState(null);

  // On mobile, landing on /channels switches from list pane to content pane
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

  const onlineFriends = useMemo(() => {
    return sortedFriends.filter(
      (f) =>
        f.status === "online" || f.status === "busy" || f.status === "idle",
    );
  }, [sortedFriends]);

  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedFriends;
    return sortedFriends.filter((f) =>
      (f.displayName ?? "").toLowerCase().includes(q),
    );
  }, [sortedFriends, search]);

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
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface-app">
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
        <div className="flex-1 overflow-y-auto">
          {/* "X Freunde Online" Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <span className="text-base font-semibold text-white">
              {`${onlineFriends.length} ${onlineFriends.length < 2 ? "Freund" : "Freunde"} Online`}
            </span>
          </div>

          {/* Online friends avatar row */}
          {onlineFriends.length > 0 && (
            <div className="flex gap-3 px-4 pb-5 overflow-x-auto md:hidden">
              {onlineFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  opening={opening}
                  onClick={openDm}
                />
              ))}
            </div>
          )}

          {/* DM list */}
          <div className="px-2">
            {filteredFriends.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => openDm(friend)}
                disabled={opening === friend.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-none bg-transparent cursor-pointer transition-colors hover:bg-surface-hover text-left"
              >
                <div className="relative shrink-0">
                  <Avatar
                    src={friend.avatarUrl}
                    name={friend.displayName}
                    size="lg"
                  />
                  <span
                    className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-surface-app"
                    style={{
                      background:
                        friend.status === "online"
                          ? "#4ac263"
                          : friend.status === "busy"
                            ? "#f5340b"
                            : "#686868",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white truncate">
                    {friend.displayName}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {friend.status === "online"
                      ? "Online"
                      : friend.status === "busy"
                        ? "Beschäftigt"
                        : friend.status === "idle"
                          ? "Untätig"
                          : "Offline"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
