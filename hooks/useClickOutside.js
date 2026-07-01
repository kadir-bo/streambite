"use client";

import { useEffect } from "react";

// Fires `onOutside` for clicks that land outside every given ref. Accepts a
// single ref or an array of refs (e.g. a menu plus its flyout submenu, which
// are two separate DOM subtrees but should count as one "inside" region).
// Registered on the capture phase, so when two of these are mounted at once
// (e.g. two separate context menus), the one opened first always sees an
// "outside" click on the other's trigger button before that trigger's own
// click handler runs - which is what keeps two menus from both being open.
export function useClickOutside(refs, onOutside, active = true) {
  const refList = Array.isArray(refs) ? refs : [refs];

  useEffect(() => {
    if (!active) return;

    function handleClick(e) {
      const isInside = refList.some(
        (r) => r.current && r.current.contains(e.target),
      );
      if (!isInside) onOutside(e);
    }

    // Defer so the same click that flips `active` to true doesn't immediately
    // fire this (the click is still bubbling/capturing when the listener
    // would otherwise attach).
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClick, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClick, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onOutside, ...refList]);
}
