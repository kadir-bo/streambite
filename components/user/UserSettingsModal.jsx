"use client";

import { useState } from "react";
import { User, Microphone, SignOut, X } from "@phosphor-icons/react";
import { logoutUser } from "@/lib";
import Modal from "@/components/ui/Modal";
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
      <div className="flex h-full flex-col sm:h-[600px] sm:flex-row">
        <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-(--border-subtle) bg-(--surface-deep) p-2 sm:w-52 sm:flex-col sm:items-stretch sm:overflow-visible sm:border-b-0 sm:border-r sm:p-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-(--radius-base) border-none bg-transparent px-3 py-2 text-left text-sm font-medium cursor-pointer transition-colors duration-100 ${
                  active
                    ? "bg-(--state-active) text-(--text-primary)"
                    : "text-(--text-secondary) hover:bg-(--state-hover)"
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}

          <div className="flex-1" />

          <button
            onClick={() => logoutUser()}
            className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-(--radius-base) border-none bg-transparent px-3 py-2 text-left text-sm font-medium text-(--danger) cursor-pointer hover:bg-(--danger-subtle)"
          >
            <SignOut size={16} />
            Abmelden
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-(--radius-base) border-none bg-transparent text-(--text-muted) cursor-pointer hover:bg-(--state-hover) hover:text-(--text-secondary)"
          >
            <X size={16} />
          </button>

          {tab === "profile" && <ProfileSettings open={open} />}
          {tab === "voice" && <VoiceVideoSettings />}
        </div>
      </div>
    </Modal>
  );
}
