"use client";

import { motion } from "motion/react";

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col items-center justify-center gap-4"
    >
      {Icon && <Icon size={48} className="text-zinc-600" />}
      <div className="text-center">
        <p className="text-base font-semibold text-zinc-400 mb-1">
          {title}
        </p>
        {description && (
          <p className="text-sm text-zinc-500 text-balance">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
