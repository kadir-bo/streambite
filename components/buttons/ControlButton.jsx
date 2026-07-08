import { twMerge } from "tailwind-merge";

/**
 * ControlButton — 48px runder Button für Voice-Controls.
 *
 * variant: "default" (bg-surface-hover) | "danger" (bg-red) | "active" (bg-gray-800) | "accent" (bg-accent)
 */
export default function ControlButton({
  children,
  danger,
  active,
  accent,
  onClick,
  mobileOnly,
  disabled = false,
  className = "",
}) {
  // danger/active/accent bleiben als Rückwärtskompatibilität
  const variant = danger
    ? "danger"
    : accent
      ? "accent"
      : active
        ? "active"
        : "default";

  const variantClasses = {
    default: "bg-surface-hover hover:bg-surface-raised",
    danger: "bg-red hover:bg-red-hover",
    active: "bg-gray-800 hover:bg-accent-hover",
    accent: "bg-accent hover:bg-accent-hover",
  };
  const isScreenButton = variantClasses[variant] === "screen";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={twMerge(
        "flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-none text-white transition-colors disabled:opacity-50",
        mobileOnly ? "flex md:hidden" : "",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
