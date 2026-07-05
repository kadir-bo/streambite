import Link from "next/link"
import { Logo } from "@/components"

export default function Footer() {
  const linkClass = "hover:text-(--accent) transition-colors text-xs"

  return (
    <footer className="border-t border-white/5 bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-3 text-zinc-400">
          <Logo className="text-zinc-400" />
        </div>
        <div className="flex items-center gap-6">
          <Link href="/datenschutz" className={linkClass}>
            Datenschutz
          </Link>
          <Link href="/impressum" className={linkClass}>
            Impressum
          </Link>
        </div>
      </div>
    </footer>
  )
}
