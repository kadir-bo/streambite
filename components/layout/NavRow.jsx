"use client";
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
      className={`flex items-center gap-2.5 px-2.5 py-2 my-0.5 mx-2 rounded-(--radius-base) no-underline transition-[background] duration-100 max-sm:py-2.5 max-sm:min-h-11 ${
        active
          ? "bg-(--state-active)"
          : "bg-transparent hover:bg-(--state-hover)"
      }${className}`}
    >
      {icon}
      <div className={`min-w-0 flex-1 ${textClassName}`}>
        <p
          className={`truncate text-sm ${active || unread ? "font-semibold text-(--text-primary)" : "font-medium text-(--text-secondary)"}`}
        >
          {label}
        </p>
        {children}
      </div>
      {unread && !active && (
        <span className="size-2 rounded-full bg-(--text-primary) shrink-0" />
      )}
    </Link>
  );
}
