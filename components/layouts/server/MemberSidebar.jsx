"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { useAuth, useServer } from "@/context";
import { useMediaQuery } from "@/hooks";
import { subscribeToServerMembers } from "@/lib";
import { MemberRow, IconBtn } from "@/components";

function MemberSection({ label, count, prefix, gap, groups, isOffline, serverId, canManage }) {
  const roleLabel = { owner: "Owner", admin: "Admin", member: "Mitglied" };
  const roleOrder = ["owner", "admin", "member"];

  if (count === 0) return null;

  return (
    <div className={prefix}>
      <p className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
        {label} — {count}
      </p>
      {roleOrder.map((role) => {
        const list = groups[role];
        if (list.length === 0) return null;
        return (
          <div key={role} className="mb-2 last:mb-0">
            <p className="text-2xs font-medium uppercase tracking-wider text-zinc-600 mb-0.5 ml-1">
              {roleLabel[role]}
            </p>
            <div className={`flex flex-col ${gap}`}>
              {list.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  isOffline={isOffline ?? false}
                  serverId={serverId}
                  canManage={canManage}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MemberSidebar() {
  const { servers, activeServerId, showMembers, toggleMembers, userRoles } = useServer();
  const { firebaseUser } = useAuth();
  const [members, setMembers] = useState([]);
  // Below md there's no room for a 3rd column - the member list becomes a
  // full-screen overlay instead of squeezing the chat down to nothing.
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const activeServer = servers.find((s) => s.id === activeServerId);
  const memberIdsKey = (activeServer?.memberIds ?? []).join("|");
  const isOwner = activeServer?.ownerId === firebaseUser?.uid;
  const canManage = isOwner || userRoles?.includes("admin");

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

  // Online bucket = anything that isn't explicitly offline
  const online = members.filter((m) => (m.status ?? "online") !== "offline");
  const offline = members.filter((m) => (m.status ?? "online") === "offline");

  function groupByRole(list) {
    const groups = { owner: [], admin: [], member: [] };
    for (const m of list) {
      if (m.roles?.includes("owner")) groups.owner.push(m);
      else if (m.roles?.includes("admin")) groups.admin.push(m);
      else groups.member.push(m);
    }
    return groups;
  }

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

                {/* Member-Sektionen */}
                <MemberSection
                  label="Online"
                  count={online.length}
                  prefix="px-4 mt-3 mb-4"
                  gap="gap-1"
                  groups={groupByRole(online)}
                  serverId={activeServerId}
                  canManage={canManage}
                />
                <MemberSection
                  label="Offline"
                  count={offline.length}
                  prefix="px-4 mb-4"
                  gap="gap-0.5"
                  groups={groupByRole(offline)}
                  isOffline
                  serverId={activeServerId}
                  canManage={canManage}
                />
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
                <MemberSection
                  label="Online"
                  count={online.length}
                  prefix="px-4 mt-3 mb-4"
                  gap="gap-0.5"
                  groups={groupByRole(online)}
                  serverId={activeServerId}
                  canManage={canManage}
                />
                <MemberSection
                  label="Offline"
                  count={offline.length}
                  prefix="px-4 mb-4"
                  gap="gap-0.5"
                  groups={groupByRole(offline)}
                  isOffline
                  serverId={activeServerId}
                  canManage={canManage}
                />
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
