# Streambite Design System

> Ground Truth für alle UI-Entscheidungen. Jede Komponente, jedes Layout, jede Animation
> folgt exakt diesen Spezifikationen. Keine lokalen Abweichungen ohne Dokumentation hier.

---

## 1. Tokens — CSS Custom Properties

Die einzige Quelle der Wahrheit für alle Designwerte.
Alles, was einen hardgecodeten Wert hätte, wird stattdessen als Token referenziert.

```css
/* styles/tokens.css */

:root {
  /* ─── SURFACES ──────────────────────────────────────────────────────────
   * 5 Elevationsebenen. Von unten nach oben: deepest → overlay.
   * Nie eine Farbe außerhalb dieser Skala für Hintergründe verwenden.
   */
  --surface-deepest:  #09090b;   /* zinc-950  — Server-Sidebar, dunkelste Ebene     */
  --surface-deep:     #111113;   /* ~zinc-950 — Channel-Sidebar                     */
  --surface-base:     #18181b;   /* zinc-900  — Main Content Area                   */
  --surface-raised:   #27272a;   /* zinc-800  — Karten, Modals, Inputs              */
  --surface-overlay:  #3f3f46;   /* zinc-700  — Tooltips, Dropdowns, Hover-Overlays */

  /* ─── TEXT ──────────────────────────────────────────────────────────────
   * 4 Helligkeitsstufen. Keine Farbe — ausschließlich neutral.
   */
  --text-primary:   #f4f4f5;   /* zinc-100 — Haupttext, aktive Labels, Nutzernamen */
  --text-secondary: #a1a1aa;   /* zinc-400 — Timestamps, Metainfos, Subtexte       */
  --text-muted:     #71717a;   /* zinc-500 — Placeholder, deaktiviert, Kategorie   */
  --text-ghost:     #52525b;   /* zinc-600 — sehr dezent, fast unsichtbar          */

  /* ─── BORDERS ───────────────────────────────────────────────────────────
   * Alle Borders: white mit Opazität. Nie farbig.
   */
  --border-subtle:  rgba(255, 255, 255, 0.06);  /* kaum sichtbar — Karten, Divider */
  --border-default: rgba(255, 255, 255, 0.10);  /* Standard-Border                 */
  --border-strong:  rgba(255, 255, 255, 0.18);  /* Focus-Ring, aktive Inputs       */

  /* ─── INTERACTIVE STATES ────────────────────────────────────────────────
   * Kein Akzent. Aktive States = Helligkeit nach oben.
   */
  --state-hover:    rgba(255, 255, 255, 0.04);  /* leichtestes Highlight            */
  --state-active:   rgba(255, 255, 255, 0.10);  /* ausgewählter Zustand             */
  --state-pressed:  rgba(255, 255, 255, 0.14);  /* gedrückt / :active               */
  --state-focus:    rgba(255, 255, 255, 0.20);  /* Focus-Ring                       */
  --state-disabled: rgba(255, 255, 255, 0.04);  /* Hintergrund bei disabled         */

  /* ─── STATUS (semantisch, nicht dekorativ) ──────────────────────────────
   * Einzige Farbpunkte der App. Immer an dasselbe Konzept geknüpft.
   */
  --status-online:    #22c55e;   /* grün  — verfügbar                               */
  --status-idle:      #f59e0b;   /* amber — nicht aktiv / Idle                      */
  --status-dnd:       #ef4444;   /* rot   — Nicht stören                            */
  --status-offline:   #3f3f46;   /* zinc  — offline / unsichtbar (kein Chroma)      */
  --status-live:      #f43f5e;   /* rose  — live / streaming (kritische Info)       */

  /* ─── DANGER (semantisch) ───────────────────────────────────────────────
   * Nur für destruktive Aktionen: Löschen, Kick, Ban, Konto-Entfernung.
   */
  --danger:           #ef4444;   /* rot — destruktiv                                */
  --danger-hover:     #dc2626;   /* dunkleres rot bei Hover                         */
  --danger-subtle:    rgba(239, 68, 68, 0.10);  /* Hintergrund für Danger-Bereiche  */

  /* ─── TYPOGRAPHY ────────────────────────────────────────────────────────
   * Schriftfamilien via next/font eingebunden (kein CDN).
   */
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', monospace;

  /* Font Sizes — t-shirt scale */
  --text-2xs:  10px;   /* Badges, Timestamps in kompakter Ansicht         */
  --text-xs:   11px;   /* Kategorie-Label, Sub-Metainfos                  */
  --text-sm:   13px;   /* Channel-Name (inaktiv), Timestamp, Helper Text  */
  --text-base: 15px;   /* Nachrichten-Body, Nutzernamen, Standard          */
  --text-md:   16px;   /* Server-Name, Section-Header, wichtige Labels     */
  --text-lg:   18px;   /* Modal-Titel, Settings-Headline                  */
  --text-xl:   22px;   /* große Überschriften (leere States)              */
  --text-2xl:  28px;   /* Hero-Text innerhalb der App (selten)            */

  /* Font Weights */
  --weight-normal:   400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* Line Heights */
  --leading-tight:   1.25;
  --leading-snug:    1.375;   /* Nachrichten-Body */
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  /* Letter Spacings */
  --tracking-tight:  -0.01em;
  --tracking-normal:  0;
  --tracking-wide:    0.04em;
  --tracking-widest:  0.12em;  /* Kategorie-Header UPPERCASE */

  /* ─── SPACING ───────────────────────────────────────────────────────────
   * 4px-Basis-Grid. Alle Abstände sind Vielfache von 4.
   */
  --space-0:   0px;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* ─── BORDER RADIUS ─────────────────────────────────────────────────────
   * Eine Skala. Konsistent überall. Kein Mischen.
   */
  --radius-sm:   4px;    /* Tags, Badges, Inline-Code          */
  --radius-base: 8px;    /* Channel-Items, Buttons, Inputs     */
  --radius-lg:  12px;    /* Karten, Modals, Dropdowns          */
  --radius-xl:  16px;    /* Message-Input, große Panels        */
  --radius-2xl: 20px;    /* Server-Icon (inaktiv)              */
  --radius-pill: 9999px; /* Status-Dots, Pill-Indikatoren      */

  /* ─── SHADOWS / ELEVATION ───────────────────────────────────────────────
   * Keine farbigen Glows. Nur black mit Opazität.
   */
  --shadow-sm:  0 1px  2px rgba(0, 0, 0, 0.3);
  --shadow-md:  0 4px  8px rgba(0, 0, 0, 0.4);
  --shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-xl:  0 16px 48px rgba(0, 0, 0, 0.6);  /* Modals, Overlays */

  /* ─── Z-INDEX SCALE ─────────────────────────────────────────────────────
   * Niemals willkürliche z-Index-Werte. Nur diese Stufen.
   */
  --z-base:     0;
  --z-raised:   10;   /* Sticky Header, Channel-Header          */
  --z-dropdown: 100;  /* Tooltips, Dropdowns, Kontext-Menüs     */
  --z-modal:    200;  /* Modals, Dialogs                        */
  --z-overlay:  300;  /* Settings Fullscreen, große Overlays    */
  --z-toast:    400;  /* Toasts (immer oben)                    */

  /* ─── LAYOUT DIMENSIONS ────────────────────────────────────────────────
   * Feste Größen für App-Struktur. Nie hardcoden — immer Token.
   */
  --sidebar-server:   64px;   /* Linke Server-Icon-Leiste             */
  --sidebar-channel: 240px;   /* Channel-Liste + User-Panel           */
  --sidebar-member:  240px;   /* Rechte Member-Liste                  */
  --header-channel:   48px;   /* Obere Leiste im Content-Bereich      */
  --panel-settings:  220px;   /* Nav-Sidebar im Settings-Modal        */

  /* ─── ANIMATION ─────────────────────────────────────────────────────────
   * Alle Framer Motion transitions verwenden diese Werte.
   * Kein "eyeballed" timing. Tokens sind die Grundlage.
   */
  --duration-instant: 80ms;
  --duration-fast:   150ms;
  --duration-base:   200ms;
  --duration-slow:   300ms;
  --duration-slower: 450ms;

  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce:     cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 2. Tailwind Config Extension

```js
// tailwind.config.js — Erweiterung für Streambite-Tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          deepest: 'var(--surface-deepest)',
          deep:    'var(--surface-deep)',
          base:    'var(--surface-base)',
          raised:  'var(--surface-raised)',
          overlay: 'var(--surface-overlay)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          ghost:     'var(--text-ghost)',
        },
        status: {
          online:  'var(--status-online)',
          idle:    'var(--status-idle)',
          dnd:     'var(--status-dnd)',
          offline: 'var(--status-offline)',
          live:    'var(--status-live)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          hover:   'var(--danger-hover)',
          subtle:  'var(--danger-subtle)',
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
        'xs':  ['11px', { lineHeight: '1.4' }],
        'sm':  ['13px', { lineHeight: '1.5' }],
        'base':['15px', { lineHeight: '1.375' }],
        'md':  ['16px', { lineHeight: '1.4' }],
        'lg':  ['18px', { lineHeight: '1.4' }],
        'xl':  ['22px', { lineHeight: '1.3' }],
        '2xl': ['28px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        'sm':   'var(--radius-sm)',
        'base': 'var(--radius-base)',
        'lg':   'var(--radius-lg)',
        'xl':   'var(--radius-xl)',
        '2xl':  'var(--radius-2xl)',
        'pill': 'var(--radius-pill)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      spacing: {
        '13': '52px',
        '15': '60px',
        '18': '72px',
      },
      zIndex: {
        'dropdown': 'var(--z-dropdown)',
        'modal':    'var(--z-modal)',
        'overlay':  'var(--z-overlay)',
        'toast':    'var(--z-toast)',
      },
    },
  },
};
```

---

## 3. Framer Motion Spring Presets

```js
// lib/ui/springs.js
// Drei Spring-Presets für konsistente Animationen.
// Kein willkürliches stiffness/damping mehr.

