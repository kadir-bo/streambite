# Streambite — Master Plan

> Discord-artiger Community-Chat mit Text, Voice und Streaming.
> Stack: Next.js · Firebase · LiveKit · Tailwind v4 · Framer Motion
> Sprache: JavaScript (.js / .jsx) — kein TypeScript

---

## Dokumente

| Datei | Inhalt |
|-------|--------|
| [DESIGN.md](DESIGN.md) | Visuelles Design in natürlicher Sprache (Philosophie, Farbe, Layout) |
| [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | **Implementierbare Spezifikation**: Tokens, Komponenten-APIs, Springs, Variants |
| [impl/tokens.css](impl/tokens.css) | Fertige CSS → kopieren nach `styles/tokens.css` in Phase 1 |
| [impl/springs.js](impl/springs.js) | Framer Motion Presets → kopieren nach `lib/ui/springs.js` in Phase 1 |
| [impl/variants.js](impl/variants.js) | Animation Variants → kopieren nach `lib/ui/variants.js` in Phase 1 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Tech-Stack, Ordnerstruktur, Firestore-Schema, Security Rules |
| [phases/01-setup-auth.md](phases/01-setup-auth.md) | Phase 1: Projekt-Setup, Auth, App-Shell |
| [phases/02-servers-channels.md](phases/02-servers-channels.md) | Phase 2: Server erstellen, Channels, Navigation |
| [phases/03-text-chat.md](phases/03-text-chat.md) | Phase 3: Echtzeit-Chat, Reaktionen, Uploads |
| [phases/04-voice-chat.md](phases/04-voice-chat.md) | Phase 4: LiveKit Voice-Chat |
| [phases/05-streaming.md](phases/05-streaming.md) | Phase 5: Screen Share + Stream-Viewer |
| [phases/06-settings-profile.md](phases/06-settings-profile.md) | Phase 6: Settings, Profil, Finishing |

---

## Phasen-Übersicht

```
Phase 1 ──────────────────────────────────────── FOUNDATION
  ├── Next.js 15 App Router (kein TS)
  ├── Tailwind v4 + Design Tokens (Geist Font)
  ├── Firebase: Auth + Firestore + Storage
  ├── Auth-Flows: Sign-In, Sign-Up, Forgot Password
  ├── App-Shell: Drei-Panel-Layout (leer)
  └── User-Panel, Route Protection, Providers

Phase 2 ──────────────────────────────────────── SERVER & CHANNELS
  ├── Server erstellen (Name, Icon, Default-Channels)
  ├── Server beitreten (Invite-Code-Flow)
  ├── Channel-Liste (Text, Voice, Announcement)
  ├── Kategorie-System (klappbar)
  ├── Server-Settings Modal (Name, Icon, Einladungen)
  ├── Member-Sidebar (Online/Offline)
  ├── Server-Icon Hover-Morphing (Framer Motion)
  └── Kontext-Menüs (Rechtsklick)

Phase 3 ──────────────────────────────────────── TEXT CHAT
  ├── Echtzeit-Nachrichten (Firestore onSnapshot)
  ├── Message-Gruppierung (selber Autor, 7-Min-Fenster)
  ├── Message-Hover-Actions (Reagieren, Antworten, Mehr)
  ├── Reply-System (Vorschau + Anker)
  ├── Edit / Delete (Soft-Delete)
  ├── Emoji-Reaktionen (Toggle, Zähler, Tooltip)
  ├── Datei-Uploads (Bilder + Dateien, Firebase Storage)
  ├── Markdown-Rendering (bold, italic, code, Mentions)
  ├── Message-Input (Auto-Resize, Framer Motion Focus)
  └── Unread-Indicators

Phase 4 ──────────────────────────────────────── VOICE CHAT
  ├── LiveKit Setup (Build-Tier, kostenlos)
  ├── Token-Endpoint (API Route)
  ├── Voice Channel beitreten/verlassen
  ├── Mute / Deafen Controls
  ├── Sprechenden-Indikator (grüner Ring)
  ├── Verbundene Nutzer in Channel-Liste
  ├── Voice Controls Bar (unten in Channel-Sidebar)
  ├── Participant Tiles (Grid, skalierend)
  └── Presence-Sync (wer ist wo)

Phase 5 ──────────────────────────────────────── STREAMING
  ├── Screen Share starten/stoppen
  ├── "LIVE"-Badge in Channel-Liste
  ├── Spotlight-Layout (Stream groß, Teilnehmer klein)
  ├── Framer Motion Layout-Animation bei Wechsel
  ├── Viewer-Modus (Zuschauen ohne Mikrofon)
  └── Vollbild-Funktion

Phase 6 ──────────────────────────────────────── SETTINGS & FINISHING
  ├── Settings-Modal (Vollbild, Escape schließt)
  ├── Account-Einstellungen (Avatar, Name, Passwort, Löschen)
  ├── Profil (Banner, Bio, Custom-Status)
  ├── Erscheinungsbild (Schriftgröße, Kompaktmodus)
  ├── Benachrichtigungen (Desktop + Töne)
  ├── Stimme & Video (Gerät-Auswahl)
  ├── User-Popover / Profilkarte
  ├── Status-Selector (Online/Idle/DND/Invisible)
  ├── Toast-System
  ├── Quick-Switcher (Ctrl+K)
  ├── Server-Member-Management (Kick, Rollen)
  └── Mobile Responsive Finalisierung
```

---

## Arbeitsweise (wie Lura)

- Eine Phase abschließen, bevor die nächste beginnt
- Checkpoints am Ende jeder Phase verifizieren
- Framer Motion für alle Micro-Animationen — keine CSS-Transitions für interaktive States
- Keine Seite ohne leeren State, Lade-State, Fehler-State
- Security Rules von Beginn an (nicht nachträglich)
- Alle Firebase-Calls in `lib/firebase/` — nie direkt in Komponenten

---

## Arbeitsregeln

1. **Kein TypeScript** — alle Dateien `.js` oder `.jsx`
2. **Framer Motion** (`motion/react`) für alle Animationen, inkl. Entry-Transitions
3. **@phosphor-icons/react** — eine Icon-Bibliothek, keine Ausnahmen
4. **Geist + Geist Mono** via `next/font` — kein CDN
5. **Tailwind v4** — CSS-Variablen für Design-Tokens
6. **Firebase** — Auth, Firestore, Storage (Blaze-Plan mit Kreditkarte, aber 0€ im Freikontingent)
7. **LiveKit** — Voice + Streaming (Build-Tier, kostenlos)
8. **Vercel** — Hosting (Hobby-Tier, kostenlos)
9. **Keine externen Markdown-Libraries** für MVP — eigene Mini-Implementierung
10. **Soft Delete** für Nachrichten — `deleted: true` Flag, nie wirklich löschen

---

## Kosten (Zusammenfassung)

| Service | Tier | Monatliche Kosten |
|---------|------|-------------------|
| Firebase Blaze | Inkl. Freikontingent | 0€ |
| LiveKit Cloud | Build (5k Min/Monat) | 0€ |
| Vercel | Hobby | 0€ |
| **Gesamt** | | **0€** |

---

## Nächster Schritt

**Mit Phase 1 beginnen** — `phases/01-setup-auth.md` öffnen und Schritt 1.1 starten.

```bash
cd E:\Projekte\streambite
npx create-next-app@latest . --no-typescript --eslint --tailwind --app --import-alias "@/*"
```
