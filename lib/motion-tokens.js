/** Gemeinsame Motion-Tokens für das gesamte Streambite-Projekt */

export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.18,
    normal: 0.35,
    slow: 0.6,
    crawl: 1.0,
  },
  easing: {
    /** Sanftes Einfliegen / Decelerate – perfekt für Entrance */
    smooth: [0.22, 1, 0.36, 1],
    /** Etwas weicher als smooth, minimal overshoot */
    glide: [0.16, 1, 0.3, 1.02],
    /** Für Stagger-Animationen – weicher Ease-Out mit weniger Spannung */
    stagger: [0.25, 0.46, 0.45, 0.94],
    /** Standard-Beschleunigung */
    sharp: [0.4, 0, 0.2, 1],
    /** Leichter Bounce-Effekt */
    bounce: [0.34, 1.56, 0.64, 1],
    linear: [0, 0, 1, 1],
  },
  stagger: {
    /** Verzögerung zwischen Stagger-Items */
    delay: 0.06,
    /** Dauer pro Item-Animation im Stagger */
    duration: 0.38,
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 48,
  },
  scale: {
    subtle: 0.98,
    press: 0.96,
    pop: 1.04,
    tap: 0.97,
  },
}

export const springs = {
  snappy: { type: "spring", stiffness: 500, damping: 35, mass: 0.8 },
  default: { type: "spring", stiffness: 350, damping: 28, mass: 1 },
  gentle: { type: "spring", stiffness: 200, damping: 26, mass: 1.2 },
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
  instant: { type: "spring", stiffness: 600, damping: 35 },
  release: { type: "spring", stiffness: 200, damping: 20, restDelta: 0.001 },
}

export const fade = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1],
}
