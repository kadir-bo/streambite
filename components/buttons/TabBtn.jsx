"use client";

export default function TabBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${
        active
          ? "bg-white/10 text-zinc-100 font-semibold"
          : "bg-transparent text-zinc-500 font-medium hover:bg-white/5 hover:text-zinc-400"
      }`}
    >
      {label}
    </button>
  );
}
