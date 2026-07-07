"use client";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { serverIcon } from "@/lib";
import { Tooltip } from "@/components";

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
      className="relative flex items-center py-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="px-1.5">
        <motion.div
          animate={state}
          variants={serverIcon}
          className={`flex size-10 border items-center justify-center overflow-hidden cursor-pointer rounded-2xl transition-colors duration-150 ${
            active
              ? "bg-surface-hover border-surface-border"
              : "bg-surface-deep hover:bg-surface-hover border-transparent"
          }`}
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
