"use client";

import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";

/**
 * Badge – Runder Benachrichtigungs-Zähler
 *
 * <Badge count={5} />
 * <Badge count={total} className="-right-2 -top-0.5" />
 */
export default function Badge({ count, className }) {
  if (!count || count <= 0) return null;

  // Ab 100+ zeigen wir "99+" an
  const display = count > 99 ? "99+" : count;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }}
      className={twMerge(
        "absolute flex min-w-5 aspect-square items-center justify-center",
        "rounded-full border-2 border-zinc-900 bg-red-500",
        "px-1 py-0.5 text-2xs font-bold leading-none text-white",
        className ?? "right-0 top-0",
      )}
    >
      {display}
    </motion.span>
  );
}
