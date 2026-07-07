"use client";

import { CaretRight } from "@phosphor-icons/react";

export default function ContextMenuItem({
  icon,
  label,
  subtitle,
  chevron,
  danger,
  active,
  disabled,
  title,
  onClick,
  onMouseEnter,
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
      title={title}
      className={
        "w-full text-left px-3 py-2 rounded-lg border-none bg-transparent flex items-center gap-2 text-sm font-medium max-sm:py-2.5 " +
        (disabled
          ? "text-zinc-500 opacity-40 cursor-not-allowed"
          : danger
            ? "text-red-500 hover:bg-red-500/10 cursor-pointer"
            : active
              ? "text-zinc-100 bg-white/10 cursor-pointer"
              : "text-zinc-400 hover:bg-white/5 cursor-pointer")
      }
    >
      {icon && <span className="shrink-0 flex">{icon}</span>}
      {subtitle ? (
        <span className="min-w-0 flex-1">
          <span className="block truncate">{label}</span>
          <span className="block truncate text-xs font-normal text-zinc-500">
            {subtitle}
          </span>
        </span>
      ) : (
        <span className="min-w-0 flex-1 truncate">{label}</span>
      )}
      {chevron && <CaretRight className="shrink-0" />}
    </button>
  );
}
