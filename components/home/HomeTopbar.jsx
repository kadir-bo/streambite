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
import AddFriendModal from "@/components/home/AddFriendModal";
import IncomingRequestsPopover from "@/components/home/IncomingRequestsPopover";
import { motion } from "framer-motion";
import { useLayout } from "@/context";

export default function HomeTopbar() {
  const { incomingRequests } = useFriends();
  const { setActiveNowSidebar, activeNowSidebar, showList } = useLayout();
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
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-(--border-subtle) bg-(--surface-base) px-2 sm:px-4 h-(--header-channel)">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3.5">
          <button
            onClick={showList}
            title="Zurück"
            className="flex size-7 shrink-0 items-center justify-center rounded-(--radius-base) border-none bg-transparent text-(--text-muted) cursor-pointer md:hidden hover:bg-(--state-hover) hover:text-(--text-secondary)"
          >
            <CaretLeft size={18} />
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <UsersThree
              size={20}
              weight="fill"
              className="text-(--text-muted)"
            />
            <span className="text-(--text-base) font-(--weight-semibold) text-(--text-primary)">
              Freunde
            </span>
          </div>

          <div className="hidden h-4.5 w-px bg-(--border-default) sm:block" />

          <button
            onClick={() => setAddOpen(true)}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-(--radius-base) border-none bg-(--accent) px-2.5 sm:px-3 py-[5px] text-sm font-(--weight-semibold) text-white transition-[background] duration-150 hover:bg-(--accent-hover)"
          >
            <UserPlus size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Freund hinzufügen</span>
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
            className={`relative flex size-8 cursor-pointer items-center justify-center rounded-(--radius-base) border-none ${inboxOpen ? "bg-(--state-active) text-(--text-primary)" : "bg-transparent text-(--text-muted) hover:bg-(--state-hover)"}`}
          >
            <BellSimple
              size={18}
              weight={incomingRequests.length > 0 ? "fill" : "regular"}
            />
            {incomingRequests.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-w-3.5 items-center justify-center rounded-full border-2 border-(--surface-base) bg-(--danger) px-0.75 text-2xs font-(--weight-bold) leading-none text-white">
                {incomingRequests.length}
              </span>
            )}
          </button>
          <button
            ref={inboxBtnRef}
            onClick={toggleActiveNow}
            title="Posteingang"
            className={`relative flex size-8 cursor-pointer items-center justify-center rounded-(--radius-base) border-none ${inboxOpen ? "bg-(--state-active) text-(--text-primary)" : "bg-transparent text-(--text-muted) hover:bg-(--state-hover)"}`}
          >
            <UsersThreeIcon
              size={18}
              weight={incomingRequests.length > 0 ? "fill" : "regular"}
            />
          </button>
        </div>
      </header>

      <IncomingRequestsPopover
        open={inboxOpen}
        onClose={() => setInboxOpen(false)}
        anchorRect={anchorRect}
      />
      <AddFriendModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
