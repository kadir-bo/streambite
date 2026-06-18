// ============================================================
// Streambite Motion Spring Presets
// Quelle: .claude/DESIGN-SYSTEM.md — Section 3
// Kopiert nach: lib/ui/springs.js
// ============================================================

export const springs = {
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },
  default: {
    type: 'spring',
    stiffness: 350,
    damping: 28,
    mass: 1,
  },
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 26,
    mass: 1.2,
  },
};

export const fade = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1],
};
