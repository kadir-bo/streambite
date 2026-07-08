"use client";

import { useState, useEffect } from "react";
import { getInitials, STATUS_COLORS } from "@/lib";
import { twMerge } from "tailwind-merge";
import { StatusDot } from "..";

const sizes = {
  xs: { size: 20, font: "10px" },
  sm: { size: 28, font: "11px" },
  md: { size: 32, font: "13px" },
  lg: { size: 40, font: "15px" },
  xl: { size: 56, font: "18px" },
};

export default function Avatar({ src, name, size = "md", status, className }) {
  const { size: px, font } = sizes[size] ?? sizes.md;
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
            className="rounded-full object-cover block border border-white/5"
            style={{ width: px, height: px }}
          />
        </>
      ) : (
        <span
          className="rounded-full bg-surface-card border border-white/10 flex items-center justify-center font-semibold text-zinc-400 select-none"
          style={{
            width: px,
            height: px,
            fontSize: font,
          }}
        >
          {initials}
        </span>
      )}
      <StatusDot
        color={STATUS_COLORS[status]}
        width={Math.round(px * 0.25)}
        height={Math.round(px * 0.25)}
      />
    </span>
  );
}
