"use client";

import { useState, useEffect } from "react";
import { getInitials, cn } from "@/lib";

const sizes = {
  xs: { size: 20, font: "var(--text-2xs )" },
  sm: { size: 28, font: "var(--text-xs)" },
  md: { size: 32, font: "var(--text-sm)" },
  lg: { size: 40, font: "var(--text-base)" },
  xl: { size: 56, font: "var(--text-lg)" },
};

export default function Avatar({ src, name, size = "md", status, className }) {
  const { size: px, font } = sizes[size] ?? sizes.md;
  const initials = getInitials(name);
  const [failed, setFailed] = useState(false);

  // Reset the failure flag when the image source actually changes (e.g.
  // user uploads a new avatar) so it gets a fresh chance to load.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const statusDot = status && (
    <span
      className="absolute bottom-px right-px rounded-full border-2 border-(--surface-deep)"
      style={{
        width: Math.round(px * 0.35),
        height: Math.round(px * 0.35),
        background: `var(--status-${status})`,
      }}
    />
  );

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: px, height: px }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name ?? ""}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="rounded-full object-cover block"
          style={{ width: px, height: px }}
        />
      ) : (
        <span
          className="rounded-full bg-(--surface-raised) border border-(--border-default) flex items-center justify-center font-semibold text-(--text-secondary) select-none"
          style={{
            width: px,
            height: px,
            fontSize: font,
          }}
        >
          {initials}
        </span>
      )}
      {statusDot}
    </span>
  );
}
