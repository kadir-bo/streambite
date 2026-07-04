"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import {
  UserPlus,
  Compass,
  LinkSimple,
  ChatCircleDots,
} from "@phosphor-icons/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Konto erstellen",
    desc: "Registriere dich mit deiner E-Mail in unter 30 Sekunden. Kein Bestätigungs-Marathon.",
  },
  {
    icon: Compass,
    number: "2",
    title: "Space gestalten",
    desc: "Erstelle deinen Server und richte Text- sowie Voice-Channels nach deinen Bedürfnissen ein.",
  },
  {
    icon: LinkSimple,
    number: "3",
    title: "Leute einladen",
    desc: "Verschicke Einladungs-Links an deine Freunde oder dein Team. Ein Klick zum Beitreten.",
  },
  {
    icon: ChatCircleDots,
    number: "4",
    title: "Austauschen",
    desc: "Starte den Austausch – egal ob Text, Voice oder hochauflösendes Screen-Sharing.",
  },
]

function StepCard({ step, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const Icon = step.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: motionTokens.distance.lg }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: motionTokens.duration.slow, delay: index * 0.12, ease: motionTokens.easing.smooth }}
      className="relative flex flex-col items-center text-center group"
    >
      {/* Icon + Number Circle */}
      <div className="relative mb-5">
        <motion.div
          whileHover={{ scale: motionTokens.scale.pop }}
          transition={springs.bouncy}
          className="size-16 rounded-2xl bg-gradient-to-br from-(--accent)/20 to-(--accent)/5 border border-(--accent)/20 flex items-center justify-center group-hover:border-(--accent)/40 group-hover:from-(--accent)/30 group-hover:to-(--accent)/10 transition-all duration-300"
        >
          <Icon className="text-2xl text-(--accent)" weight="duotone" />
        </motion.div>
        {/* Number Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ ...springs.bouncy, delay: index * 0.12 + 0.3 }}
          className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-(--accent) text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-(--accent)/30"
        >
          {step.number}
        </motion.div>
      </div>

      {/* Verbindungslinie zwischen den Steps */}
      {index < steps.length - 1 && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px">
          <div className="w-full h-full bg-gradient-to-r from-(--accent)/30 to-transparent" />
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-[18rem] mx-auto">
        {step.desc}
      </p>
    </motion.div>
  )
}

export default function HowItWorks() {
  return (
    <section className="relative bg-[#09090b] py-24 md:py-32 overflow-hidden">
      {/* Subtler top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 size-[500px] bg-(--accent) opacity-[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-white text-balance">
            So funktioniert&apos;s
          </h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto text-balance">
            In vier einfachen Schritten zu deiner eigenen Community.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-10 md:gap-6">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
