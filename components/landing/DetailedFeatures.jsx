"use client"

import {
  ChatText,
  Microphone,
  Desktop,
  ShieldCheck,
  Database,
  DeviceMobile,
} from "@phosphor-icons/react"
import { Card } from "@/components"

const features = [
  { icon: ChatText, title: "Dynamischer Text-Chat", description: "Echtzeit-Nachrichten mit voller Markdown-Unterstützung und Code-Highlighting. Nutze Datei-Uploads per Drag-and-Drop, Emoji-Reaktionen und strukturierte Reply-Threads für maximale Übersichtlichkeit in großen Gruppen." },
  { icon: Microphone, title: "Kristallklare Voice-Channels", description: "Erlebe Audio in Studioqualität dank LiveKit-WebRTC-Integration. Inklusive intelligenter Rauschunterdrückung, Echo-Kompensation und globalem Edge-Netzwerk für minimale Latenzen unter 20ms." },
  { icon: Desktop, title: "Ultra-HD Streaming", description: "Teile deinen Bildschirm in gestochen scharfem 1080p bei flüssigen 60fps. Unsere optimierte Pipeline ermöglicht latenzfreies Streaming direkt im Browser – ohne zusätzliche Software-Installation." },
  { icon: ShieldCheck, title: "Erweiterte Moderation", description: "Präzision für Administratoren. Automatisierte Spam-Filter, detaillierte Audit-Logs und ein granulares Berechtigungssystem ermöglichen die sichere Skalierung deiner Community auf Tausende von Mitgliedern." },
  { icon: Database, title: "DSGVO-konforme Server", description: "Deine Daten sind sicher. Wir betreiben unsere Infrastruktur ausschließlich auf zertifizierten Servern in Deutschland. Keine Datenweitergabe an Drittstaaten, volle Kontrolle über deine Privatsphäre." },
  { icon: DeviceMobile, title: "PWA & Mobil-Optimiert", description: "Genieße das volle Streambite-Erlebnis plattformübergreifend. Unsere Progressive Web App Architektur garantiert schnelle Ladezeiten und eine native Haptik auf iOS, Android und Desktop-Geräten." },
]

export default function DetailedFeatures() {
  return (
    <section id="features" className="bg-[#0e0e10] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Alles, was deine Community braucht
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Von Text über Sprache bis Bildschirm – Streambite vereint alle
            Kommunikationsformen in einer Plattform mit Fokus auf technischer Exzellenz.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((item, i) => (
            <Card key={item.title} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
