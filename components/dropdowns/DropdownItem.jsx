"use client";

import { cn } from "@/lib";

export default function DropdownItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-2 w-full px-2.5 py-1.75 rounded-sm text-sm text-left transition-colors duration-100", danger ? "text-red-500 hover:bg-red-500/10" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100")}
    >
      <Icon weight="bold" className="text-xl md:text-lg" />
      {label}
    </button>
  );
}
