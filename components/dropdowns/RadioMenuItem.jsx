"use client";

export default function RadioMenuItem({ label, active, disabled, onClick }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={
        "flex w-full items-center justify-between gap-3 rounded-[8px] border-none bg-transparent px-3 py-2 text-left text-sm font-medium max-sm:py-2.5 " +
        (disabled
          ? "text-zinc-500 opacity-40 cursor-not-allowed"
          : "text-zinc-400 hover:bg-white/5 cursor-pointer")
      }
    >
      <span className="truncate">{label}</span>
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
          active ? "border-(--accent)" : "border-zinc-500"
        }`}
      >
        {active && <span className="size-2 rounded-full bg-(--accent)" />}
      </span>
    </button>
  );
}
