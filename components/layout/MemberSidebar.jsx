"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { useAuth, useServer } from "@/context";
import { useMediaQuery } from "@/hooks";
import { subscribeToServerMembers } from "@/lib";
import SectionLabel from "@/components/ui/SectionLabel";
import MemberRow from "@/components/layout/MemberRow";

export default function MemberSidebar() {
  const { servers, activeServerId, showMembers, toggleMembers } = useServer();
  const { firebaseUser } = useAuth();
  const [members, setMembers] = useState([]);
  // Below md there's no room for a 3rd column — the member list becomes a
  // full-screen overlay instead of squeezing the chat down to nothing.
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const activeServer = servers.find((s) => s.id === activeServerId);
  const memberIdsKey = (activeServer?.memberIds ?? []).join("|");
  const canManage = activeServer?.ownerId === firebaseUser?.uid;

  const minSidebarWidth = 48;
  const maxSidebarWidth = 300;

  useEffect(() => {
    const ids = activeServer?.memberIds ?? [];
    if (!ids.length) {
      setMembers([]);
      return;
    }
    const unsub = subscribeToServerMembers(activeServerId, ids, setMembers);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeServerId, memberIdsKey]);

  // Online bucket = anything that isn't explicitly offline (online/busy/idle all
  // count as "active"; idle was previously excluded from both buckets entirely).
  const online = members.filter((m) => (m.status ?? "online") !== "offline");
  const offline = members.filter((m) => (m.status ?? "online") === "offline");

  if (!isDesktop && !showMembers) return null;

  return (
    <motion.aside
      animate={
        isDesktop
          ? { width: showMembers ? `${maxSidebarWidth}px` : `${minSidebarWidth}px` }
          : { opacity: 1 }
      }
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`bg-(--surface-deep) shrink-0 py-2.5 overflow-y-auto overflow-x-hidden ${
        isDesktop
          ? "border-l border-(--border-subtle)"
          : "fixed inset-0 z-(--z-modal) w-full"
      }`}
    >
      <AnimatePresence mode="wait">
        {showMembers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-2"
          >
            {!isDesktop && (
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-sm font-semibold text-(--text-primary)">
                  Mitglieder
                </span>
                <button
                  onClick={toggleMembers}
                  title="Schließen"
                  className="flex size-8 items-center justify-center rounded-(--radius-base) border-none bg-transparent text-(--text-muted) cursor-pointer hover:bg-(--state-hover) hover:text-(--text-secondary)"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {online.length > 0 && (
              <section>
                <SectionLabel label="Online" count={online.length} />
                {online.map((m) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    isOffline={false}
                    serverId={activeServerId}
                    canManage={canManage}
                  />
                ))}
              </section>
            )}

            {offline.length > 0 && (
              <section>
                <SectionLabel label="Offline" count={offline.length} />
                {offline.map((m) => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    isOffline
                    serverId={activeServerId}
                    canManage={canManage}
                  />
                ))}
              </section>
            )}

            {members.length === 0 && (
              <p className="text-xs text-(--text-muted) text-center px-4 pt-4">
                Keine Mitglieder
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
