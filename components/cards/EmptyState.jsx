export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      {Icon && <Icon size={48} className="text-(--text-ghost)" />}
      <div className="text-center">
        <p className="text-base font-semibold text-(--text-secondary) mb-1">
          {title}
        </p>
        {description && (
          <p className="text-sm text-(--text-muted)">{description}</p>
        )}
      </div>
    </div>
  );
}
