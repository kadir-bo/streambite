"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Modal, TabBtn, CreateTab, JoinTab } from "@/components";

export default function CreateServerModal({ open, onClose }) {
  const router = useRouter();
  const [tab, setTab] = useState("create");

  function handleSuccess(serverId, channelId) {
    onClose();
    if (channelId) {
      router.push(`/servers/${serverId}/${channelId}`);
    } else {
      router.push(`/servers/${serverId}`);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tab === "create" ? "Server erstellen" : "Server beitreten"}
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-surface-card rounded-lg">
        <TabBtn
          label="Erstellen"
          active={tab === "create"}
          onClick={() => setTab("create")}
        />
        <TabBtn
          label="Beitreten"
          active={tab === "join"}
          onClick={() => setTab("join")}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === "create" ? -8 : 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {tab === "create" ? (
            <CreateTab onSuccess={handleSuccess} />
          ) : (
            <JoinTab onSuccess={handleSuccess} />
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}
