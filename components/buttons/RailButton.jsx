"use client";
import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { SpeakerHigh } from "@phosphor-icons/react";
import { serverIcon } from "@/lib";
import { Tooltip } from "@/components";
import { twMerge } from "tailwind-merge";

export default function RailButton({
  children,
  href,
  active,
  tooltip,
  onClick,
  voiceActive = false,
}) {
  const [hovered, setHovered] = useState(false);
  const state = active ? "active" : hovered ? "hover" : "idle";

  const inner = (
    <div
      className="relative flex items-center py-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="px-1.5 relative">
        <motion.div
          animate={state}
          variants={serverIcon}
          className={twMerge(
            "flex size-10 border items-center justify-center overflow-hidden cursor-pointer rounded-2xl transition-colors duration-150",
            active
              ? "bg-surface-hover border-surface-border"
              : "bg-surface-deep hover:bg-surface-hover border-transparent",
          )}
        >
          {children}
        </motion.div>

        {/* Voice-Active-Badge */}
        {voiceActive && (
          <div className="absolute -top-0.5 -right-0.5 size-4 flex items-center justify-center rounded-full bg-green-500 shadow-md">
            <SpeakerHigh weight="fill" className="size-2.5 text-white" />
          </div>
        )}
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
