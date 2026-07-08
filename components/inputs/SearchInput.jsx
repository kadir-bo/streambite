"use client";

import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { MagnifyingGlass } from "@phosphor-icons/react";

/**
 * SearchInput — Einheitliches Suchfeld mit Lupe.
 *
 * <SearchInput value={search} onChange={setSearch} placeholder="Suchen…" />
 *
 * Props werden auf das <input>-Element durchgereicht.
 * iconSize, iconClass steuern die Lupengrösse (default: 14px / text-sm).
 */
const SearchInput = forwardRef(function SearchInput(
  {
    value,
    onChange,
    placeholder = "Suchen…",
    className,
    inputClassName,
    iconSize,
    iconClass,
    autoFocus,
    ...props
  },
  ref,
) {
  return (
    <div
      className={twMerge(
        "flex items-center gap-2 bg-(--surface-deep) border border-white/5 rounded-lg px-3",
        className,
      )}
    >
      <MagnifyingGlass
        size={iconSize ?? 16}
        className={twMerge(
          "text-zinc-500 shrink-0",
          iconClass ?? "",
        )}
      />
      <input
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={twMerge(
          "flex-1 w-full bg-transparent border-none outline-none text-sm text-zinc-100 py-2.5",
          inputClassName,
        )}
        {...props}
      />
    </div>
  );
});

export default SearchInput;