export const springs = {
  // Snappy: schnelle UI-Feedback-Animationen (hover states, button clicks)
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },

  // Default: Standard für die meisten Elemente (Modals, Drawers, Panels)
  default: {
    type: 'spring',
    stiffness: 350,
    damping: 28,
    mass: 1,
  },

  // Gentle: für große Elemente und Layout-Transitionen (Sidebar-Collapse)
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 26,
    mass: 1.2,
  },
};

// Fade-Transition (kein Spring, für Opacity-Fades)
export const fade = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1],
};
```

---

## 4. Animation Variants (Framer Motion)

```js
// lib/ui/variants.js
// Alle Framer Motion variants an einem Ort.
// Keine inline-definierten Animationsobjekte in Komponenten.

import { springs, fade } from './springs';

// Modals & Dialoge: spring-in von unten-mittig
export const modal = {
  hidden:  { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: springs.default },
  exit:    { opacity: 0, scale: 0.95, y: 4, transition: { ...fade, duration: 0.12 } },
};

// Backdrop: plain fade
export const backdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: fade },
  exit:    { opacity: 0, transition: { ...fade, duration: 0.12 } },
};

// Dropdown / ContextMenu: scale von oben
export const dropdown = {
  hidden:  { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1,    y:  0, transition: springs.snappy },
  exit:    { opacity: 0, scale: 0.95, y: -4, transition: { ...fade, duration: 0.1 } },
};

