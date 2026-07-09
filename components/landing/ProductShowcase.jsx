"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { twMerge } from "tailwind-merge";
import { motionTokens } from "@/lib";

const channels = ["Willkommen", "Ankündigungen", "Chat", "Voice", "Stream"];

const channelData = {
  Willkommen: {
    icon: "#",
    messages: [
      {
        name: "Lena",
        msg: "Herzlich willkommen auf dem Server! 🎉",
        color: "text-(--accent)",
      },
      {
        name: "ServerBot",
        msg: "Schau dir die Regeln in #Ankündigungen an.",
        color: "text-emerald-400",
      },
      {
        name: "Marcel",
        msg: "Endlich ist der Server online!",
        color: "text-amber-400",
      },
    ],
  },
  Ankündigungen: {
    icon: "📢",
    messages: [
      {
        name: "Admin",
        msg: "Server-Update 2.0 ist live! 🚀",
        color: "text-red-400",
      },
      {
        name: "Admin",
        msg: "Neue Voice-Channels mit besserer Audio-Qualität.",
        color: "text-red-400",
      },
      {
        name: "Admin",
        msg: "Wartung these week – kurze Downtime geplant.",
        color: "text-red-400",
      },
    ],
  },
  Chat: {
    icon: "#",
    messages: [
      {
        name: "Lena",
        msg: "Hat jemand den Server-Link?",
        color: "text-(--accent)",
      },
      {
        name: "Tobias",
        msg: "Ja, schick ich dir per DM!",
        color: "text-emerald-400",
      },
      { name: "Marcel", msg: "Wann geht's los? 🎮", color: "text-amber-400" },
    ],
  },
  Voice: {
    icon: "🔊",
    messages: [
      {
        name: "Tobias",
        msg: "Bin im Voice-Channel, wer kommt?",
        color: "text-emerald-400",
      },
      {
        name: "Lena",
        msg: "Bin gleich da, hol nur Kopfhörer!",
        color: "text-(--accent)",
      },
      {
        name: "Marcel",
        msg: "Audio klingt super heute!",
        color: "text-amber-400",
      },
    ],
  },
  Stream: {
    icon: "🖥️",
    messages: [
      {
        name: "Marcel",
        msg: "Starte gleich den Stream – Code-Review auf dem Plan! 🔴",
        color: "text-amber-400",
      },
      { name: "Lena", msg: "Cool, schau zu!", color: "text-(--accent)" },
      {
        name: "Tobias",
        msg: "1080p/60fps Screen-Share läuft perfekt!",
        color: "text-emerald-400",
      },
    ],
  },
};

export default function ProductShowcase() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [activeChannel, setActiveChannel] = useState("Chat");

  const current = channelData[activeChannel];

  return (
    <section ref={sectionRef} className="max-w-6xl mx-auto px-6 pb-24 md:pb-32">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Chat. Voice. Streaming.
        </h2>
        <p className="text-zinc-400 text-lg max-w-lg mx-auto">
          Wechsle zwischen den Channels und erlebe, wie sich Streambite anfühlt.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{
          duration: motionTokens.duration.normal,
          ease: motionTokens.easing.glide,
        }}
        className="relative mx-auto max-w-5xl"
      >
        {/* Browser-Fenster Mockup */}
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
          {/* Fenster-Titlebar */}
          <div className="bg-surface-card px-4 py-3 flex items-center gap-2 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-red-500/80" />
              <div className="size-2.5 rounded-full bg-yellow-500/80" />
              <div className="size-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs text-zinc-500 font-medium">
                Streambite — {activeChannel}
              </span>
            </div>
          </div>

          {/* App-Inhalt – Sidebar + Chat */}
          <div className="flex h-105 md:h-130 bg-zinc-950">
            {/* Server-Rail */}
            <div className="w-16 md:w-18 bg-zinc-950 flex flex-col items-center gap-2 py-3 border-r border-white/5">
              <div className="size-10 rounded-2xl bg-(--accent) flex items-center justify-center text-white text-sm font-bold">
                S
              </div>
              <div className="w-8 h-px bg-surface-card" />
              <div className="size-10 rounded-2xl bg-surface-card/60 border border-white/5" />
              <div className="size-10 rounded-2xl bg-surface-card/60 border border-white/5" />
              <div className="size-10 rounded-2xl bg-surface-card/60 border border-white/5" />
            </div>

            {/* Channel-Seitenleiste – klickbar */}
            <div className="w-48 md:w-56 bg-[#0a0a0c] border-r border-white/5 p-3 hidden sm:block">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-2">
                Allgemein
              </div>
              <div className="space-y-0.5">
                {channels.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setActiveChannel(ch)}
                    className={twMerge(
                      "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-left transition-all duration-150",
                      ch === activeChannel
                        ? "bg-(--accent)/10 text-(--accent) font-medium"
                        : "text-zinc-400 hover:bg-surface-card/40",
                    )}
                  >
                    <span className="text-zinc-600 shrink-0">
                      {channelData[ch].icon}
                    </span>
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat-Hauptbereich */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat-Header */}
              <div className="h-12 border-b border-white/5 flex items-center px-4 shrink-0">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <span className="text-zinc-500">{current.icon}</span>{" "}
                  {activeChannel}
                </span>
              </div>

              {/* Messages – animiert bei Channel-Wechsel */}
              <div
                key={activeChannel}
                className="flex-1 p-4 space-y-4 overflow-hidden"
              >
                {current.messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.3,
                      ease: motionTokens.easing.glide,
                    }}
                    className="flex gap-3"
                  >
                    <div className="size-8 rounded-full bg-surface-card shrink-0 flex items-center justify-center text-xs font-medium text-zinc-400">
                      {m.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={twMerge("text-sm font-semibold", m.color)}
                        >
                          {m.name}
                        </span>
                        <span className="text-2xs text-zinc-600">heute</span>
                      </div>
                      <p className="text-sm text-zinc-300 mt-0.5 wrap-break-word">
                        {m.msg}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input-Bereich */}
              <div className="px-4 pb-4 shrink-0">
                <div className="rounded-lg bg-surface-card border border-white/5 px-4 py-2.5 text-sm text-zinc-500">
                  Nachricht an #{activeChannel} …
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating-Badge – dezenter Label-Stil, kein Button-Look */}
        <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 rounded-full border border-white/[0.08] bg-surface-card/80 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-zinc-300 shadow-xl shadow-black/30">
          <span className="inline-block size-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle" />
          Echtzeit • überall
        </div>
      </motion.div>
    </section>
  );
}
