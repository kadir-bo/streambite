// ── Status-Definitionen ──────────────────────────────────────────────
// Zentraler Ort für alle Status-Codes, Labels und Farben.
// Komponenten importieren diese Konstanten statt sie lokal zu definieren.

export const STATUS_COLORS = {
  online: "#22c55e",
  busy: "#f5340b",
  idle: "#f5340b",
  offline: "#3f3f46",
};

export const STATUS_LABELS = {
  online: "Online",
  busy: "Beschäftigt",
  idle: "Abwesend",
  offline: "Offline",
};