// Toast: von unten einschieben
export const toast = {
  hidden:  { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y:  0, scale: 1,   transition: springs.snappy },
  exit:    { opacity: 0, y:  8, scale: 0.96, transition: { ...fade, duration: 0.15 } },
};

// Neue Nachricht (Chat)
export const message = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y:  0, transition: springs.snappy },
};

// Sidebar collapse/expand
export const sidebarPanel = (width) => ({
  open:   { width, opacity: 1, transition: springs.gentle },
  closed: { width: 0, opacity: 0, transition: springs.gentle },
});

// Stagger für Listen (Channel-Liste, Member-Liste)
export const listContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.03 } },
};

export const listItem = {
  hidden:  { opacity: 0, x: -6 },
  visible: { opacity: 1, x:  0, transition: springs.snappy },
};

// Server-Icon
export const serverIcon = {
  idle:   { borderRadius: '30%', scale: 1 },
  hover:  { borderRadius: '50%', scale: 1.1, transition: springs.snappy },
  active: { borderRadius: '50%', scale: 1,   transition: springs.snappy },
};

// Server-Pill-Indikator (linker Balken)
export const serverPill = {
  idle:   { height: 0,  scaleY: 0 },
  hover:  { height: 18, scaleY: 1, transition: springs.snappy },
  active: { height: 32, scaleY: 1, transition: springs.snappy },
};

