# Streambite — Design Spec

> Design Read: Discord-artiger Community- und Echtzeit-Kommunikations-App für ein design-bewusstes Publikum.
> Dunkles, rein neutrales UI — kein Akzent, keine Farbe. Tiefe durch Helligkeit, nicht durch Chroma.
> DESIGN_VARIANCE: 7 / MOTION_INTENSITY: 7 / VISUAL_DENSITY: 7

---

## Visuelle Philosophie

Streambite soll sich anfühlen wie Discord, das von einem erfahrenen Product-Designer überarbeitet wurde.
Vertraut genug, damit Nutzer sofort wissen, was sie tun sollen — aber mit einer Qualität,
die das App als eigenständiges Produkt erkennbar macht. Keine Template-Tristesse,
keine Copy-Paste Discord-Klone. Die App hat eine eigene visuelle Stimme.

Das wichtigste Prinzip: **Ruhe durch Kontrolle**. Die App ist informationsdicht (wie Discord),
aber jedes Element hat seinen Platz. Abstände sind präzise. Typografie ist hierarchisch.

**Kein Akzent. Kein Farb-Highlight.** Aktive States, Hover, Fokus — alles über Helligkeit.
Weiß ist das stärkste Signal. Tiefe entsteht durch Kontrast zwischen zinc-Stufen, nicht durch Farbe.
Das Ergebnis: fokussiert, professionell, zeitlos. Denk Raycast, Linear, Vercel-Dashboard.

---

## Farbpalette

### Oberflächen (von dunkel nach hell)
- **Server-Sidebar-BG**: `#09090b` (zinc-950) — das Tiefste, fast Schwarz
- **Channel-Sidebar-BG**: `#111113` (zinc-950 Variante) — leicht heller
- **Main Content BG**: `#18181b` (zinc-900) — Hauptbereich
- **Elevated Surface**: `#27272a` (zinc-800) — Karten, Modals, Hover-States
- **Overlay Surface**: `#3f3f46` (zinc-700) — Tooltips, Dropdowns

### Text
- **Primary**: `#f4f4f5` (zinc-100) — Haupttext, Nutzernamen
- **Secondary**: `#a1a1aa` (zinc-400) — Timestamps, Metainfos
- **Muted**: `#71717a` (zinc-500) — Deaktivierte States, Placeholder
- **Links / Mentions**: `#d4d4d8` (zinc-300) unterstrichen — kein Blau, kein Indigo

### Kein Akzent
Es gibt keine Akzentfarbe. Kein Indigo, kein Blau, kein Lila.
Aktive States kommunizieren sich durch **Helligkeit und Gewicht**, nicht durch Chroma.

### Interaktive States (neutral)
- **Hover BG**: `rgba(255,255,255,0.04)` — kaum sichtbares Highlight
- **Active BG**: `rgba(255,255,255,0.10)` — ausgewählter State
- **Active Text**: `#f4f4f5` (zinc-100) — wird weiß/hell wenn aktiv
- **Inactive Text**: `#71717a` (zinc-500) — gedimmt wenn inaktiv
- **Focus Ring**: `rgba(255,255,255,0.20)` — weißer Fokus-Ring auf Inputs

### Statusfarben (einzige Ausnahme — semantisch, nicht dekorativ)
Statusfarben sind funktional (Bedeutung für den Nutzer), keine Design-Entscheidung.
- **Online**: `#22c55e` (green-500) — Online-Dot (semantisch: verfügbar)
- **Idle**: `#f59e0b` (amber-500) — Abwesend (semantisch: nicht aktiv)
- **DND**: `#ef4444` (red-500) — Nicht stören (semantisch: bitte nicht)
- **Offline**: `#3f3f46` (zinc-700) — Offline (semantisch: weg)
- **Live/Streaming**: `#f43f5e` (rose-500) — Live (semantisch: kritische Info)

### Danger (einzige weitere Ausnahme — semantisch)
- **Danger Text/Button**: `#ef4444` (red-500) — Löschen, Kick, Ban, Konto löschen
  (Rot = destruktiv — hat semantische Bedeutung, keine dekorative)

---

## Typografie

**Font-Familie: Geist** (von Vercel) — modern, klar, für Interfaces gemacht.
Zahlen, Timestamps, Channel-IDs: **Geist Mono**.

Kein Inter. Kein System-Font-Stack als Fallback-Ausrede.
Geist ist über `next/font` eingebunden, kein CDN-Link.

### Hierarchie
```
Server-Name (Header):    16px / font-semibold / zinc-100
Kategorie-Label:         11px / font-bold / uppercase / tracking-widest / zinc-500
Channel-Name:            14px / font-medium / zinc-300 (inactive) / zinc-100 (active)
Message-Autor:           15px / font-semibold / zinc-100
Message-Body:            15px / font-normal / zinc-200 / line-height: 1.375
Timestamp:               12px / font-normal / Geist Mono / zinc-500
Input-Text:              15px / font-normal / zinc-100
```

