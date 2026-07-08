"use client";
import { cn } from "@/lib";
import Link from "next/link";

export default function NavRow({
  href,
  active,
  unread,
  icon,
  label,
  textClassName = "",
  className = "",
  children,
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5 px-2.5 py-2 my-0.5 mx-2 rounded-lg no-underline transition-colors duration-100 max-sm:py-2.5 max-sm:min-h-11", active ? "bg-white/10" : "bg-transparent hover:bg-white/5", className)}
    >
      {icon}
      <div className={cn("min-w-0 flex-1", textClassName)}>
        <p
          className={cn("truncate text-sm", active || unread ? "font-semibold text-zinc-100" : "font-medium text-zinc-400")}
        >
          {label}
        </p>
        {children}
      </div>
      {unread && !active && (
        <span className="size-2 rounded-full bg-zinc-100 shrink-0" />
      )}
    </Link>
  );
}
