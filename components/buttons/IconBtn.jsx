"use client";

import { twMerge } from "tailwind-merge";

/**
 * IconBtn – Einheitlicher Icon-Button (ersetzt ~50+ Inline-Klassen)
 *
 * <IconBtn icon={Microphone} onClick={toggleMute} title="Stummschalten" />
 * <IconBtn icon={Trash} onClick={handleDelete} title="Löschen" variant="danger" />
 * <IconBtn icon={CaretLeft} onClick={goBack} title="Zurück" mobileOnly />
 * <IconBtn icon={PaperPlaneTilt} onClick={handleSend} variant="primary" />
 *
 * Größen:
 *   size="xs" | "sm" | "md" | "lg" | "xl"  → vordefinierte Maps (size-6 … size-10)
 *   size="size-4" | "size-16"               → beliebige Tailwind-Klasse direkt
 *   mobileSize="sm" | "lg"                  → vordefinierte Maps (max-sm:size-11 … 12)
 *   mobileSize="max-sm:size-16"             → beliebige Tailwind-Klasse direkt
 */
export default function IconBtn({
  icon: Icon,
  onClick,
  title,
  variant = "ghost", // ghost | danger | danger-solid | active | primary | link
  size = "md", // xs | sm | md | lg | xl
  mobileSize, // überschreibt max-sm Größe
  rounded = "base", // base | sm | full | none
  mobileOnly, // → md:hidden (nur auf Mobile sichtbar)
  desktopOnly, // → hidden md:flex (nur auf Desktop sichtbar)
  active,
  disabled,
  iconWeight,
  className = "",
  children,
  ...props
}) {
  // Tailwind JIT kann keine dynamischen Strings wie `size-${x}` - daher feste Map
  // Desktop-Größen bleiben kompakt für Mausbedienung; Mobile wird auf mindestens
  // 44–48px (Apple HIG / WCAG) vergrößert für bessere Touch-Bedienbarkeit.
  const sizeClasses = {
    xs: "size-6",
    sm: "size-7",
    md: "size-8",
    lg: "size-9",
    xl: "size-10",
    "2xl": "size-15",
  };
  const mobileSizeClasses = {
    xs: "max-sm:size-10", // 40px – absolute Minimum für kleine Aktions-Buttons
    sm: "max-sm:size-11",
    md: "max-sm:size-11",
    lg: "max-sm:size-12", // 48px – optimaler Touch-Target
    xl: "max-sm:size-12",
  };

  // Icon-Größe skaliert mit Button-Größe
  const iconSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  const roundedClasses = {
    base: "rounded-lg",
    sm: "rounded",
    full: "rounded-full",
    none: "",
  };

  const variantClasses = {
    ghost: twMerge(
      "bg-transparent text-zinc-500",
      "hover:bg-white/5 hover:text-zinc-400",
    ),
    surface: twMerge(
      "bg-surface-hover text-zinc-400",
      "hover:bg-surface-raised hover:text-white",
    ),
    danger: twMerge(
      "bg-transparent text-red-500",
      "hover:bg-red-500/10 hover:text-red-500",
    ),
    "danger-solid": "bg-red-500 text-white hover:opacity-90",
    active: "bg-white/10 text-zinc-100",
    primary: "bg-zinc-100 text-zinc-950",
    link: "bg-transparent text-(--accent) hover:underline",
  };

  // size kann sowohl ein Key (xs/sm/md/...) als auch ein direktes Tailwind-Klasse
  // sein (z.B. "size-4" oder "size-16"). Gleiches gilt für mobileSize.
  const sizeClass = sizeClasses[size] ?? size ?? sizeClasses.md;
  const mobClass = mobileSize
    ? (mobileSizeClasses[mobileSize] ?? mobileSize)
    : "max-sm:size-11";

  // Icon-Größe über Map: size="sm" → text-sm, size="xl" → text-xl, Raw → text-xl
  const iconClass = iconSizeClasses[size] ?? "text-xl";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      className={twMerge(
        // Base
        "flex shrink-0 items-center justify-center border-none cursor-pointer transition-all duration-100",
        sizeClass,
        mobClass,
        roundedClasses[rounded] ?? "rounded-lg",
        variantClasses[variant] ?? variantClasses.ghost,
        // Active-Override für ghost
        active && variant === "ghost" && "bg-white/10 text-zinc-100",
        mobileOnly && "md:hidden",
        desktopOnly && "hidden md:flex",
        disabled && "opacity-40 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          weight={iconWeight ?? (active ? "fill" : "regular")}
          className={iconClass}
        />
      )}
      {children}
    </button>
  );
}
