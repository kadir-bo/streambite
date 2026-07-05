"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { motionTokens, springs } from "@/lib/motion-tokens";

/**
 * StepCard – Spezialkomponente für HowItWorks mit Nummern-Badge und Verbindungslinie.
 * @param {{ icon, number, title, desc }} step
 * @param {number} index
 * @param {number} total - Gesamtanzahl Steps (für Verbindungslinie)
 */
export default function StepCard({ step, index = 0, total = 4 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{
        duration: motionTokens.stagger.duration,
        delay: index * motionTokens.stagger.delay,
        ease: motionTokens.easing.stagger,
      }}
      className="relative flex flex-col items-center text-center group"
    >
      {/* Icon + Number Circle */}
      <div className="relative mb-5">
        <motion.div
          whileHover={{ scale: motionTokens.scale.pop }}
          transition={springs.bouncy}
          className="size-16 rounded-2xl bg-gradient-to-br from-(--accent)/20 to-(--accent)/5 border border-(--accent)/20 flex items-center justify-center group-hover:border-(--accent)/40 group-hover:from-(--accent)/30 group-hover:to-(--accent)/10 transition-all duration-300"
        >
          <Icon className="text-2xl text-(--accent)" weight="duotone" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ ...springs.bouncy, delay: index * motionTokens.stagger.delay + 0.25 }}
          className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-(--accent) text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-(--accent)/30"
        >
          {step.number}
        </motion.div>
      </div>

      {/* Verbindungslinie */}
      {index < total - 1 && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px">
          <div className="w-full h-full bg-gradient-to-r from-(--accent)/30 to-transparent" />
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-[18rem] mx-auto">
        {step.desc}
      </p>
    </motion.div>
  );
}
