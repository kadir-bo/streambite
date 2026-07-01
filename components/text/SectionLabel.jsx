export default function SectionLabel({ children, label, count, danger }) {
  if (label !== undefined) {
    // MemberSidebar variant: shows label with optional count
    return (
      <div className="flex items-center justify-between px-2 pt-3 pb-1">
        <span className="text-2xs font-semibold tracking-widest uppercase text-(--text-muted)">
          {label}
          {count !== undefined ? ` - ${count}` : ""}
        </span>
      </div>
    );
  }
  return (
    <span
      className={`mb-2 block text-2xs font-semibold tracking-widest uppercase ${danger ? "text-(--danger)" : "text-(--text-secondary)"}`}
    >
      {children}
    </span>
  );
}
