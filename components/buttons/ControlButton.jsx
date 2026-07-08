import { twMerge } from "tailwind-merge";

export default function ControlButton({
  children,
  danger,
  active,
  onClick,
  mobileOnly,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        "flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-none text-white transition-colors",
        mobileOnly ? "hidden md:flex" : "",
        danger
          ? "bg-red hover:bg-red-hover"
          : active
            ? "bg-accent hover:bg-accent-hover"
            : "bg-surface-hover hover:bg-surface-raised",
      )}
    >
      {children}
    </button>
  );
}
