"use client";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { serverPill, serverIcon } from "@/lib";
import Tooltip from "@/components/ui/Tooltip";

export default function RailButton({
  children,
  href,
  active,
  tooltip,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);
  const state = active ? "active" : hovered ? "hover" : "idle";

  const inner = (
    <div
      className="relative flex items-center py-0.75 max-sm:py-1.25"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        animate={state}
        variants={serverPill}
        className="absolute left-0 w-0.75 origin-left rounded-r-[3px] bg-(--text-primary)"
      />
      <div className="px-1.75 ">
        <motion.div
          animate={state}
          variants={serverIcon}
          className={`flex size-10 md:size-8.5 items-center justify-center overflow-hidden cursor-pointer border border-(--border-subtle) ${active ? "bg-(--surface-overlay)" : "bg-(--surface-raised)"}`}
        >
          {children}
        </motion.div>
      </div>
      {tooltip && <Tooltip label={tooltip} visible={hovered} />}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="block w-full bg-transparent border-none p-0"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}