// Action-Buttons beim Message-Hover
export const messageActions = {
  hidden:  { opacity: 0, scale: 0.92, y: -2 },
  visible: { opacity: 1, scale: 1,    y:  0, transition: springs.snappy },
  exit:    { opacity: 0, scale: 0.92, y: -2, transition: { ...fade, duration: 0.08 } },
};

// User Popover
export const popover = {
  hidden:  { opacity: 0, scale: 0.92, y: 4 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: springs.default },
  exit:    { opacity: 0, scale: 0.9,  y: 4, transition: { ...fade, duration: 0.12 } },
};

// Send-Button im Input
export const sendButton = {
  hidden:  { opacity: 0, x: 6 },
  visible: { opacity: 1, x: 0, transition: springs.snappy },
  exit:    { opacity: 0, x: 6, transition: { ...fade, duration: 0.1 } },
};

// Kategorie Collapse/Expand (Pfeil)
export const collapseArrow = (collapsed) => ({
  rotate: collapsed ? -90 : 0,
  transition: { ...fade, duration: 0.2 },
});

// Reply Preview Strip
export const replyPreview = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: springs.snappy },
  exit:    { height: 0, opacity: 0,      transition: { duration: 0.15 } },
};
```

---

## 5. Component Specs

Für jede Komponente: exakte Klassen, States, und Framer Motion Konfiguration.

---

### 5.1 Button

**Vier Varianten. Kein anderes Styling außerhalb dieser Definitionen.**

```jsx
// components/ui/Button.jsx
"use client";
import { motion } from "motion/react";
import { springs } from "@/lib/ui/springs";

// Basis: alle Buttons
const base = `
  inline-flex items-center justify-center gap-2
  font-sans font-medium text-sm
  rounded-base
  transition-colors
  select-none cursor-pointer
  disabled:opacity-40 disabled:cursor-not-allowed
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
`;

// Varianten
const variants = {
  // Primär: erhöhte Oberfläche, primärer Text — kein Farb-Akzent
  primary: `bg-surface-raised hover:bg-surface-overlay text-text-primary border border-white/10`,

  // Ghost: kein Hintergrund, hover zeigt Oberfläche
  ghost: `bg-transparent hover:bg-white/[0.04] text-text-secondary hover:text-text-primary`,

  // Danger: nur für destruktive Aktionen
  danger: `bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20`,

  // Icon: quadratisch, für Icon-only Buttons
  icon: `bg-transparent hover:bg-white/[0.04] text-text-muted hover:text-text-primary`,
};

