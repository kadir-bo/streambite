"use client";

import { useState, useRef } from "react";
import {
  MagnifyingGlass,
  UserPlus,
  CaretLeft,
} from "@phosphor-icons/react";
import { useFriends } from "@/hooks";
import { useAuth } from "@/context";
import {
  AddFriendModal,
  IncomingRequestsPopover,
  IconBtn,
  Badge,
  Topbar,
} from "@/components";
import { useLayout } from "@/context";

export default function HomeTopbar() {
  const { incomingRequests, inboxOpen, setInboxOpen } = useFriends();
  const { userDoc } = useAuth();
  const { setActiveNowSidebar, activeNowSidebar, showList } = useLayout();
  const pendingInvites = userDoc?.pendingInvites ?? [];
  const totalNotifications = incomingRequests.length + pendingInvites.length;

  const [addOpen, setAddOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const inboxBtnRef = useRef(null);

  function toggleInbox() {
    if (!inboxOpen) setAnchorRect(inboxBtnRef.current?.getBoundingClientRect());
    setInboxOpen((v) => !v);
  }

  return (
    <>
      <Topbar className="justify-between gap-2 px-4">
        {/* Left: Search icon (mobile back) */}
        <div className="flex min-w-0 items-center gap-3">
          <IconBtn
            icon={CaretLeft}
            onClick={showList}
            title="Zurück"
            size="xl"
            mobileOnly
            className="bg-[#1c1c28]!"
          />
          <button
            type="button"
            title="Suche"
            className="flex items-center justify-center size-10 rounded-full border-none bg-[#1c1c28] text-zinc-400 cursor-pointer transition-colors hover:text-white hidden md:flex"
          >
            <MagnifyingGlass weight="regular" className="text-xl" />
          </button>
        </div>

        {/* Center: "Nachrichten" title */}
        <span className="text-lg font-bold text-white">
          Nachrichten
        </span>

        {/* Right: Add friend */}
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          title="Freund hinzufügen"
          className="flex items-center justify-center size-10 rounded-full border-none bg-[#1c1c28] text-zinc-400 cursor-pointer transition-colors hover:text-white"
        >
          <UserPlus weight="regular" className="text-xl" />
        </button>
      </Topbar>

      <AddFriendModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
