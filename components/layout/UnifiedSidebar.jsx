"use client";
import { useState } from "react";
import { useLayout } from "@/context";
import ServerRail from "@/components/layout/ServerRail";
import ChannelPane from "@/components/layout/ChannelPane";
import UserPanel from "@/components/layout/UserPanel";
import CreateServerModal from "@/components/server/CreateServerModal";

export default function UnifiedSidebar() {
  const [createOpen, setCreateOpen] = useState(false);
  const { mobilePane } = useLayout();

  return (
    <>
      <aside
        className={`h-full w-full shrink-0 flex-col md:flex md:w-80 ${
          mobilePane === "list" ? "flex" : "hidden"
        }`}
      >
        <div className="flex min-h-0 flex-1">
          <ServerRail onOpenCreate={() => setCreateOpen(true)} />
          <ChannelPane />
        </div>
        <UserPanel />
      </aside>
      <CreateServerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
