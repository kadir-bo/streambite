"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "motion/react";
import { User, Microphone, Shield, Lock } from "@phosphor-icons/react";
import {
  Modal,
  ProfileSettings,
  VoiceVideoSettings,
} from "@/components";
import { useMediaQuery, useTabDragScroll } from "@/hooks";
import { twMerge } from "tailwind-merge";

const TABS = [
  { id: "profile", label: "Account", icon: User },
  { id: "voice", label: "Sprach Chat", icon: Microphone },
  { id: "privacy", label: "Datenschutz", icon: Shield },
  { id: "security", label: "Sicherheit", icon: Lock },
];

export default function UserSettingsModal({ open, onClose }) {
  const [tab, setTab] = useState("profile");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { x, contentRef, maskRef, dragCons } = useTabDragScroll(open);

  /* Programmgesteuerter Sprung zum aktiven Tab */
  useEffect(() => {
    if (!contentRef.current || !maskRef.current) return;
    const btn = contentRef.current.querySelector("[data-active-tab=true]");
    if (btn) {
      const cw = maskRef.current.offsetWidth;
      const offset = btn.offsetLeft;
      const bw = btn.offsetWidth;
      const target = Math.max(dragCons.left, Math.min(dragCons.right, -(offset - cw / 2 + bw / 2)));

      const controls = animate(x, target, {
        type: "spring",
        stiffness: 350,
        damping: 20,
      });
      return () => controls.stop();
    }
  }, [tab, dragCons, x, contentRef, maskRef]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth={840}
      mobileFullScreen
      bodyClassName="p-3 md:p-5"
    >
      <div className="flex h-full flex-col md:flex-row md:h-160 md:overflow-y-scroll">
        {/* Tab Navigation — mobile drag, desktop column */}
        <div
          ref={maskRef}
          className="relative overflow-hidden md:overflow-visible md:flex-col border-b md:border-none border-white/5 px-4 md:pt-4 md:px-0"
        >
          <motion.div
            ref={contentRef}
            drag={isMobile ? "x" : false}
            style={{ x }}
            dragConstraints={dragCons}
            dragElastic={0.2}
            className="flex items-center gap-1 md:flex-col md:min-w-max"
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  data-active-tab={active ? "true" : "false"}
                  onClick={() => setTab(t.id)}
                  className={twMerge(
                    "relative whitespace-nowrap border-none bg-transparent px-4 py-3 text-base font-medium cursor-pointer transition-colors duration-150 md:w-full md:text-left md:rounded-md",
                    active ? "md:bg-surface-border" : "md:hover:bg-white/5",
                  )}
                >
                  {t.label}
                  {active && (
                    <motion.div
                      layoutId="mobile-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full md:hidden"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto py-6 sm:px-8 pb-20 md:pb-0">
          {tab === "profile" && <ProfileSettings key={String(open)} open={open} />}
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
