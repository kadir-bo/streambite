"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { subscribeToUserDms } from "@/lib";
import { QuickDmSwitcher, DmRow } from "@/components";

export default function DmSidebar() {
  const { firebaseUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [dms, setDms] = useState([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeToUserDms(firebaseUser.uid, setDms);
  }, [firebaseUser]);

  const navigateToChannels = () => {
    router.push("/channels");
  };
  return (
    <div className="py-2">
      {/* Search bar */}
      <div className="px-2 py-3 flex flex-col gap-2">
        <button
          onClick={() => setSwitcherOpen(true)}
          className="w-full flex items-center gap-2 py-3 px-3 rounded-md border border-white/5 bg-surface-deep text-zinc-500 text-sm cursor-pointer text-left truncate hover:text-zinc-400"
        >
          <MagnifyingGlass className="shrink-0 text-lg" />
          <span className="truncate">Finde oder starte ein Gespräch</span>
        </button>
      </div>

      {/* Direktnachrichten header */}
      <div className="px-4 py-2">
        <button
          onClick={navigateToChannels}
          title="Neues Gespräch starten"
          className="p-0 text-xs flex w-full items-center justify-between border-none bg-transparent text-zinc-500 cursor-pointer rounded-sm hover:text-zinc-400"
        >
          Direktnachrichten
          <Plus weight="bold" className="text-base" />
        </button>
      </div>

      {/* DM list */}
      {dms.length === 0 ? (
        <p className="px-4 py-1 text-xs text-zinc-600">
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
