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
        "w-full text-left px-3 py-2 rounded-(--radius-base) border-none bg-transparent flex items-center gap-2 text-sm font-medium " +
        (disabled
          ? "text-(--text-muted) opacity-40 cursor-not-allowed"
          : danger
            ? "text-(--danger) hover:bg-(--danger-subtle) cursor-pointer"
            : active
              ? "text-(--text-primary) bg-(--state-active) cursor-pointer"
              : "text-(--text-secondary) hover:bg-(--state-hover) cursor-pointer")
      }
    >
      {icon && <span className="shrink-0 flex">{icon}</span>}
      {subtitle ? (
        <span className="min-w-0 flex-1">
          <span className="block truncate">{label}</span>
          <span className="block truncate text-xs font-normal text-(--text-muted)">
            {subtitle}
          </span>
        </span>
      ) : (
        <span className="min-w-0 flex-1 truncate">{label}</span>
      )}
      {chevron && <CaretRight size={14} className="shrink-0" />}
    </button>
  );
}
