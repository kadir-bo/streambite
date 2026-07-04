import Link from "next/link"
import { motion } from "motion/react"
import { fade } from "@/lib"

export default function Footer() {
  const linkClass = "hover:text-(--accent) transition-colors text-xs"

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...fade, delay: 0.3 }}
      className="border-t border-white/5 bg-[#09090b]"
    >
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-3 text-zinc-400">
          <span className="text-[#bec2ff] font-bold tracking-tight">
            Streambite
          </span>
          <span className="text-zinc-700">&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/ueber-uns" className={linkClass}>
            Über uns
          </Link>
          <Link href="/datenschutz" className={linkClass}>
            Datenschutz
          </Link>
          <Link href="/impressum" className={linkClass}>
            Impressum
          </Link>
        </div>
      </div>
    </motion.footer>
  )
}
