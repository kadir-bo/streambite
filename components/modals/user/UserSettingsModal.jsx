"use client";

import { useState } from "react";
import { User, Microphone, Shield, Lock, Trash } from "@phosphor-icons/react";
import {
  Modal,
  Select,
  ProfileSettings,
  VoiceVideoSettings,
} from "@/components";
import { twMerge } from "tailwind-merge";

const TABS = [
  { id: "profile", label: "Account", icon: User },
  { id: "voice", label: "Sprach Chat", icon: Microphone },
  { id: "privacy", label: "Datenschutz", icon: Shield },
  { id: "security", label: "Sicherheit", icon: Lock },
];

export default function UserSettingsModal({ open, onClose }) {
  const [tab, setTab] = useState("profile");

  return (
    <Modal open={open} onClose={onClose} maxWidth={840} mobileFullScreen>
      <div className="flex h-full flex-col md:flex-row md:h-160 md:overflow-y-scroll">
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-2 md:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-600" />
        </div>

        {/* Tab Navigation — horizontal scroll on mobile */}
        <div className="flex items-center gap-1 border-b md:border-none border-white/5 px-4 overflow-x-auto scrollbar-none md:flex-col md:pt-4 md:min-w-max md:px-0">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={twMerge(
                  "relative whitespace-nowrap border-none bg-transparent px-4 py-3 text-base font-medium cursor-pointer transition-colors duration-150 md:w-full md:text-left md:rounded-md",
                  active ? "md:bg-surface-border" : "md:hover:bg-white/5",
                )}
              >
                {t.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full md:hidden" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {tab === "profile" && <ProfileSettings open={open} />}
          {tab === "voice" && <VoiceVideoSettings />}
          {tab === "privacy" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Shield size={48} className="text-zinc-600 mb-4" />
              <p className="text-lg font-semibold text-zinc-400">Datenschutz</p>
              <p className="text-sm text-zinc-500 mt-1">
                Einstellungen folgen bald
              </p>
            </div>
          )}
          {tab === "security" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Lock size={48} className="text-zinc-600 mb-4" />
              <p className="text-lg font-semibold text-zinc-400">Sicherheit</p>
              <p className="text-sm text-zinc-500 mt-1">
                Einstellungen folgen bald
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
