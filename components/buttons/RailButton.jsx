"use client";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { serverPill, serverIcon } from "@/lib";
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
      <motion.span
        animate={state}
        variants={serverPill}
        className="absolute left-0 w-1 origin-left rounded-r-full bg-white"
      />
      <div className="px-1.5">
        <motion.div
          animate={state}
          variants={serverIcon}
          className={`flex size-12 items-center justify-center overflow-hidden cursor-pointer rounded-2xl transition-colors duration-150 ${
            active ? "bg-[#1c1c28]" : "bg-[#111119] hover:bg-[#1c1c28]"
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
