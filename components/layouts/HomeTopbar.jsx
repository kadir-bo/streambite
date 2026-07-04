"use client";

import { useState, useRef } from "react";
import {
  UsersThree,
  BellSimple,
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

  function toggleActiveNow() {
    setActiveNowSidebar((prev) => !prev);
  }

  return (
    <>
      <Topbar className="justify-between gap-2 px-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3.5">
          <IconBtn
            icon={CaretLeft}
            onClick={showList}
            title="Zurück"
            size="xl"
            mobileOnly
            className="bg-zinc-800!"
          />

          <div className="hidden items-center gap-2 sm:flex">
            <UsersThree
              weight="fill"
              className="text-zinc-500 text-xl md:text-lg"
            />
            <span className="text-(--text-base) font-semibold">
              Freunde
            </span>
          </div>

          <div className="hidden h-4.5 w-px bg-white/10 sm:block" />

          <button
            onClick={() => setAddOpen(true)}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[8px] border-none bg-(--accent) px-2.5 sm:px-3 py-3 md:py-1.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-(--accent-hover)"
          >
            <UserPlus className="text-lg md:text-md sm:hidden" />
            Freund hinzufügen
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div ref={inboxBtnRef} className="relative">
            <IconBtn
              icon={BellSimple}
              onClick={(e) => {
                e.stopPropagation();
                toggleInbox();
              }}
              title="Posteingang"
              size="xl"
              variant={inboxOpen ? "active" : "ghost"}
              iconWeight={totalNotifications > 0 ? "fill" : "regular"}
            />
            <Badge count={totalNotifications} />
          </div>
          <IconBtn
            icon={UsersThree}
            onClick={toggleActiveNow}
            title="Aktive Freunde"
            size="xl"
            variant={activeNowSidebar ? "active" : "ghost"}
            desktopOnly
          />
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
