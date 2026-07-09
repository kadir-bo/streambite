"use client";

import { useState, useRef } from "react";
import { UserPlus, BellSimple } from "@phosphor-icons/react";
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
export default function HomeTopbar() {
  const { incomingRequests, inboxOpen, setInboxOpen } = useFriends();
  const { userDoc } = useAuth();
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
            <Button className={"py-2"} onClick={() => setAddOpen(true)}>
              Freund Hinzufügen
              <UserPlus weight="regular" className="text-xl" />
            </Button>
          ) : (
            <span>Nachrichten</span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Add friend */}
          <IconBtn icon={UserPlus} onClick={() => setAddOpen(true)} title="Freund hinzufügen" variant="surface" rounded="full" size="xl" mobileOnly />
          {/* Notifications */}
          <div ref={inboxBtnRef} className="relative hidden md:flex">
            <IconBtn
              icon={BellSimple}
              onClick={toggleInbox}
              variant="surface"
              rounded="full"
              size="xl"
              desktopOnly
              title="Benachrichtigungen"
            />
            {totalNotifications > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 size-4 text-2xs pointer-events-none">
                {totalNotifications}
              </Badge>
            )}
          </div>
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
