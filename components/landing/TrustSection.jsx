"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import {
  LockSimple,
  Waveform,
  Cloud,
  StackSimple,
} from "@phosphor-icons/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

const trustItems = [
  {
    icon: LockSimple,
    label: "End-to-End Encrypted",
    sub: "AES-256-GCM verschlüsselt",
  },
  {
    icon: Waveform,
    label: "Sub-ms Audio",
    sub: "Globale Edge-Latenz < 20ms",
  },
  {
    icon: Cloud,
    label: "Hostet in DE",
    sub: "ISO-zertifizierte Rechenzentren",
  },
  {
    icon: StackSimple,
    label: "Modernster Stack",
    sub: "LiveKit WebRTC + Next.js",
  },
]

function TrustItem({ item, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const Icon = item.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: motionTokens.distance.md }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: motionTokens.duration.normal, delay: index * 0.1, ease: motionTokens.easing.smooth }}
      whileHover={{ y: -2 }}
      className="group flex flex-col items-center gap-3"
    >
      <div className="size-12 rounded-2xl bg-gradient-to-br from-(--accent)/15 to-(--accent)/5 border border-(--accent)/10 flex items-center justify-center group-hover:border-(--accent)/25 group-hover:from-(--accent)/20 group-hover:to-(--accent)/10 transition-all duration-300">
        <Icon className="text-xl text-(--accent)" weight="duotone" />
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-zinc-100 tracking-tight text-balance">
          {item.label}
        </div>
        <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
          {item.sub}
        </div>
      </div>
    </motion.div>
  )
}

export default function TrustSection() {
  return (
    <section className="relative max-w-5xl mx-auto px-6 pb-24">
      {/* Subtiler Container mit Border */}
      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] py-10 px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 md:gap-8">
          {trustItems.map((item, i) => (
            <TrustItem key={item.label} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
