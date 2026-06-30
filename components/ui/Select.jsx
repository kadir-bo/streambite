"use client";

import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib";

export default function Select({ label, className, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-2xs font-medium tracking-widest uppercase text-(--text-secondary)">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            "w-full appearance-none outline-none transition-colors bg-(--surface-raised) rounded-(--radius-base) px-3 py-2.5 pr-9 text-sm text-(--text-primary) border border-(--border-default) focus:border-(--border-strong) cursor-pointer",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <CaretDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) text-sm md:text-base"
        />
      </div>
    </div>
  );
}
