"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { BellSimple, Check, X } from "@phosphor-icons/react";
import { dropdown, acceptServerInvite, declineServerInvite } from "@/lib";
import { useFriends } from "@/hooks";
import { useAuth } from "@/context";
import RequestRow from "@/components/layout/RequestRow";
import ServerIcon from "@/components/server/ServerIcon";
import IconBtn from "@/components/ui/IconBtn";

export default function IncomingRequestsPopover({ open, onClose, anchorRect, pendingInvites = [] }) {
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
          className="fixed z-(--z-tooltip) w-[340px] overflow-y-auto rounded-lg border border-(--border-subtle) bg-(--surface-overlay) shadow-(--shadow-xl)"
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
                  {hasFriendRequests && <div className="mx-3 my-1 h-px bg-(--border-subtle)" />}
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

function ServerInviteRow({ invite, uid }) {
  const [loading, setLoading] = useState(null);

  async function handleAccept() {
    if (!uid) return;
    setLoading("accept");
    try {
      await acceptServerInvite(uid, invite);
    } catch (err) {
      console.error("[invite] accept failed:", err);
    } finally {
      setLoading(null);
    }
  }

  async function handleDecline() {
    if (!uid) return;
    setLoading("decline");
    try {
      await declineServerInvite(uid, invite.serverId);
    } catch (err) {
      console.error("[invite] decline failed:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2">
      <div className="size-8 shrink-0 overflow-hidden rounded-md">
        <ServerIcon
          name={invite.serverName}
          iconUrl={invite.serverIconUrl}
          size={32}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-(--weight-medium) text-(--text-primary)">
          {invite.serverName}
        </p>
        <p className="text-xs text-(--text-muted)">
          {invite.invitedByName ?? "Jemand"} hat dich eingeladen
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <IconBtn icon={Check} onClick={handleAccept} title="Annehmen" variant="primary" disabled={!!loading} rounded="full" />
        <IconBtn icon={X} onClick={handleDecline} title="Ablehnen" variant="danger" disabled={!!loading} rounded="full" />
      </div>
    </div>
  );
}
