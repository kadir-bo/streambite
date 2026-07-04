import Link from "next/link"

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 bg-zinc-950 p-8">
      <span className="text-6xl font-bold text-zinc-800">404</span>
      <h2 className="text-lg font-semibold text-zinc-100">Seite nicht gefunden</h2>
      <p className="text-sm text-zinc-500 text-center max-w-md">
        Die gesuchte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-zinc-100 text-zinc-950 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
      >
        Zur Startseite
      </Link>
    </div>
  )
}
