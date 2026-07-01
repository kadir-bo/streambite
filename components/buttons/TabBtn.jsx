'use client'

export default function TabBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-2 rounded-(--radius-base) text-sm cursor-pointer transition-colors duration-150 ${
        active
          ? 'bg-(--state-active) text-(--text-primary) font-semibold'
          : 'bg-transparent text-(--text-muted) font-medium hover:bg-(--state-hover) hover:text-(--text-secondary)'
      }`}
    >
      {label}
    </button>
  )
}
