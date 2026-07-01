"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { BellSimple } from "@phosphor-icons/react";
import { dropdown } from "@/lib";
import { useFriends } from "@/hooks";
import { useAuth } from "@/context";
import { ServerInviteRow, RequestRow } from "@/components";

export default function IncomingRequestsPopover({
  open,
  onClose,
  anchorRect,
  pendingInvites = [],
}) {
  const { incomingRequests } = useFriends();
  const { firebaseUser } = useAuth();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function close() {
      onCloseRef.current();
    }
    const tid = setTimeout(() => window.addEventListener("click", close), 0);
    return () => {
      clearTimeout(tid);
      window.removeEventListener("click", close);
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  const hasFriendRequests = incomingRequests.length > 0;
  const hasServerInvites = pendingInvites.length > 0;
  const hasAny = hasFriendRequests || hasServerInvites;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={dropdown}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-(--z-tooltip) w-85 overflow-y-auto rounded-lg border border-(--border-subtle) bg-(--surface-raised) shadow-(--shadow-xl)"
          style={{
            top: (anchorRect?.bottom ?? 0) + 8,
            right: anchorRect ? window.innerWidth - anchorRect.right : 0,
            maxHeight: 440,
          }}
        >
          {!hasAny ? (
            <div className="px-4 py-6 text-center">
              <BellSimple
                size={28}
                className="mx-auto mb-2 text-(--text-ghost)"
              />
              <p className="text-xs text-(--text-ghost)">
                Keine offenen Anfragen
              </p>
            </div>
          ) : (
            <>
              {/* Friend requests section */}
              {hasFriendRequests && (
                <>
                  <p className="px-3 pt-3 pb-1.5 text-2xs font-(--weight-semibold) uppercase tracking-widest text-(--text-muted)">
                    Freundschaftsanfragen
                  </p>
                  {incomingRequests.map((user) => (
                    <RequestRow key={user.id} user={user} />
                  ))}
                </>
              )}

              {/* Server invite section */}
              {hasServerInvites && (
                <>
                  {hasFriendRequests && (
                    <div className="mx-3 my-1 h-px bg-(--border-subtle)" />
                  )}
                  <p className="px-3 pt-2 pb-1.5 text-2xs font-(--weight-semibold) uppercase tracking-widest text-(--text-muted)">
                    Servereinladungen
                  </p>
                  {pendingInvites.map((invite) => (
                    <ServerInviteRow
                      key={invite.serverId}
                      invite={invite}
                      uid={firebaseUser?.uid}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
