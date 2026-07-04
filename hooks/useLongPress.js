"use client";
import { useRef, useCallback } from "react";

/**
 * Detects a long-press (touch hold) on mobile.
 *
 * Returns:
 *  - `handlers` – spread onto the element that should detect long-press
 *  - `wasActive` – boolean ref; check in your onClick and skip if true
 *  - `clear()`   – reset the flag after checking
 *
 * @param {function} onLongPress  – callback fired after `delay` ms of holding
 * @param {number}   delay        – hold duration in ms (default 500)
 */
export default function useLongPress(onLongPress, delay = 500) {
  const timer = useRef(null);
  const wasActive = useRef(false);
  const moved = useRef(false);

  const start = useCallback(
    (e) => {
      if (e.type !== "touchstart") return;
      wasActive.current = false;
      moved.current = false;
      timer.current = setTimeout(() => {
        wasActive.current = true;
        onLongPress?.(e);
      }, delay);
    },
    [onLongPress, delay],
  );

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    wasActive.current = false;
  }, []);

  return {
    handlers: {
      onTouchStart: start,
      onTouchMove: cancel,
      onTouchEnd: cancel,
    },
    wasActive,
    clear,
  };
}
