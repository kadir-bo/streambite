"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import {
  ChatText,
  Microphone,
  Desktop,
  ShieldCheck,
  Database,
  DeviceMobile,
} from "@phosphor-icons/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

const features = [
  {
    icon: ChatText,
    label: "Dynamischer Text-Chat",
    desc: "Echtzeit-Nachrichten mit voller Markdown-Unterstützung und Code-Highlighting. Nutze Datei-Uploads per Drag-and-Drop, Emoji-Reaktionen und strukturierte Reply-Threads für maximale Übersichtlichkeit in großen Gruppen.",
  },
  {
    icon: Microphone,
    label: "Kristallklare Voice-Channels",
    desc: "Erlebe Audio in Studioqualität dank LiveKit-WebRTC-Integration. Inklusive intelligenter Rauschunterdrückung, Echo-Kompensation und globalem Edge-Netzwerk für minimale Latenzen unter 20ms.",
  },
  {
    icon: Desktop,
    label: "Ultra-HD Screen-Sharing",
    desc: "Teile deinen Bildschirm in gestochen scharfem 1080p bei flüssigen 60fps. Unsere optimierte Pipeline ermöglicht latenzfreies Streaming direkt im Browser – ohne zusätzliche Software-Installation.",
  },
  {
    icon: ShieldCheck,
    label: "Erweiterte Moderation",
    desc: "Präzision für Administratoren. Automatisierte Spam-Filter, detaillierte Audit-Logs und ein granulares Berechtigungssystem ermöglichen die sichere Skalierung deiner Community auf Tausende von Mitgliedern.",
  },
  {
    icon: Database,
    label: "DSGVO-konforme Server",
    desc: "Deine Daten sind sicher. Wir betreiben unsere Infrastruktur ausschließlich auf zertifizierten Servern in Deutschland. Keine Datenweitergabe an Drittstaaten, volle Kontrolle über deine Privatsphäre.",
  },
  {
    icon: DeviceMobile,
    label: "PWA & Mobil-Optimiert",
    desc: "Genieße das volle Streambite-Erlebnis plattformübergreifend. Unsere Progressive Web App Architektur garantiert schnelle Ladezeiten und eine native Haptik auf iOS, Android und Desktop-Geräten.",
  },
]

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: motionTokens.distance.lg }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: motionTokens.duration.normal, delay: index * 0.08, ease: motionTokens.easing.smooth }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 hover:border-(--accent)/30 hover:bg-white/[0.06] transition-all duration-300"
    >
      <motion.div
        whileHover={{ scale: motionTokens.scale.pop }}
        transition={springs.snappy}
        className="size-11 rounded-xl bg-(--accent)/10 flex items-center justify-center mb-4 group-hover:bg-(--accent)/20 transition-colors"
      >
        <Icon className="text-lg text-(--accent)" weight="duotone" />
      </motion.div>
      <h3 className="text-lg font-semibold mb-2 text-white">{feature.label}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
    </motion.div>
  )
}

export default function DetailedFeatures() {
  return (
    <section className="bg-[#0e0e10] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Alles, was deine Community braucht
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Von Text über Sprache bis Bildschirm – Streambite vereint alle
            Kommunikationsformen in einer Plattform mit Fokus auf technischer Exzellenz.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.label} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
