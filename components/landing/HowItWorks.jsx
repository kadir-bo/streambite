"use client";

import {
  UserPlus,
  Compass,
  LinkSimple,
  ChatCircleDots,
} from "@phosphor-icons/react";
import { StepCard } from "@/components";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Konto erstellen",
    desc: "Registriere dich mit deiner E-Mail in unter 30 Sekunden. Kein Bestätigungs-Marathon.",
  },
  {
    icon: Compass,
    number: "2",
    title: "Server erstellen",
    desc: "Erstelle deinen Server und richte Text- sowie Voice-Channels nach deinen Bedürfnissen ein.",
  },
  {
    icon: LinkSimple,
    number: "3",
    title: "Freunde einladen",
    desc: "Verschicke Einladungs-Links an deine Freunde oder dein Team. Ein Klick zum Beitreten.",
  },
  {
    icon: ChatCircleDots,
    number: "4",
    title: "Austauschen",
    desc: "Starte den Austausch – egal ob Text, Voice oder hochauflösendes Streaming.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-[#09090b] py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-white/6 to-transparent" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 size-125 bg-(--accent) opacity-[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-white">
            So funktioniert&apos;s
          </h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto">
            In vier einfachen Schritten zu deiner eigenen Community.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-10 md:gap-6">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} total={steps.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
