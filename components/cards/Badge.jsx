"use client";

import { cn } from "@/lib";

/**
 * Badge – Runder Benachrichtigungs-Zähler
 *
 * <Badge count={5} />
 * <Badge count={total} className="-right-2 -top-0.5" />
 */
export default function Badge({ count, className }) {
  if (!count || count <= 0) return null;

  // Ab 100+ zeigen wir "99+" an
  const display = count > 99 ? "99+" : count;

  return (
    <span
      className={cn(
        "absolute flex min-w-5 aspect-square items-center justify-center",
        "rounded-full border-2 border-(--surface-base) bg-(--danger)",
        "px-1 py-0.5 text-2xs font-(--weight-bold) leading-none text-white",
        className ?? "right-0 top-0",
      )}
    >
      {display}
    </span>
  );
}
