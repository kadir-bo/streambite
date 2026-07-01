"use client";

import { useState, useEffect } from "react";

// "Desktop" here means a fine (mouse) pointer is the primary input, not a
// viewport-width check - laptops with touchscreens still count as desktop
// since they have a mouse/trackpad as the primary pointer.
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    setIsDesktop(query.matches);
    const onChange = (e) => setIsDesktop(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}
