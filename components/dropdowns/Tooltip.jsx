"use client";
import { motion } from "motion/react";

export default function Tooltip({ label, visible }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6, scale: 0.9 }}
      animate={{
        opacity: visible ? 1 : 0,
        x: visible ? 0 : -6,
        scale: visible ? 1 : 0.9,
      }}
      transition={{ duration: 0.12 }}
      className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-[8px] border border-white/5 bg-zinc-700 px-2.5 py-1.25 text-sm font-semibold text-zinc-100 shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-[500]"
    >
      {label}
    </motion.div>
  );
}
