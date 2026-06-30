"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { BellSimple } from "@phosphor-icons/react";
import { dropdown } from "@/lib";
import { useFriends } from "@/hooks";
import RequestRow from "@/components/layout/RequestRow";

export default function IncomingRequestsPopover({ open, onClose, anchorRect }) {
  const { incomingRequests } = useFriends();
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

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={dropdown}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-(--z-tooltip) w-[320px] overflow-y-auto rounded-lg border border-(--border-subtle) bg-(--surface-overlay) shadow-(--shadow-xl)"
          style={{
            top: (anchorRect?.bottom ?? 0) + 8,
            right: anchorRect ? window.innerWidth - anchorRect.right : 0,
            maxHeight: 400,
          }}
        >
          <p className="px-3 pt-3 pb-1.5 text-2xs font-(--weight-semibold) uppercase tracking-widest text-(--text-muted)">
            Freundschaftsanfragen
          </p>

          {incomingRequests.length === 0 ? (
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
            incomingRequests.map((user) => (
              <RequestRow key={user.id} user={user} />
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
