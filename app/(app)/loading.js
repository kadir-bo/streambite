export default function Loading() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-zinc-900">
      {/* Der Spinner erscheint visuell in der Bildschirmmitte,
          da das Sidebar-Layout links Platz lässt – das ist beabsichtigt.
          Der accent-farbene Rand signalisiert die Zugehörigkeit zur App. */}
      <div className="flex flex-col items-center gap-3">
        <div className="size-6 rounded-full animate-spin border-2 border-white/10 border-t-(--accent)" />
        <span className="text-xs text-zinc-500 font-medium">Channel wird geladen …</span>
      </div>
    </div>
  )
}
