"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

export default function Impressum() {
  return (
    <div className="h-full overflow-y-auto bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Impressum</h1>
        <div className="text-zinc-400 text-sm space-y-2">
          <p>Streambite</p>
          <p>Angaben folgen in Kürze.</p>
          <p className="mt-6">Kontakt: Angaben folgen in Kürze.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
