"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import {
  Lightning,
  LockKey,
} from "@phosphor-icons/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

const highlights = [
  {
    icon: Lightning,
    title: "Sub-Millisekunden-Latenz",
    desc: "Unser globales SFU-Netzwerk leitet Pakete intelligent weiter, um den schnellsten Pfad zwischen den Teilnehmern zu wählen.",
  },
  {
    icon: LockKey,
    title: "End-to-End Verschlüsselung",
    desc: "Jeder Stream und jede Nachricht wird mit AES-256 verschlüsselt. Nur die Teilnehmer des Kanals können den Inhalt entschlüsseln.",
  },
]

const codeLines = [
  { text: "const", hl: "keyword" },
  { text: " connection = new StreambiteEngine({", hl: "plain" },
  { text: "  audio:", hl: "prop" },
  { text: " { codec: \"opus\", stereo: true }", hl: "string" },
  { text: ",", hl: "plain" },
  { text: "  video:", hl: "prop" },
  { text: " { res: \"1080p\", fps: 60 }", hl: "string" },
  { text: ",", hl: "plain" },
  { text: "  encryption:", hl: "prop" },
  { text: " 'AES-256-GCM'", hl: "string" },
  { text: ",", hl: "plain" },
  { text: "  region:", hl: "prop" },
  { text: " 'eu-central-1'", hl: "string" },
  { text: "});", hl: "plain" },
  { text: "// Initiating ultra-low latency handshake...", hl: "comment" },
  { text: "await connection.join(serverID);", hl: "plain" },
]

function HighlightCard({ item, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const Icon = item.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: motionTokens.distance.md }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: motionTokens.duration.normal, delay: index * 0.15, ease: motionTokens.easing.smooth }}
      className="flex gap-4"
    >
      <div className="size-10 rounded-xl bg-(--accent)/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="text-lg text-(--accent)" weight="duotone" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
      </div>
    </motion.div>
  )
}

export default function TechnicalDeepDive() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section ref={ref} className="bg-[#09090b] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Left: Text */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: motionTokens.distance.md }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
              className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white"
            >
              Entwickelt für Performance
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: motionTokens.distance.md }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: motionTokens.duration.slow, delay: 0.1, ease: motionTokens.easing.smooth }}
              className="text-zinc-400 text-lg leading-relaxed mb-10"
            >
              Streambite basiert auf einer state-of-the-art WebRTC-Infrastruktur.
              Während andere Lösungen auf veraltete Protokolle setzen, nutzen wir
              LiveKit für verlustfreie Kommunikation bei geringster CPU-Last.
            </motion.p>

            <div className="space-y-6">
              {highlights.map((item, i) => (
                <HighlightCard key={item.title} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Right: Code Block */}
          <motion.div
            initial={{ opacity: 0, x: motionTokens.distance.md }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: motionTokens.duration.slow, delay: 0.2, ease: motionTokens.easing.smooth }}
            className="rounded-2xl border border-white/[0.06] bg-zinc-900/50 overflow-hidden"
          >
            {/* Code header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-500/60" />
                <div className="size-2.5 rounded-full bg-yellow-500/60" />
                <div className="size-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[11px] text-zinc-600 font-mono ml-2">
                streambite-core.ts
              </span>
            </div>

            {/* Code content */}
            <div className="p-5 font-mono text-sm leading-relaxed">
              {codeLines.map((line, i) => (
                <div key={i} className="whitespace-pre">
                  <span className="text-zinc-600 select-none w-6 inline-block text-right mr-4">
                    {i + 1}
                  </span>
                  <span
                    className={
                      line.hl === "keyword"
                        ? "text-purple-400"
                        : line.hl === "prop"
                          ? "text-blue-400"
                          : line.hl === "string"
                            ? "text-emerald-400"
                            : line.hl === "comment"
                              ? "text-zinc-600 italic"
                              : "text-zinc-300"
                    }
                  >
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
