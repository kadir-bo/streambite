"use client"

export default function Error({ error, reset }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 bg-zinc-950 p-8">
      <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="size-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
      </div>
      <h2 className="text-lg font-semibold text-zinc-100">Ein Fehler ist aufgetreten</h2>
      <p className="text-sm text-zinc-500 text-center max-w-md">
        {error?.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut."}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-zinc-100 text-zinc-950 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
      >
        Erneut versuchen
      </button>
    </div>
  )
}
