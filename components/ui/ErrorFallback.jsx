"use client";

import { Warning } from "@phosphor-icons/react";

export function ErrorFallback({ error, reset, size = "lg" }) {
  const iconSize = size === "lg" ? "size-20" : "size-12";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-950 p-8">
      <div
        className={`${iconSize} flex items-center justify-center rounded-full bg-red-500/10 text-red-500`}
      >
        <Warning className={size === "lg" ? "text-4xl" : ""} />
      </div>
      <h2 className="text-lg font-semibold text-zinc-100">
        Ein Fehler ist aufgetreten
      </h2>
      <p className="max-w-md text-center text-sm text-zinc-500">
        {error?.message ||
          "Etwas ist schiefgelaufen. Bitte versuche es erneut."}
      </p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
