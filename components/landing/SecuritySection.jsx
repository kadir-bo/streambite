"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import {
  ShieldCheck,
  LockSimple,
  EyeSlash,
  FileText,
} from "@phosphor-icons/react"
import { motionTokens } from "@/lib/motion-tokens"

const securityItems = [
  {
    icon: ShieldCheck,
    title: "DSGVO Konform",
    desc: "Gehostet in Deutschland. Deine Daten verlassen die EU nicht und unterliegen deutschem Recht.",
  },
  {
    icon: LockSimple,
    title: "TLS Verschlüsselung",
    desc: "Sämtliche Kommunikation ist TLS-verschlüsselt und sicher vor dem Zugriff durch Dritte.",
  },
  {
    icon: EyeSlash,
    title: "Kein Tracking",
    desc: "Wir verkaufen keine Daten. Dein Profil gehört dir. Wir nutzen keine Werbe-Tracker.",
  },
  {
    icon: FileText,
    title: "Volle Transparenz",
    desc: "Klare Datenschutzrichtlinien ohne kleingedruckte Fallstricke. Open-Source Komponenten.",
  },
]

function SecurityCard({ item, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const Icon = item.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: motionTokens.distance.lg }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: motionTokens.duration.normal, delay: index * 0.1, ease: motionTokens.easing.smooth }}
      className="group flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-(--accent)/20 hover:bg-white/[0.04] transition-all duration-300"
    >
      <div className="size-10 rounded-xl bg-(--accent)/10 flex items-center justify-center shrink-0 group-hover:bg-(--accent)/20 transition-colors">
        <Icon className="text-lg text-(--accent)" weight="duotone" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
      </div>
    </motion.div>
  )
}

export default function SecuritySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <section
      ref={ref}
      className="border-t border-white/[0.06] py-24 md:py-32 bg-[#1c1b1d]/20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: motionTokens.distance.md }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
            className="inline-flex items-center gap-1.5 rounded-full border border-(--accent)/20 bg-(--accent)/5 px-3 py-1 text-xs font-medium text-(--accent) mb-6"
          >
            <span className="size-1.5 rounded-full bg-(--accent) animate-pulse" />
            Sicherheit & Datenschutz
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: motionTokens.distance.md }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: motionTokens.duration.slow, delay: 0.05, ease: motionTokens.easing.smooth }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white"
          >
            Sicherheit & Datenschutz<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-(--accent) to-indigo-400">
              an erster Stelle
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: motionTokens.distance.md }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: motionTokens.duration.slow, delay: 0.1, ease: motionTokens.easing.smooth }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Wir glauben, dass deine privaten Gespräche auch privat bleiben sollten.
            Streambite ist von Grund auf so konzipiert, dass deine Daten geschützt
            sind und wir die strengsten europäischen Standards erfüllen.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {securityItems.map((item, i) => (
            <SecurityCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
