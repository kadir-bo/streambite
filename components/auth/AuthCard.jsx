"use client";

import { motion } from "motion/react";
import { modal } from "@/lib";

export default function AuthCard({ children }) {
  return (
    <motion.div
      variants={modal}
      initial="hidden"
      animate="visible"
      className="w-full max-w-sm bg-surface-card border border-white/10 rounded-xl p-8 shadow-xl"
    >
      {children}
    </motion.div>
  );
}
