"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useMotionValue } from "motion/react";

/**
 * Shared logic for horizontally draggable tab navigation on mobile.
 *
 * Returns refs and Motion values needed for drag-scrolling tabs,
 * with auto-measured drag constraints that update when the modal opens.
 *
 * @param {boolean} open – modal/panel is open (triggers measure)
 * @returns {{ x: MotionValue, contentRef, maskRef, dragCons }}
 */
export function useTabDragScroll(open) {
  const x = useMotionValue(0);
  const contentRef = useRef(null);
  const maskRef = useRef(null);
  const [dragCons, setDragCons] = useState({ left: 0, right: 0 });

  const measure = useCallback(() => {
    if (!contentRef.current || !maskRef.current) return;
    const cw = maskRef.current.offsetWidth;
    const sw = contentRef.current.scrollWidth;
    if (sw > cw) {
      setDragCons({ left: -(sw - cw) - 20, right: 20 });
    } else {
      setDragCons({ left: 0, right: 0 });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(measure);
  }, [open, measure]);

  return { x, contentRef, maskRef, dragCons };
}
