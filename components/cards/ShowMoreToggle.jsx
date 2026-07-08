"use client";

import { CaretUp, CaretDown } from "@phosphor-icons/react";

/**
 * ShowMoreToggle — "N weitere anzeigen / Weniger anzeigen"-Button.
 *
 * <ShowMoreToggle showAll={showAll} hiddenCount={3} onClick={toggle} />
 */
export default function ShowMoreToggle({ showAll, hiddenCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-3 shrink-0 flex cursor-pointer items-center justify-center gap-1.5 self-center rounded-2xl border border-white/5 bg-surface-deep px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-surface-hover"
    >
      {showAll ? (
        <>
          <CaretUp size={14} /> Weniger anzeigen
        </>
      ) : (
        <>
          <CaretDown size={14} /> {hiddenCount} weitere anzeigen
        </>
      )}
    </button>
  );
}
