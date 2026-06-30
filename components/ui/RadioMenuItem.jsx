"use client";

export default function RadioMenuItem({ label, active, disabled, onClick }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={
        "flex w-full items-center justify-between gap-3 rounded-(--radius-base) border-none bg-transparent px-3 py-2 text-left text-sm font-medium max-sm:py-2.5 " +
        (disabled
          ? "text-(--text-muted) opacity-40 cursor-not-allowed"
          : "text-(--text-secondary) hover:bg-(--state-hover) cursor-pointer")
      }
    >
      <span className="truncate">{label}</span>
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
          active ? "border-(--accent)" : "border-(--text-muted)"
        }`}
      >
        {active && <span className="size-2 rounded-full bg-(--accent)" />}
      </span>
    </button>
  );
}
