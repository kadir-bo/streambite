"use client";

import {
  LockSimple,
  Waveform,
  Cloud,
  StackSimple,
} from "@phosphor-icons/react";
import { Card } from "@/components";

const trustItems = [
  { icon: LockSimple, title: "End-to-End Encrypted", description: "AES-256-GCM verschlüsselt" },
  { icon: Waveform, title: "Sub-ms Audio", description: "Globale Edge-Latenz < 20ms" },
  { icon: Cloud, title: "Hostet in DE", description: "ISO-zertifizierte Rechenzentren" },
  { icon: StackSimple, title: "Modernster Stack", description: "LiveKit WebRTC + Next.js" },
];

export default function TrustSection() {
  return (
    <section className="relative max-w-5xl mx-auto px-6 pb-24">
      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] py-10 px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 md:gap-8">
          {trustItems.map((item, i) => (
            <Card key={item.title} {...item} variant="center" index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
