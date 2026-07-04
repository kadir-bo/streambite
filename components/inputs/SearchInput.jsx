"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-2 bg-(--surface-deep) border border-white/5 rounded-[8px] px-3">
      <MagnifyingGlass className="text-zinc-500 shrink-0 text-xl md:text-lg" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Suche"}
        className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-100 py-2.5"
      />
    </div>
  );
}
