"use client";

import { useState, useRef } from "react";
import {
  UsersThree,
  BellSimple,
  UsersThreeIcon,
  UserPlus,
  CaretLeft,
} from "@phosphor-icons/react";
import { useFriends } from "@/hooks";
import { useAuth } from "@/context";
import AddFriendModal from "@/components/home/AddFriendModal";
import IncomingRequestsPopover from "@/components/home/IncomingRequestsPopover";
import { motion } from "framer-motion";
import { useLayout } from "@/context";

export default function HomeTopbar() {
  const { incomingRequests } = useFriends();
  const { userDoc } = useAuth();
  const { setActiveNowSidebar, activeNowSidebar, showList } = useLayout();
  const pendingInvites = userDoc?.pendingInvites ?? [];
  const totalNotifications = incomingRequests.length + pendingInvites.length;

  const [addOpen, setAddOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
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
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-(--border-subtle) bg-(--surface-base) px-2 sm:px-4 py-2 md:h-(--header-channel)">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3.5">
          <button
            onClick={showList}
            title="Zurück"
            className="flex size-10 shrink-0 items-center justify-center rounded-(--radius-base) border-none bg-transparent text-(--text-muted) cursor-pointer md:hidden hover:bg-(--state-hover) hover:text-(--text-secondary) text-xl md:text-lg"
          >
            <CaretLeft />
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <UsersThree
              weight="fill"
              className="text-(--text-muted) text-xl md:text-lg"
            />
            <span className="text-(--text-base) font-(--weight-semibold) text-(--text-primary)">
              Freunde
            </span>
          </div>

          <div className="hidden h-4.5 w-px bg-(--border-default) sm:block" />

          <button
            onClick={() => setAddOpen(true)}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-(--radius-base) border-none bg-(--accent) px-2.5 sm:px-3 py-2 md:py-1.5 text-sm font-(--weight-semibold) text-white transition-[background] duration-150 hover:bg-(--accent-hover)"
          >
            <UserPlus className="text-lg md:text-md sm:hidden" />
            <span>Freund hinzufügen</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            ref={inboxBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              toggleInbox();
            }}
            title="Posteingang"
            className={`relative flex size-12 text-xl md:text-lg cursor-pointer items-center justify-center rounded-(--radius-base) border-none ${inboxOpen ? "bg-(--state-active) text-(--text-primary)" : "bg-transparent text-(--text-muted) hover:bg-(--state-hover)"}`}
          >
            <BellSimple weight={totalNotifications > 0 ? "fill" : "regular"} />
            {totalNotifications > 0 && (
              <span className="absolute -right-1 -top-0.5 flex min-w-[20px] items-center justify-center rounded-full border-2 border-(--surface-base) bg-(--danger) px-1 py-0.5 text-[10px] font-(--weight-bold) leading-none text-white">
                {totalNotifications}
              </span>
            )}
          </button>
          <button
            onClick={toggleActiveNow}
            title="Aktive Freunde"
            className={`relative hidden md:flex size-8 cursor-pointer items-center justify-center rounded-(--radius-base) border-none text-xl md:text-lg ${activeNowSidebar ? "bg-(--state-active) text-(--text-primary)" : "bg-transparent text-(--text-muted) hover:bg-(--state-hover)"}`}
          >
            <UsersThreeIcon weight={activeNowSidebar ? "fill" : "regular"} />
          </button>
        </div>
      </header>

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
