"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { LockSimple, Lightning } from "@phosphor-icons/react";
import { motionTokens } from "@/lib/motion-tokens";

const benefits = [
  {
    icon: LockSimple,
    title: "End-to-End Encrypted",
    description: "AES-256-GCM verschlüsselt",
  },
  {
    icon: Lightning,
    title: "Sub-ms Audio",
    description: "Globale Edge-Latenz unter 20ms",
  },
];

export default function TechnicalDeepDive() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#09090b] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-stretch">
          {/* Linke Seite: Text + Benefits */}
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{
                duration: motionTokens.duration.normal,
                ease: motionTokens.easing.glide,
              }}
              className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white"
            >
              Entwickelt für Performance
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{
                duration: motionTokens.duration.normal,
                delay: 0.08,
                ease: motionTokens.easing.glide,
              }}
              className="text-zinc-400 text-lg leading-relaxed mb-8"
            >
              Echtzeit-Kommunikation auf Basis von LiveKit WebRTC – für
              verlustfreie Audio- und Videoübertragung bei minimaler Latenz.
            </motion.p>

            {/* 2 kleine Benefit-Cards – stacked auf Mobile, nebeneinander ab sm */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
              {benefits.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{
                      duration: motionTokens.duration.normal,
                      delay: 0.12 + i * 0.08,
                      ease: motionTokens.easing.glide,
                    }}
                    className="flex flex-col items-center text-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-3 sm:flex-row sm:text-left sm:items-center"
                  >
                    <div className="size-9 rounded-lg bg-(--accent)/10 flex items-center justify-center shrink-0">
                      <Icon
                        className="text-lg text-(--accent)"
                        weight="duotone"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">
                        {item.title}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Rechte Seite: Video */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{
              duration: motionTokens.duration.normal,
              delay: 0.2,
              ease: motionTokens.easing.glide,
            }}
            className="relative h-full rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-zinc-900 to-zinc-950 group min-h-[200px]"
          >
            {/* Video-Element – sobald eine Datei unter public/video/demo.mp4 liegt, wird sie automatisch abgespielt */}
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src="/video/demo.mp4"
              muted
              loop
              playsInline
              poster="/video/poster.jpg"
              onError={(e) => {
                // Fallback: versteckt das Video-Element bei fehlender Datei
                e.target.style.display = "none";
              }}
            />

            {/* Fallback-Placeholder solange kein Video vorhanden */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <div className="size-16 rounded-full bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-7 text-zinc-400 ml-0.5"
                >
                  <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36A1 1 0 0 0 8 5.14Z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-zinc-600">
                Demo ansehen
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
