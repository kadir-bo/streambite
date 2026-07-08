"use client";

import { Warning } from "@phosphor-icons/react/dist/ssr";

export default function Error({ error, reset }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-zinc-950 p-8">
      <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <Warning />
      </div>
      <h2 className="text-lg font-semibold text-zinc-100">
        Ein Fehler ist aufgetreten
      </h2>
      <p className="text-sm text-zinc-500 text-center max-w-md">
        {error?.message ||
          "Etwas ist schiefgelaufen. Bitte versuche es erneut."}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-zinc-100 text-zinc-950 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
