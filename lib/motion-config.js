/** Laufzeit-Prüfungen für Animationen – Accessibility + Low-End-Geräte */

import { motionTokens } from "./motion-tokens"

export const motionConfig = {
  isLowEnd() {
    if (typeof navigator === "undefined") return false
    return navigator.hardwareConcurrency <= 4
  },

  prefersReduced() {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  },

  shouldAnimate({ essential = false } = {}) {
    if (this.prefersReduced()) return false
    if (!essential && this.isLowEnd()) return false
    return true
  },

  duration() {
    return this.isLowEnd() || this.prefersReduced()
      ? motionTokens.duration.instant
      : motionTokens.duration.normal
  },
}
