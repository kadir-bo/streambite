"use client";

import { useState } from "react";
import { getInitials } from "@/lib";

export default function ServerIcon({ name = "", iconUrl, size = 48 }) {
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.34);
  const [imgError, setImgError] = useState(false);

  if (iconUrl && !imgError) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconUrl}
          alt={name}
          width={size}
          height={size}
          onError={() => setImgError(true)}
          className="size-full object-cover block"
        />
      </>
    );
  }

  return (
    <span
      className="font-semibold text-zinc-400 tracking-tight select-none leading-none"
      style={{ fontSize }}
    >
      {initials || name.slice(0, 2).toUpperCase()}
    </span>
  );
}
