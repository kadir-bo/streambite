"use client"

import Navbar from "@/components/landing/Navbar"
import Footer from "@/components/landing/Footer"

export default function Datenschutz() {
  return (
    <div className="h-full overflow-y-auto bg-zinc-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Datenschutzerklärung</h1>
        <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 text-sm space-y-4">
          <p>Wir nehmen den Schutz deiner persönlichen Daten sehr ernst und halten uns an die Regeln der DSGVO.</p>
          <h2 className="text-zinc-200 text-lg font-semibold mt-8">1. Verantwortliche Stelle</h2>
          <p>Streambite – Angaben folgen in Kürze.</p>
          <h2 className="text-zinc-200 text-lg font-semibold mt-8">2. Erhobene Daten</h2>
          <p>Wir speichern nur die für den Betrieb notwendigen Daten: E-Mail-Adresse, Anzeigename, Benutzername sowie Nachrichteninhalte in verschlüsselter Form.</p>
          <h2 className="text-zinc-200 text-lg font-semibold mt-8">3. Hosting</h2>
          <p>Alle Daten werden auf Servern in Deutschland betrieben.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