// Größen
const sizes = {
  sm: 'h-7  px-3 text-xs',
  md: 'h-9  px-4 text-sm',
  lg: 'h-10 px-5 text-base',
  icon: 'h-8 w-8',
};
```

**:active State** (Framer Motion `whileTap`):
```js
whileTap={{ scale: 0.97 }}
transition={springs.snappy}
```

---

### 5.2 Input / Textarea

```jsx
// Basis-Klassen (beide gleich)
const inputBase = `
  w-full
  bg-surface-raised
  text-text-primary text-base
  placeholder:text-text-muted
  rounded-base
  px-3 py-2
  border border-transparent
  outline-none
  transition-[border-color,box-shadow] duration-150
  focus:border-white/20 focus:shadow-[0_0_0_2px_rgba(255,255,255,0.06)]
  disabled:opacity-40 disabled:cursor-not-allowed
`;

// Message-Input (größer, abgerundeter)
const messageInputBase = `
  w-full
  bg-surface-raised
  text-text-primary text-base
  placeholder:text-text-muted
  rounded-xl
  px-4 py-3
  border border-transparent
  outline-none
  resize-none
  transition-[border-color,box-shadow] duration-150
  focus:border-white/20 focus:shadow-[0_0_0_2px_rgba(255,255,255,0.06)]
`;
```

**Label**: immer über dem Input, nie als Placeholder.
```jsx
<label className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5 block">
  Anzeigename
</label>
<input className={inputBase} />
```

**Error State**:
```jsx
// border-danger/50 + shadow-[0_0_0_2px_rgba(239,68,68,0.12)]
// Error-Text: text-danger text-xs mt-1
```

---

### 5.3 Avatar

```jsx
// components/user/UserAvatar.jsx
// Größen
const sizes = {
  xs: 'w-5 h-5',     // 20px — Inline in Nachrichten (kompakt)
  sm: 'w-8 h-8',     // 32px — Channel-Sidebar Member-Liste
  md: 'w-9 h-9',     // 36px — Nachrichten
  lg: 'w-12 h-12',   // 48px — Profil-Popover
  xl: 'w-20 h-20',   // 80px — Settings Profil
};

// Immer: rounded-pill (Kreis), object-cover
// Kein Border. Status-Dot ist separate Komponente.

// Fallback wenn kein Bild: Initialen auf surface-overlay
const AvatarFallback = ({ name, size }) => (
  <div className={`${sizes[size]} rounded-pill bg-surface-overlay flex items-center justify-center`}>
    <span className="text-xs font-semibold text-text-secondary">
      {name?.[0]?.toUpperCase()}
    </span>
  </div>
);
```

---

### 5.4 StatusDot

```jsx
// components/user/StatusDot.jsx
// Immer als Wrapper um Avatar — absolut positioniert rechts unten

const colors = {
  online:  'bg-status-online',
  idle:    'bg-status-idle',
  dnd:     'bg-status-dnd',
  offline: 'bg-status-offline',
};

const sizes = {
  sm: 'w-2.5 h-2.5 border-[1.5px]',  // 10px — neben Nachrichten-Avatar
  md: 'w-3   h-3   border-2',          // 12px — User-Panel, Member-Liste
};

// border-color: immer die darunterliegende Surface-Farbe
// So entsteht "Ausschnitt" ohne echten Clip-Path.
```

---

### 5.5 ChannelItem

```jsx
// components/channel/ChannelItem.jsx
// Exakte Spezifikation des interaktiven States

// Container
const container = `
  flex items-center gap-1.5
  h-[34px] mx-2 px-2
  rounded-base
  cursor-pointer select-none
  group
`;

// States via Framer Motion (nicht Tailwind hover:)
const itemVariants = {
  idle:   { backgroundColor: 'transparent' },
  hover:  { backgroundColor: 'rgba(255,255,255,0.04)' },
  active: { backgroundColor: 'rgba(255,255,255,0.10)' },
};

// Icon: Phosphor, 16px, weight="regular"
// Farbe idle: text-ghost | hover: text-muted | active: text-primary

// Text
// Farbe idle: text-muted | hover: text-secondary | active: text-primary
// Weight idle: normal | active: medium
```

**Left Pill Indicator (aktiver Channel):**
```jsx
// Absolut positioniert links, außerhalb des Container-Paddings
<motion.div
  animate={{ height: isActive ? 20 : isHovered ? 10 : 0, opacity: isActive ? 1 : 0 }}
  transition={springs.snappy}
  className="absolute left-0 w-0.5 bg-white rounded-r-pill"
