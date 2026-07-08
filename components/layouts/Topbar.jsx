"use client";

import { useLayout } from "@/context";
import { twMerge } from "tailwind-merge";
import { CaretLeft } from "@phosphor-icons/react";

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
  const { showList } = useLayout();
  return (
    <header
      className={twMerge(
        "px-2 py-3 gap-2 flex shrink-0 items-center border-b border-white/5 bg-surface-app md:h-14",
        className,
      )}
      {...props}
    >
      <button
        onClick={showList}
        title="Zurück"
        className="md:hidden flex items-center justify-center size-10 rounded-full border-none bg-surface-hover text-zinc-400 cursor-pointer transition-colors hover:text-white"
      >
        <CaretLeft weight="regular" className="text-xl" />
      </button>
      {children}
    </header>
  );
}
