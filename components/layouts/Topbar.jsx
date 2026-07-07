"use client";

import { cn } from "@/lib";

/**
 * Gemeinsames Basis-Styling für alle Topbars/Header-Leisten.
 *
 * - Höhe: h-12 (48px)
 * - Hintergrund: bg-zinc-900
 * - Unterkante: border-b border-white/5
 * - Flex: shrink-0, items-center
 *
 * Jede Topbar kann per className eigene Werte overriden (z.B. justify-between, gap, px).
 */
export default function Topbar({ children, className, ...props }) {
  return (
    <header
      className={cn(
        "px-2 py-3 gap-2 flex shrink-0 items-center border-b border-white/5 bg-surface-app md:h-14",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}
