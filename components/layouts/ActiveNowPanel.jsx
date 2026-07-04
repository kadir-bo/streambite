"use client";

import { AnimatePresence, motion } from "motion/react";
import { Sparkle } from "@phosphor-icons/react";
import { useFriends } from "@/hooks";

import { ActiveFriendRow } from "@/components";
import { useLayout } from "@/context";

export default function ActiveNowPanel() {
  const { friends } = useFriends();
  const { activeNowSidebar, setActiveNowSidebar } = useLayout();
  const minSidebarWidth = 0;
  const maxSidebarWidth = 300;

  const activeFriends = friends.filter(
    (f) => f.status === "online" || f.status === "busy" || f.status === "idle",
  );
  const offlineFriends = friends.filter((f) => f.status === "offline");

  const toggleSidebar = () => {
    setActiveNowSidebar((prev) => !prev);
  };
  return (
    <motion.aside
      initial={false}
      className="hidden md:flex md:flex-col bg-(--surface-deep) border-l border-white/5 shrink-0 py-2.5 overflow-y-auto overflow-x-hidden"
      animate={{
        width: activeNowSidebar
          ? `${maxSidebarWidth}px`
          : `${minSidebarWidth}px`,
      }}
    >
      <AnimatePresence mode="wait">
        {activeNowSidebar && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="px-4"
          >
            {/* Jetzt aktiv (Online-Freunde) */}
            <p className="text-base font-bold text-zinc-100 mb-3">
              Jetzt aktiv
            </p>
            <div className="w-full h-px bg-white/5 my-2" />
            {activeFriends.length === 0 ? (
              <div className="bg-zinc-800 border border-white/5 rounded-lg px-4.5 py-6 text-center mb-4">
                <Sparkle
                  size={28}
                  weight="fill"
                  className="text-zinc-600 mb-2.5 mx-auto"
                />
                <p className="text-sm font-semibold text-zinc-400 mb-1.5">
                  Bisher ist alles ruhig …
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Wenn ein Freund online ist oder gerade chattet, siehst du es
                  hier.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 mb-4">
                {activeFriends.map((friend) => (
                  <ActiveFriendRow key={friend.id} friend={friend} />
                ))}
              </div>
            )}

            {/* Offline-Freunde */}
            {offlineFriends.length > 0 && (
              <>
                <p className="text-2xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                  Offline - {offlineFriends.length}
                </p>
                <div className="flex flex-col gap-0.5">
                  {offlineFriends.map((friend) => (
                    <ActiveFriendRow key={friend.id} friend={friend} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
