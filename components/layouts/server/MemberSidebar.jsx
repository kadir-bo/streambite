"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { useAuth, useServer } from "@/context";
import { useMediaQuery } from "@/hooks";
import { subscribeToServerMembers } from "@/lib";
import { MemberRow, IconBtn } from "@/components";

export default function MemberSidebar() {
  const { servers, activeServerId, showMembers, toggleMembers } = useServer();
  const { firebaseUser } = useAuth();
  const [members, setMembers] = useState([]);
  // Below md there's no room for a 3rd column - the member list becomes a
  // full-screen overlay instead of squeezing the chat down to nothing.
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const activeServer = servers.find((s) => s.id === activeServerId);
  const memberIdsKey = (activeServer?.memberIds ?? []).join("|");
  const canManage = activeServer?.ownerId === firebaseUser?.uid;

  // Wie ActiveNowPanel: komplett ausgeblendet wenn collapsed
  const minSidebarWidth = 0;
  const maxSidebarWidth = 300;

  useEffect(() => {
    const ids = activeServer?.memberIds ?? [];
    if (!ids.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <>
      {isDesktop ? (
        <motion.aside
          initial={false}
          className="bg-surface-sidebar border-l border-white/5 shrink-0 py-2.5 overflow-y-auto overflow-x-hidden"
          animate={{
            width: showMembers
              ? `${maxSidebarWidth}px`
              : `${minSidebarWidth}px`,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {showMembers && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* Desktop Header */}
                <div className="flex items-center justify-between px-4 pt-0.5">
                  <h2 className="text-base font-bold text-zinc-100">
                    Mitglieder
                  </h2>
                  <IconBtn
                    icon={X}
                    onClick={toggleMembers}
                    title="Schließen"
                    size="sm"
                  />
                </div>
                <div className="mx-4 mt-3 h-px bg-white/5" />

                {/* Online */}
                {online.length > 0 && (
                  <div className="px-4 mt-3 mb-4">
                    <p className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                      Online — {online.length}
                    </p>
                    <div className="flex flex-col gap-1">
                      {online.map((m) => (
                        <MemberRow
                          key={m.id}
                          member={m}
                          isOffline={false}
                          serverId={activeServerId}
                          canManage={canManage}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Offline */}
                {offline.length > 0 && (
                  <div className="px-4 mb-4">
                    <p className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                      Offline — {offline.length}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {offline.map((m) => (
                        <MemberRow
                          key={m.id}
                          member={m}
                          isOffline
                          serverId={activeServerId}
                          canManage={canManage}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Leerer State */}
                {members.length === 0 && (
                  <div className="px-4 pt-8">
                    <p className="text-xs text-zinc-500 text-center">
                      Keine Mitglieder
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      ) : (
        <AnimatePresence>
          {showMembers && (
            <motion.aside
              key="mobile-member-sidebar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="fixed inset-0 z-[200] w-full bg-(--surface-deep) flex flex-col overflow-hidden"
            >
              {/* Mobile Header mit Safe-Area */}
              <div className="flex items-center justify-between px-4 pt-safe pb-2 border-b border-white/5 shrink-0">
                <h2 className="text-base font-bold text-zinc-100">
                  Mitglieder
                </h2>
                <IconBtn icon={X} onClick={toggleMembers} title="Schließen" />
              </div>

              <div className="flex-1 overflow-y-auto pb-safe">
                {online.length > 0 && (
                  <div className="px-4 mt-3 mb-4">
                    <p className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                      Online — {online.length}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {online.map((m) => (
                        <MemberRow
                          key={m.id}
                          member={m}
                          isOffline={false}
                          serverId={activeServerId}
                          canManage={canManage}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {offline.length > 0 && (
                  <div className="px-4 mb-4">
                    <p className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                      Offline — {offline.length}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {offline.map((m) => (
                        <MemberRow
                          key={m.id}
                          member={m}
                          isOffline
                          serverId={activeServerId}
                          canManage={canManage}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {members.length === 0 && (
                  <div className="px-4 pt-8">
                    <p className="text-xs text-zinc-500 text-center">
                      Keine Mitglieder
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
