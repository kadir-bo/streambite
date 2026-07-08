"use client";

import { useState, useEffect } from "react";
import { getInitials, STATUS_COLORS } from "@/lib";
import { twMerge } from "tailwind-merge";
import { StatusDot } from "..";

const sizes = {
  xs: { size: 20, font: "10px", dotSize: "size-1" },
  sm: { size: 28, font: "11px", dotSize: "size-1.5" },
  md: { size: 32, font: "13px", dotSize: "size-2" },
  lg: { size: 40, font: "15px", dotSize: "size-2.5" },
  xl: { size: 56, font: "18px", dotSize: "size-3" },
};

export default function Avatar({
  src,
  name,
  size = "md",
  status,
  className,
  isSpeaking = false,
}) {
  const { size: px, font, dotSize } = sizes[size] ?? sizes.md;
  const initials = getInitials(name);
  const [failed, setFailed] = useState(false);

  // Reset the failure flag when the image source actually changes (e.g.
  // user uploads a new avatar) so it gets a fresh chance to load.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFailed(false);
  }, [src]);

  return (
    <span
      className={twMerge("relative inline-flex shrink-0", className)}
      style={{ width: px, height: px }}
    >
      {src && !failed ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={name ?? ""}
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className={twMerge(
              "rounded-full object-cover block border  aspect-square",
              isSpeaking ? "border-green" : "border-white/10",
            )}
            style={{ width: px, height: px }}
          />
        </>
      ) : (
        <span
          className={twMerge(
            "rounded-full bg-surface-card border  flex items-center justify-center font-semibold text-zinc-400 select-none aspect-square",
            isSpeaking ? "border-green" : "border-white/10",
          )}
          style={{
            width: px,
            height: px,
            fontSize: font,
          }}
        >
          {initials}
        </span>
      )}
      {status && (
        <StatusDot
          color={STATUS_COLORS[status]}
          width={Math.round(px * 0.25)}
          height={Math.round(px * 0.25)}
          size={dotSize}
        />
      )}
    </span>
  );
}
