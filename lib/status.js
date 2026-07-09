// ── Status-Definitionen ──────────────────────────────────────────────
// Zentraler Ort für alle Status-Codes, Labels und Farben.
// Komponenten importieren diese Konstanten statt sie lokal zu definieren.

export const STATUS_COLORS = {
  online: "#22c55e",
  busy: "#f5340b",
  idle: "#c5c322",
  offline: "#3f3f46",
};

export const STATUS_LABELS = {
  online: "Online",
  busy: "Beschäftigt",
  idle: "Abwesend",
  offline: "Offline",
};

/** Array für Dropdowns/Listen: { value, label, color } */
export const STATUS_OPTIONS = Object.keys(STATUS_COLORS).map((key) => ({
  value: key,
  label: STATUS_LABELS[key],
  color: STATUS_COLORS[key],
}));