/>
```

---

### 5.6 Divider

```jsx
// components/ui/Divider.jsx
// Horizontal
<div className="h-px bg-white/[0.06] my-2" />

// Vertikal
<div className="w-px bg-white/[0.06] self-stretch mx-2" />

// Mit Label (z.B. in Kategorie-Listern oder Settings)
<div className="flex items-center gap-3">
  <div className="flex-1 h-px bg-white/[0.06]" />
  <span className="text-xs text-text-ghost uppercase tracking-widest">Optionen</span>
  <div className="flex-1 h-px bg-white/[0.06]" />
</div>
```

---

### 5.7 Badge

```jsx
// Größen und Varianten
const badge = `
  inline-flex items-center
  text-2xs font-semibold
  rounded-sm px-1.5 py-0.5
  leading-none
`;

const badgeVariants = {
  // Neutral: Anzahl ungelesener Nachrichten, Mitgliederzahl
  default: 'bg-surface-overlay text-text-secondary',

  // Live-Badge (einzige Farbe — semantisch: kritische Info)
  live:    'bg-status-live text-white',

  // Danger: z.B. Anzahl gebannter Nutzer
  danger:  'bg-danger/15 text-danger',
};
```

---

### 5.8 Tooltip

```jsx
// components/ui/Tooltip.jsx
// Framer Motion variants: dropdown (Section 4)
// Position: rechts vom Server-Icon, oben/unten bei Channel-Elementen

const tooltipStyle = `
  bg-surface-overlay
  text-text-primary text-sm font-medium
  px-3 py-1.5
  rounded-base
  shadow-lg
  pointer-events-none
  whitespace-nowrap
  z-dropdown
`;
```

---

### 5.9 ContextMenu

```jsx
// components/ui/ContextMenu.jsx
// Rechtsklick-Menü, auch für "Mehr"-Dropdowns

const menuStyle = `
  min-w-[180px]
  bg-surface-overlay
  border border-white/[0.06]
  rounded-lg
  shadow-xl
  p-1
  z-dropdown
`;

// MenuItem
const menuItemBase = `
  flex items-center gap-2.5
  w-full px-2.5 py-1.5
  rounded-base
  text-sm text-text-secondary
  cursor-pointer select-none
  transition-colors
`;

const menuItemVariants = {
  default: 'hover:bg-white/[0.06] hover:text-text-primary',
  danger:  'text-danger hover:bg-danger hover:text-white',
};

// Divider im Menü
const menuDivider = 'h-px bg-white/[0.06] my-1 -mx-1';
```

---

### 5.10 Modal / Dialog

```jsx
// components/modals/Modal.jsx
// Basis für alle Modals/Dialogs

// Backdrop
const backdropStyle = `fixed inset-0 bg-black/70 backdrop-blur-sm z-modal`;

// Panel (schmal, zentriert)
const panelStyle = `
  relative
  bg-surface-raised
  border border-white/[0.06]
  rounded-lg
  shadow-xl
  w-full max-w-md
  mx-4
`;

// Panel (breit — Settings)
const panelWide = `
  relative
  bg-surface-base
  w-full max-w-4xl
  min-h-[80vh]
  mx-4
  rounded-lg
  shadow-xl
  overflow-hidden
`;

// Framer Motion: modal variant aus Section 4
// AnimatePresence immer um Modal-Content wrappen
```

---

### 5.11 Toast

```jsx
// components/ui/Toast.jsx
// Position: fixed, bottom-center

const toastWrapper = `fixed bottom-6 left-1/2 -translate-x-1/2 z-toast flex flex-col gap-2 items-center`;

const toastBase = `
  flex items-center gap-3
  px-4 py-3
  bg-surface-overlay
  border border-white/[0.06]
  rounded-lg
  shadow-lg
  text-sm text-text-primary
  min-w-[240px] max-w-sm
`;

