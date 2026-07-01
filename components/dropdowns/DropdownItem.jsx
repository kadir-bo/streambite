"use client";

export default function DropdownItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-2.5 py-1.75 rounded-sm text-sm text-left transition-colors duration-100 ${
        danger
          ? "text-(--danger) hover:bg-(--danger-subtle)"
          : "text-(--text-secondary) hover:bg-(--state-hover) hover:text-(--text-primary)"
      }`}
    >
      <Icon weight="bold" className="text-xl md:text-lg" />
      {label}
    </button>
  );
}
