"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

export default function UeberUns() {
  return (
    <div className="h-full overflow-y-auto bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Über Streambite</h1>
        <div className="prose prose-invert prose-zinc max-w-none">
          <p>Streambite ist eine moderne Kommunikationsplattform für Communities, Teams und Freundesgruppen.</p>
          <p>Wir bieten Text-Chat, Sprachkanäle, Bildschirmübertragung und mehr – alles DSGVO-konform und in Deutschland gehostet.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