// Varianten — Info: neutral
const toastVariants = {
  info:    '',  // kein zusätzliches Styling — surface-overlay ist Basis
  success: 'border-status-online/20',  // nur Border-Ton, kein farbiger BG
  error:   'border-danger/30 text-danger',
};

// Icons: Phosphor
// info → InformationCircle (zinc-400)
// success → CheckCircle (status-online)
// error → XCircle (danger)
```

---

### 5.12 Skeleton / Loading State

```jsx
// Animierter Shimmer — kein Spinner

const Skeleton = ({ className }) => (
  <div
    className={`bg-surface-raised rounded-base animate-pulse ${className}`}
  />
);

// Einsatz:
// Nachrichten-Skeleton: Avatar-Kreis + 3 Zeilen
// Channel-Liste-Skeleton: 6 Zeilen à 34px
// Member-Skeleton: Avatar + Name-Linie
```

---

### 5.13 ScrollArea

Nativer Browser-Scrollbar, aber unsichtbar gestylt:

```css
/* globals.css */
.scrollbar-hidden {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
```

Alle Scroll-Container in der App bekommen `scrollbar-hidden`.

---

## 6. Typography Patterns

**Diese Kombinationen sind festgelegt. Kein Freestyle.**

| Kontext | Size | Weight | Color | Sonstiges |
|---------|------|--------|-------|-----------|
| Server-Name (Header) | `text-md` | `font-semibold` | `text-primary` | |
| Kategorie-Label | `text-xs` | `font-bold` | `text-muted` | `uppercase tracking-widest` |
| Channel-Name (inaktiv) | `text-sm` | `font-medium` | `text-muted` | |
| Channel-Name (aktiv) | `text-sm` | `font-medium` | `text-primary` | |
| Nachrichten-Autor | `text-base` | `font-semibold` | `text-primary` | |
| Nachrichten-Body | `text-base` | `font-normal` | `text-secondary` | `leading-snug` |
| Timestamp | `text-xs` | `font-normal` | `text-ghost` | `font-mono` |
| Input-Label | `text-xs` | `font-medium` | `text-secondary` | `uppercase tracking-wide` |
| Input-Text | `text-base` | `font-normal` | `text-primary` | |
| Input-Placeholder | `text-base` | `font-normal` | `text-muted` | |
| Button (md) | `text-sm` | `font-medium` | — | — |
| Modal-Titel | `text-lg` | `font-semibold` | `text-primary` | |
| Settings-Section | `text-xs` | `font-semibold` | `text-muted` | `uppercase tracking-widest` |
| Empty-State-Headline | `text-xl` | `font-semibold` | `text-secondary` | |
| Empty-State-Sub | `text-sm` | `font-normal` | `text-muted` | |

---

## 7. Spacing Patterns

**Alle wiederkehrenden Abstände mit Namen.**

| Kontext | Spacing |
|---------|---------|
| Server-Icon Abstand (vertikal) | `gap-1` (4px) |
| Channel-Item Höhe | `h-[34px]` |
| Channel-Item Horizontal-Padding | `px-2` |
| Channel-Sidebar Outer-Margin | `mx-2` |
| Message-Group Abstand (neue Gruppe) | `mt-4` |
| Message in Gruppe | `mt-0.5` |
| Message-Input Bottom-Padding | `pb-6` |
| Section Gap (innerhalb Panel) | `space-y-0.5` |
| Kategorie-Gap | `mt-6 mb-1` |
| Modal-Padding | `p-6` |
| Settings Content-Padding | `px-10 py-8` |

---

## 8. Icon System

**@phosphor-icons/react — eine Familie, drei Weights.**

| Weight | Größe | Kontext |
|--------|-------|---------|
| `regular` | 16px | Channel-Liste Icons, Inline in Text |
| `regular` | 20px | Action-Buttons, Toolbar, User-Panel |
| `light`   | 24px | Leere States, Modals (dekorative Icons) |

**Niemals:** andere Bibliotheken, hand-gezeichnete SVGs.

```jsx
import { Hash, SpeakerHigh, Microphone, Gear } from "@phosphor-icons/react";

// Immer mit expliziter size-Prop (nie per CSS-Klassen skaliert):
<Hash size={16} weight="regular" />
<Gear size={20} weight="regular" />
```

---

## 9. Interaction Principles

**Diese Regeln gelten für jede interaktive Komponente.**

### Hover
- Hintergrund: `--state-hover` (rgba weiß/4%)
- Text/Icon: eine Stufe heller in der Text-Skala
- Transition: `duration-fast` (150ms), `ease-out-expo`
- **Niemals:** Framer Motion für Hover-States die nur Farbe ändern → Tailwind `hover:` ist ausreichend

### Active / Selected
- Hintergrund: `--state-active` (rgba weiß/10%)
- Text/Icon: `--text-primary`
- Pill-Indikator (Channel-Liste): weißer 2px-Balken links, Framer Motion height-Animation

### Focus (Tastatur-Navigation)
- `ring-2 ring-white/20` (via Tailwind `focus-visible:`)
- Niemals `outline: none` ohne visuellen Ersatz

### Disabled
- `opacity-40`
- `cursor-not-allowed`
- Keine Hover-Effects

### :active (gedrückt)
- `scale: 0.97` via Framer Motion `whileTap`
- Transition: `springs.snappy`

### Transitions
- Einfache Farb-/Opacity-Änderungen: Tailwind `transition-colors duration-[150ms]`
- Geometrie-Änderungen (Größe, Position): Framer Motion springs
- Entry/Exit von Elementen: Framer Motion `AnimatePresence`

---

## 10. Layout Rules

**Das Drei-Panel-System.**

```
┌──────────────────┬─────────────────────┬─────────────────────────────────┐
│ var(--sidebar-   │ var(--sidebar-       │ flex-1                          │
│ server) = 64px   │ channel) = 240px     │ min-width: 0                    │
│                  │                      │                                 │
│ bg-surface-      │ bg-surface-deep      │ bg-surface-base                 │
│ deepest          │                      │                                 │
└──────────────────┴─────────────────────┴─────────────────────────────────┘
```

- **Server-Sidebar**: immer sichtbar (ab md breakpoint)
- **Channel-Sidebar**: Framer Motion animate width (240px ↔ 0)
- **Content**: `min-w-0` damit Text-Overflow korrekt funktioniert
- **Member-Sidebar** (optional rechts): identisches animate width

**Mobile Breakpoints:**
- `< 768px (md)`: Server-Sidebar → Bottom-Nav, Channel-Sidebar → Drawer
- `768-1023px`: Zwei-Panel (Server + Channel), kein Member-Sidebar
- `>= 1024px (lg)`: Drei-Panel

---

## 11. Verwendungs-Checkliste (Pre-Commit)

Vor jedem Commit prüfen:

- [ ] Kein hardcodierter Hex-Wert — ausschließlich CSS-Tokens oder Tailwind-Token-Klassen
- [ ] Kein Farbwert außer Status-Farben und Danger (semantisch begründet)
- [ ] Icon ausschließlich aus `@phosphor-icons/react`
- [ ] Framer Motion Variants aus `lib/ui/variants.js` — keine inline-Animation-Objekte
- [ ] Spring-Config aus `lib/ui/springs.js` — kein willkürliches stiffness/damping
- [ ] `AnimatePresence` um alle conditional-rendered animierten Elemente
- [ ] Alle Scroll-Container: `scrollbar-hidden` Klasse
- [ ] `focus-visible:ring-2 focus-visible:ring-white/20` auf jedem interaktiven Element
- [ ] Keine `z-index` Werte außer den Token-Stufen
- [ ] Border-Radius aus der festgelegten Skala — keine `rounded-3xl` o.ä. Ausreißer
