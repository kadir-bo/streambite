"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, ChatCircleText } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { useFriends } from "@/hooks";
import { ensureDm } from "@/lib";
import { Modal, Avatar } from "@/components";

export default function QuickDmSwitcher({ open, onClose }) {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const { friends } = useFriends();
  const [search, setSearch] = useState("");
  const [opening, setOpening] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) =>
      (f.displayName ?? "").toLowerCase().includes(q),
    );
  }, [friends, search]);

  async function openDm(friend) {
    if (!firebaseUser || opening) return;
    setOpening(friend.id);
    try {
      const dmId = await ensureDm(firebaseUser.uid, friend.id);
      router.push(`/channels/dm/${dmId}`);
      handleClose();
    } catch (err) {
      console.error("[dm] quick switcher failed:", err.code, err.message);
    } finally {
      setOpening(null);
    }
  }

  function handleClose() {
    setSearch("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Finde oder starte ein Gespräch"
      maxWidth={420}
    >
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2 bg-(--surface-deep) border border-white/5 rounded-[8px] px-3">
          <MagnifyingGlass className="text-zinc-500 shrink-0 text-xl md:text-lg" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Freund suchen…"
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-100 py-2.5"
          />
        </div>

        <div className="max-h-80 overflow-y-auto flex flex-col gap-0.5">
          {friends.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">
              Du hast noch keine Freunde
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">
              Niemand gefunden
            </p>
          ) : (
            filtered.map((friend) => (
              <button
                key={friend.id}
                onClick={() => openDm(friend)}
                disabled={!!opening}
                className={`flex items-center gap-2.5 py-2 px-2.5 rounded-[8px] border-none bg-transparent cursor-pointer text-left ${
                  opening && opening !== friend.id
                    ? "opacity-50"
                    : "opacity-100"
                } hover:bg-white/5`}
              >
                <Avatar
                  src={friend.avatarUrl}
                  name={friend.displayName}
                  size="sm"
                  status={friend.status}
                />
                <span className="flex-1 text-sm font-medium text-zinc-100 truncate">
                  {friend.displayName}
                </span>
                <ChatCircleText
                  className="text-zinc-500 shrink-0 text-xl md:text-lg"
                />
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
