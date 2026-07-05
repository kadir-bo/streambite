"use client"

import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Sparkle, ArrowRight } from "@phosphor-icons/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

export default function CTASection() {
  const router = useRouter()

  return (
    <section className="relative py-28 md:py-36 overflow-hidden">
      {/* Tiefe Hintergrund-Atmosphäre */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 size-[700px] bg-(--accent) opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 size-[500px] bg-indigo-500 opacity-[0.02] rounded-full blur-3xl" />
      </div>

      {/* Subtiler oberer Trenner */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: motionTokens.distance.lg }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
          className="mx-auto max-w-2xl text-center"
        >
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-(--accent)/20 bg-(--accent)/5 px-4 py-1.5 text-xs font-medium text-(--accent) mb-6">
            <Sparkle className="text-xs" weight="fill" />
            Bereit loszulegen?
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white leading-[1.1]">
            Worauf wartest du?
          </h2>

          <p className="text-lg text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
            Tritt deiner ersten Community bei oder erstelle deinen eigenen Server –
            <span className="text-zinc-300"> kostenlos, ohne Verpflichtung.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary CTA – mit mehr Präsenz */}
            <button
              onClick={() => router.push("/register")}
              className="group relative inline-flex items-center gap-2.5 rounded-xl bg-(--accent) px-8 py-4 text-white text-base font-semibold leading-none shadow-lg shadow-(--accent)/25 hover:shadow-xl hover:shadow-(--accent)/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Sparkle className="size-5 group-hover:rotate-12 transition-transform duration-300" weight="fill" />
              <span>Kostenlos registrieren</span>
            </button>

            {/* Secondary – subtiler, als Button mit Stil */}
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-6 py-4 text-sm text-zinc-400 font-medium hover:text-white hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-200 group"
            >
              Bereits Mitglied?
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Trust-Signal */}
          <p className="text-xs text-zinc-600 mt-8">
            Keine Kreditkarte erforderlich &bull; In 30 Sekunden starten
          </p>
        </motion.div>
      </div>
    </section>
  )
}
