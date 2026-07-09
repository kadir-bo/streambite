export function LoadingSpinner({ label, accent, className = "" }) {
  return (
    <div
      className={`flex h-full min-h-screen fixed top-0 left-0 w-screen items-center justify-center bg-surface-app ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className={`size-6 rounded-full border-2 border-white/10 animate-spin ${
            accent ? "border-t-(--accent)" : "border-t-zinc-400"
          }`}
        />
        {label && (
          <span className="text-xs font-medium text-zinc-500">{label}</span>
        )}
      </div>
    </div>
  );
}
