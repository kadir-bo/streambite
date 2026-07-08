import { cn } from "@/lib";

export default function SectionLabel({ children, label, count, danger }) {
  if (label !== undefined) {
    // MemberSidebar variant: shows label with optional count
    return (
      <div className="flex items-center justify-between px-2 pt-3 pb-1">
        <span className="text-2xs font-semibold tracking-widest uppercase text-zinc-500">
          {label}
          {count !== undefined ? ` - ${count}` : ""}
        </span>
      </div>
    );
  }
  return (
    <span
      className={cn("mb-2 block text-2xs font-semibold tracking-widest uppercase", danger ? "text-red-500" : "text-zinc-400")}
    >
      {children}
    </span>
  );
}
