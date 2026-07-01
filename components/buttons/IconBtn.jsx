"use client";

import { cn } from "@/lib";

/**
 * IconBtn – Einheitlicher Icon-Button (ersetzt ~50+ Inline-Klassen)
 *
 * <IconBtn icon={Microphone} onClick={toggleMute} title="Stummschalten" />
 * <IconBtn icon={Trash} onClick={handleDelete} title="Löschen" variant="danger" />
 * <IconBtn icon={CaretLeft} onClick={goBack} title="Zurück" mobileOnly />
 * <IconBtn icon={PaperPlaneTilt} onClick={handleSend} variant="primary" />
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
  const sizeClasses = {
    xs: "size-6",
    sm: "size-7",
    md: "size-8",
    lg: "size-9",
    xl: "size-10",
  };
  const mobileSizeClasses = {
    xs: "max-sm:size-6",
    sm: "max-sm:size-7",
    md: "max-sm:size-8",
    lg: "max-sm:size-9",
    xl: "max-sm:size-10",
  };

  const roundedClasses = {
    base: "rounded-(--radius-base)",
    sm: "rounded-(--radius-sm)",
    full: "rounded-full",
    none: "",
  };

  const variantClasses = {
    ghost: cn(
      "bg-transparent text-(--text-muted)",
      "hover:bg-(--state-hover) hover:text-(--text-secondary)",
    ),
    danger: cn(
      "bg-transparent text-(--danger)",
      "hover:bg-(--danger-subtle) hover:text-(--danger)",
    ),
    "danger-solid": "bg-(--danger) text-white hover:opacity-90",
    active: "bg-(--state-active) text-(--text-primary)",
    primary: "bg-(--text-primary) text-(--surface-deepest)",
    link: "bg-transparent text-(--accent) hover:underline",
  };

  const sizeClass = sizeClasses[size] ?? sizeClasses.md;
  const mobClass = mobileSize
    ? mobileSizeClasses[mobileSize]
    : "max-sm:size-10";

  const iconClass =
    size === "xs" || size === "sm"
      ? "text-sm md:text-base"
      : "text-xl md:text-lg";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      className={cn(
        // Base
        "flex shrink-0 items-center justify-center border-none cursor-pointer transition-all duration-100",
        sizeClass,
        mobClass,
        roundedClasses[rounded] ?? "rounded-(--radius-base)",
        variantClasses[variant] ?? variantClasses.ghost,
        // Active-Override für ghost
        active &&
          variant === "ghost" &&
          "bg-(--state-active) text-(--text-primary)",
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
