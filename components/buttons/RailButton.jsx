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
      className="relative flex items-center py-0.75 max-sm:py-1.25"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        animate={state}
        variants={serverPill}
        className="absolute left-0 w-0.75 origin-left rounded-r-sm bg-zinc-100"
      />
      <div className="px-1.75 ">
        <motion.div
          animate={state}
          variants={serverIcon}
          className={`flex size-12 md:size-10 items-center justify-center overflow-hidden cursor-pointer border border-white/5 ${active ? "bg-zinc-700" : "bg-zinc-800"}`}
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
