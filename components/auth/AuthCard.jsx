"use client";

import { motion } from "motion/react";
import { modal } from "@/lib";

export default function AuthCard({ children }) {
  return (
    <motion.div
      variants={modal}
      initial="hidden"
      animate="visible"
      className="w-full max-w-sm bg-(--surface-base) border border-(--border-default) rounded-xl p-8 shadow-(--shadow-xl)"
    >
      {children}
    </motion.div>
  );
}
