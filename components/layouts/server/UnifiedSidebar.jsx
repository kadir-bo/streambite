"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLayout, useVoice } from "@/context";
import {
  ServerRail,
  ChannelPane,
  UserPanel,
  CreateServerModal,
  UserConntectedPanel,
} from "@/components";

export default function UnifiedSidebar() {
  const [createOpen, setCreateOpen] = useState(false);
  const { mobilePane, showContent } = useLayout();
  const { connection } = useVoice();
  const isVisible = mobilePane === "list";

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed left-0 top-0 z-40 flex h-full w-full md:max-w-200 flex-col md:hidden"
          >
            <div className="flex min-h-0 flex-1">
              <ServerRail onOpenCreate={() => setCreateOpen(true)} />
              <ChannelPane />
            </div>
            <UserPanel />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop: statische Sidebar (immer sichtbar) */}
      <aside className="hidden h-full w-80 shrink-0 flex-col md:flex relative">
        <div className="flex min-h-0 flex-1">
          <ServerRail onOpenCreate={() => setCreateOpen(true)} />
          <ChannelPane />
        </div>
        <div className="absolute flex flex-col bottom-0 w-full gap-px">
          {connection.status === "connected" && <UserConntectedPanel />}
          <UserPanel />
        </div>
      </aside>

      <CreateServerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
