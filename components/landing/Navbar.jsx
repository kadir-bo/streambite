"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Button } from "@/components"
import { cn } from "@/lib"
import { fade } from "@/lib"

export default function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={fade}
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-lg border-b border-white/5"
          : "bg-transparent",
        "[transition:background_0.3s_cubic-bezier(0.16,1,0.3,1),border-color_0.3s_cubic-bezier(0.16,1,0.3,1)]",
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight cursor-pointer select-none text-[#bec2ff] hover:opacity-80 transition-opacity"
        >
          Streambite
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
            Anmelden
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push("/register")}>
            Loslegen
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}
