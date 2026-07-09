"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  LockSimple,
  ShieldCheck,
  StackSimple,
  EyeSlash,
} from "@phosphor-icons/react";
import { motionTokens } from "@/lib";
import { Card } from "@/components";

const securityItems = [
  {
    icon: LockSimple,
    title: "TLS-Verschlüsselung",
    description:
      "Sämtliche Kommunikation ist via WebRTC DTLS/SRTP verschlüsselt – sicher vor Zugriff durch Dritte.",
  },
  {
    icon: ShieldCheck,
    title: "Sichere Anmeldung",
    description:
      "Login via Google OAuth oder E-Mail – verwaltet durch Firebase Auth. Kein Speichern von Passwörtern auf unseren Servern.",
  },
  {
    icon: StackSimple,
    title: "Moderation & Kontrolle",
    description:
      "Granulare Berechtigungen, Audit-Logs und Rollenverwaltung für Admins – volle Kontrolle über deine Community.",
  },
  {
    icon: EyeSlash,
    title: "Profil & Privatsphäre",
    description:
      "Du bestimmst, wer dich findet, dir schreiben kann und welchen Servern du beitrittst.",
  },
];

export default function SecuritySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="border-t border-white/6 py-24 md:py-32 bg-[#1c1b1d]/20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{
              duration: motionTokens.duration.normal,
              ease: motionTokens.easing.glide,
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-(--accent)/20 bg-(--accent)/5 px-3 py-1 text-xs font-medium text-(--accent) mb-6"
          >
            <span className="size-1.5 rounded-full bg-(--accent) animate-pulse" />
            Sicherheit & Datenschutz
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{
              duration: motionTokens.duration.normal,
              delay: 0.06,
              ease: motionTokens.easing.glide,
            }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white"
          >
            Privatsphäre als Prinzip
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-(--accent) to-indigo-400">
              Verschlüsselt. Sicher. Deins.
            </span>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {securityItems.map((item, i) => (
            <Card key={item.title} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
