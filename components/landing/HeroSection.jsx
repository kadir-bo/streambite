"use client"

import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Button } from "@/components"
import { springs } from "@/lib/motion-tokens"

export default function HeroSection() {
  const router = useRouter()

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Hintergrund-Effekte */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] bg-(--accent) opacity-[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 size-[500px] bg-(--accent) opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/6 size-[300px] bg-(--accent) opacity-[0.02] rounded-full blur-3xl" />

        {/* Subtiles Grid-Pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge – kleine Animation, sofort sichtbar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5 rounded-full border border-(--accent)/20 bg-(--accent)/5 px-4 py-1.5 text-xs font-medium text-(--accent) mb-8"
        >
          <span className="size-1.5 rounded-full bg-(--accent) animate-pulse" />
          Echtzeit-Kommunikation &bull; Open Beta
        </motion.div>

        {/* Heading – kein Entrance-Anim, sofort da */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Deine Community.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-(--accent) to-indigo-400">
            Dein Chat. Deine Stimme.
          </span>
        </h1>

        {/* Subtext – kein Entrance-Anim */}
        <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Streambite verbindet Echtzeit-Chat, Sprachkanäle und Screen-Sharing in einem
          modernen Interface – entwickelt für echte Gespräche und private Communities.
        </p>

        {/* CTA – kein Entrance-Anim, nur Tap/Hover */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            className="text-base gap-2 px-8 shadow-lg shadow-(--accent)/20"
            style={{ background: "var(--accent)", color: "#fff" }}
            onClick={() => router.push("/register")}
          >
            Starte deine Community
          </Button>
          <motion.button
            onClick={scrollToFeatures}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            className="text-zinc-400 hover:text-white transition-colors px-6 py-3 text-base font-medium"
          >
            Funktionen entdecken &darr;
          </motion.button>
        </div>
      </div>
    </section>
  )
}
