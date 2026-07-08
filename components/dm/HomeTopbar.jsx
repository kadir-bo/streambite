"use client";

import { useState, useRef } from "react";
import {
  MagnifyingGlass,
  UserPlus,
  CaretLeft,
  BellSimple,
} from "@phosphor-icons/react";
import { useFriends, useIsDesktop } from "@/hooks";
import { useAuth } from "@/context";
import {
  AddFriendModal,
  IncomingRequestsPopover,
  IconBtn,
  Badge,
  Topbar,
  Button,
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
  const isDesktop = useIsDesktop();

  function toggleInbox() {
    if (!inboxOpen) setAnchorRect(inboxBtnRef.current?.getBoundingClientRect());
    setInboxOpen((v) => !v);
  }

  return (
    <>
      <Topbar className="justify-between gap-2 px-4">
        {/* Center: "Nachrichten" title */}
        <div className="">
          {isDesktop ? (
            <Button className={"py-2"}>
              Freund Hinzufügen
              <UserPlus weight="regular" className="text-xl" />
            </Button>
          ) : (
            <span>Nachrichten</span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Add friend */}
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            title="Freund hinzufügen"
            className="md:hidden flex items-center justify-center size-10 rounded-full border-none bg-surface-hover text-zinc-400 cursor-pointer transition-colors hover:text-white"
          >
            <UserPlus weight="regular" className="text-xl" />
          </button>
          {/* Notifications */}
          <button
            ref={inboxBtnRef}
            type="button"
            title="Benachrichtigungen"
            onClick={toggleInbox}
            className="relative hidden md:flex shrink-0 items-center justify-center size-10 rounded-full border-none bg-surface-hover text-zinc-400 cursor-pointer transition-colors hover:text-white"
          >
            <BellSimple weight="regular" className="text-xl" />
            {totalNotifications > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 size-4 text-2xs">
                {totalNotifications}
              </Badge>
            )}
          </button>
        </div>
      </Topbar>

      <IncomingRequestsPopover
        open={inboxOpen}
        onClose={() => setInboxOpen(false)}
        anchorRect={anchorRect}
        pendingInvites={pendingInvites}
      />
      <AddFriendModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
