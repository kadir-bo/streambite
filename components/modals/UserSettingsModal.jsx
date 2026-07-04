"use client";

import { useState } from "react";
import { User, Microphone, CaretLeft } from "@phosphor-icons/react";
import { Modal, Select, ProfileSettings, VoiceVideoSettings, IconBtn } from "@/components";

const TABS = [
  { id: "profile", label: "Mein Profil", icon: User },
  { id: "voice", label: "Sprache & Video", icon: Microphone },
];

export default function UserSettingsModal({ open, onClose }) {
  const [tab, setTab] = useState("profile");

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth={840}
      bodyClassName=""
      mobileFullScreen
    >
      <div className="flex h-full flex-col sm:h-150 sm:flex-row">
        {/* Tab-Leiste: Desktop links */}
        <div className="hidden sm:flex shrink-0 flex-col gap-0.5 border-r border-white/5 w-52 p-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-[8px] border-none bg-transparent px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-100 ${
                  active
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-400 hover:bg-white/5"
                }`}
              >
                <Icon className="text-lg" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab-Dropdown Mobile */}
        <div className="sm:hidden flex items-center gap-3 border-b border-white/5 px-2 py-2">
          <IconBtn icon={CaretLeft} onClick={onClose} title="Zurück" size="xl" mobileOnly className="bg-zinc-800!" />
          <div className="flex-1">
            <Select
              value={tab}
              onChange={(e) => setTab(e.target.value)}
            >
              {TABS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-4 py-5 sm:p-6">

          {tab === "profile" && <ProfileSettings open={open} />}
          {tab === "voice" && <VoiceVideoSettings />}
        </div>
      </div>
    </Modal>
  );
}