---

## Layout-System

### Das Drei-Panel-Layout (Desktop)

```
┌──────┬────────────────────┬────────────────────────────────────────┐
│      │                    │                                         │
│  64  │       240px        │              flex-1                     │
│  px  │  Channel Sidebar   │          Content Area                   │
│      │                    │                                         │
│Server│  Server-Name       │  ┌─────────────────────────────────┐   │
│Icons │  ──────────────    │  │  Channel-Header                 │   │
│      │  # general         │  │  ─────────────────────────────  │   │
│  +   │  # entwicklung     │  │                                 │   │
│      │  # design          │  │  Message-Area (scrollable)      │   │
│      │  ──────────────    │  │                                 │   │
│      │  🔊 Allgemein      │  │                                 │   │
│      │     Avatar Avatar  │  │                                 │   │
│      │  ──────────────    │  │                                 │   │
│      │  [User Panel]      │  │  ─────────────────────────────  │   │
│      │                    │  │  Message-Input                  │   │
│      │                    │  └─────────────────────────────────┘   │
└──────┴────────────────────┴────────────────────────────────────────┘
```

### Optionaler Member-Sidebar (rechts, 240px)
Klappt ein/aus. Zeigt Online-Mitglieder mit Status-Dots und Rollen.

### Mobile Layout
- Server-Sidebar: Bottom Navigation Bar (icons)
- Channel-Sidebar: Drawer (swipe von links)
- Kein gleichzeitiges Drei-Panel — immer nur eine Ebene sichtbar

---

## Server-Icon Design

Server-Icons sind **quadratische Bilder mit stark abgerundeten Ecken** (radius: 30% → 50% im Hover).
Beim Hover morpht das Icon zu einem Kreis — exakt wie Discord, aber smoother durch Framer Motion spring physics.

Die Indikatoren:
- **Aktiver Server**: weißer Pill-Balken links (2px × 20px, volle Höhe wenn aktiv)
- **Benachrichtigung**: kleiner roter Dot (8px) rechts unten
- **Hover**: Pill wächst auf 8px Höhe

---

## Channel-Liste

