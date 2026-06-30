"use client";

import { useState } from "react";
import { User, Microphone, CaretLeft } from "@phosphor-icons/react";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import ProfileSettings from "@/components/user/ProfileSettings";
import VoiceVideoSettings from "@/components/user/VoiceVideoSettings";

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
        <div className="hidden sm:flex shrink-0 flex-col gap-0.5 border-r border-(--border-subtle) w-52 p-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-(--radius-base) border-none bg-transparent px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-100 ${
                  active
                    ? "bg-(--state-active) text-(--text-primary)"
                    : "text-(--text-secondary) hover:bg-(--state-hover)"
                }`}
              >
                <Icon className="text-lg" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab-Dropdown Mobile */}
        <div className="sm:hidden flex items-center gap-3 border-b border-(--border-subtle) px-2 py-2">
          <button
            onClick={onClose}
            className="flex size-8 max-sm:size-10 shrink-0 items-center justify-center rounded-(--radius-base) border-none bg-transparent text-(--text-muted) cursor-pointer hover:bg-(--state-hover) hover:text-(--text-secondary)"
          >
            <CaretLeft className="text-xl" />
          </button>
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