Jeder Kanal-Eintrag ist **40px hoch**, `px-2`, mit `mx-2` horizontalem Margin.
Borderradius: `8px`. Das Icon (# für Text, 🔊 für Voice) ist 16px, zinc-500.

Hover-State:
- Hintergrund: `rgba(255,255,255,0.04)` — Framer Motion `whileHover`
- Icon + Text: wechseln zu zinc-200
- Keine plötzlichen Sprünge — alles `duration: 150ms`

Aktiver State:
- Hintergrund: `rgba(255,255,255,0.10)` — heller als Hover, rein neutral
- Left Indicator: 2px-Balken in `#ffffff` (weiß) — kein Farb-Akzent
- Icon + Text: zinc-100 (weiß) — Helligkeit signalisiert Selektion

Kategorie-Header:
- `UPPERCASE tracking-widest text-[11px] font-bold zinc-500`
- Kleiner Pfeil (10px) dreht sich beim Collapse — Framer Motion `animate={{ rotate }}`
- Kein Hover-State auf dem Kategorie-Header selbst (zu viel Noise)

---

## Message-Bereich

### Gruppierung (wie Discord)
Nachrichten von demselben Autor innerhalb von 7 Minuten werden gruppiert:
- Erste Nachricht: Avatar (36px, rund) + **Username** (fett) + Timestamp
- Folgenachrichten: kein Avatar (leerer 36px Platz), kein Username
  - Beim Hover: kleiner Timestamp erscheint links (Framer Motion opacity-Fade)

### Message-Hover-State
Wenn der Nutzer über eine Nachricht hovert:
- Hintergrund: `rgba(255,255,255,0.02)` — kaum sichtbar, gibt Tiefe
- Action-Buttons erscheinen rechts oben (Framer Motion opacity 0→1):
  - Emoji-Reaktion hinzufügen
  - Antworten
  - Mehr (three-dot menu)

### Inline-Code
`monospace`, `bg-zinc-800`, `px-1.5 py-0.5`, `rounded-sm`, `text-zinc-300`

### Links
`text-zinc-300 underline underline-offset-2 hover:text-zinc-100`

---

## Micro-Animationen (Framer Motion)

**Prinzip**: Jede Animation hat eine Funktion. Keine Animation um der Animation willen.

### Server-Icon Hover
```js
scale: 1 → 1.1
borderRadius: "30%" → "50%"
transition: type: "spring", stiffness: 400, damping: 25
```
Kommuniziert: "Das ist klickbar und interaktiv."

### Channel-Hover
```js
backgroundColor: transparent → rgba(255,255,255,0.04)
transition: duration: 0.15
```
Kommuniziert: "Das ist ein Ziel."

### Modal/Dialog-Öffnen
```js
initial: { opacity: 0, scale: 0.95, y: 8 }
animate: { opacity: 1, scale: 1, y: 0 }
transition: type: "spring", stiffness: 350, damping: 28
```
Backdrop: `blur(8px)` auf dem Hintergrund — Framer Motion `AnimatePresence`

### Nachricht senden (neue Message erscheint)
```js
initial: { opacity: 0, y: 12 }
animate: { opacity: 1, y: 0 }
transition: type: "spring", stiffness: 300, damping: 24
```

### Seitenleiste Einklappen
```js
width: 240 → 0
transition: type: "spring", stiffness: 300, damping: 30
```
`overflow: hidden` während der Animation.

### Status-Dot (Online-Pulse)
Kein konstantes Pulsen (zu ablenkend). Nur bei State-Wechsel eine kurze Transition.

### Kategorien Collapse
```js
height: "auto" → 0
transition: duration: 0.2, ease: "easeInOut"
overflow: hidden
```

### Reaktion hinzufügen
Emoji "bounced" kurz (scale 1 → 1.3 → 1) wenn die Reaktion zählt hochgeht.

### Voice-Status-Indicator (sprechende Person)
Grüner Ring pulsiert kurz (scale 1 → 1.05 → 1) wenn Nutzer spricht.

---

## Eingabefeld (Message-Input)

Das Eingabefeld ist die wichtigste Interaktion in der App. Es verdient Sorgfalt.

Design:
- `bg-zinc-800`, `rounded-xl`, `px-4 py-3`
- `border: 1px solid transparent`
- **Focus**: `border-color: rgba(255,255,255,0.20)` + `box-shadow: 0 0 0 2px rgba(255,255,255,0.06)`
- Framer Motion Transition auf dem Border: `duration: 0.15`

Links im Input:
- Datei-Upload-Button (Paperclip-Icon)
- Emoji-Picker-Button (Smiley)

Rechts im Input:
- Wenn Text vorhanden: Send-Button (Pfeil) erscheint mit `opacity: 0 → 1` + leichtem `x: 4 → 0`

Placeholder-Text:
- `"Schreib etwas in #channel-name"`
- `zinc-500` Farbe

---

## Icons

**Icon-Bibliothek: @phosphor-icons/react** — konsequent, eine Familie.
- `strokeWidth` einheitlich: Icon-Größe abhängig:
  - 16px Icons (Inline, Channel-Liste): `weight="regular"`
  - 20px Icons (Toolbar, Actions): `weight="regular"`
  - 24px Icons (Modals, leere States): `weight="light"`

Kein Lucide. Kein Hand-SVG.

---

## Modals & Overlays

Modals haben zwei Schichten:
1. **Backdrop**: `fixed inset-0 bg-black/70 backdrop-blur-sm` — Framer Motion `opacity: 0 → 1`
2. **Modal-Panel**: `bg-zinc-800 rounded-xl` — spring-in von unten oder Mitte

Breit (Settings, Server-Einstellungen): Zwei-Spalten-Layout (Nav links, Content rechts)
Schmal (Confirm-Dialog, Quick-Form): Zentriert, max-w-md

---

## Leere States

Leere Kanäle, keine Suchergebnisse, kein Server beigetreten:
- Phosphor-Icon (groß, 48px, `weight="thin"`)
- Headline: 16px / zinc-300
- Sub-Text: 14px / zinc-500
- Optionaler CTA-Button (`bg-zinc-700 hover:bg-zinc-600` — kein Farb-Akzent)

Keine generischen "No data found"-Texte. Jede Situation hat eine eigene kurze Erklärung.

---

## Settings-Design

Settings öffnen sich als **Vollbild-Modal** (wie Discord) mit:
- Links: Navigations-Sidebar (200px, bg-zinc-900)
  - Sektionen: Nutzerkonto, Profil, Datenschutz, Erscheinungsbild, Benachrichtigungen, Sprache & Video, Tastenbelegung
  - Trennlinie zwischen Sektionen
  - "Abmelden" rot, ganz unten
- Rechts: Content-Bereich (flex-1, bg-zinc-800/50)
  - Header mit Seiten-Titel
  - Scrollbarer Inhalt
  - Änderungen zeigen einen "Speichern"-Toast unten (erscheint via Framer Motion)

---

## Tone & Voice (Copy)

Deutsch-first (da das Projekt auf einem deutschen System entwickelt wird).
Aber UI-Labels auf Englisch (internationaler Standard).

Ton: klar, direkt, kein Marketing-Slang. Discord-typische Freundlichkeit ohne Kitsch.
- "What's new, Kadir?" im leeren Channel-State
- "No servers yet — create one or join with an invite code." im leeren Server-State

---

## Breakpoints & Responsive

| Breakpoint | Verhalten |
|-----------|-----------|
| < 768px (md) | Server-Bar als Bottom-Nav, Channel-Sidebar als Drawer |
| 768-1024px | Zwei-Panel (Server + Channel, kein Member-Sidebar) |
| > 1024px | Drei-Panel voll |

Server-Sidebar (64px) ist immer sichtbar ab md. Darunter: Bottom-Nav.
