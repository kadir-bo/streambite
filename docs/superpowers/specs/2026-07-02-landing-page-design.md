# Landing Page – Streambite

**Datum:** 2026-07-02  
**Status:** Designentwurf  
**Autor:** Sam (Orchestrator)

---

## 1. Ziel

Eine eigenständige Marketing-Landing-Page für Streambite unter `/`.  
Aktuell redirectet `/` nur nach `/channels` – das soll zur Landing Page werden.  
Ziel: Besuchern zeigen, was Streambite kann, und sie zur Registrierung bewegen.

---

## 2. Route & Struktur

| Route | Inhalt |
|---|---|
| `/` | **Landing Page** (neu, Route Group `(marketing)`) |
| `/login` | Login-Seite (bereits vorhanden) |
| `/register` | Registrierung (bereits vorhanden) |
| `/channels` | App (bereits vorhanden) |

**Ordnung im Dateisystem:**

```
app/
├── (marketing)/              ← NEU
│   └── page.jsx              ← Landing Page (ersetzt app/page.js)
├── (app)/                    ← Unverändert
├── (auth)/                   ← Unverändert
├── layout.js                 ← Wurde angepasst (kein Redirect mehr)
└── page.js                   ← gelöscht (war nur redirect)
```

- `app/page.js` (alter Redirect) wird gelöscht.
- `app/(marketing)/page.jsx` wird die neue Landing Page.
- `app/layout.js` bleibt der Root-Layout (fonts, providers) – Landing Page erbt ihn.
- Nach Login: immer noch Redirect nach `/channels`.

---

## 3. Aufbau der Landing Page

### 3.1 Navigation (Sticky)

```
[Logo] Streambite              [Anmelden] [Registrieren]
```

- Links: Logo + Wortmarke ("Streambite")
- Rechts: Zwei Buttons – "Anmelden" (link zum `/login`) und "Registrieren" (link zum `/register`)
- Leicht transparente Hintergrund (wie Discord), wird beim Scrollen undurchsichtiger
- Sticky oben

### 3.2 Hero Section

**Headline:**  
*Deine Community. Dein Chat. Deine Stimme.*

**Subheadline:**  
*Streambite verbindet Echtzeit-Chat, Sprachkanäle und Screen-Sharing in einem modernen, dunklen Interface – entwickelt für echte Gespräche, schnelle Reaktionen und private Communities.*

**CTA:**  
- `[🚀 Kostenlos starten]` → `/register`  
- `[📖 Mehr erfahren]` → scrollt zu den Features

**Social Proof:**  
- "Bereits genutzt von [X] aktiven Nutzern" (statisch oder dynamisch aus Firestore)

**Hintergrund:**  
- Dezente Animation (subtiles Gradient-Movement oder Floating-Particles über dunklem Hintergrund)

### 3.3 Feature-Sektionen (6 Stück)

Jede Feature-Sektion folgt dem gleichen Muster:  
Icon + Titel + Beschreibung + Bullet-Liste der konkreten Features.  
Layout wechselt zwischen Text-Links/Bild-Rechts und Bild-Links/Text-Rechts.

#### 3.3.1 Text-Chat – Nachricht für Nachricht

```
💬 Text-Chat

Echtzeit-Nachrichten mit Markdown, Anhängen und allem, was ein gutes
Gespräch braucht.

✓ Markdown-Formatierung (fett, kursiv, Code, Zitate)
✓ Datei-Uploads inkl. Bilder, PDFs und Archive
✓ Emoji-Reaktionen für schnelle Antworten ohne Worte
✓ Reply-Threads – antworte direkt auf einzelne Nachrichten
✓ Nachrichten bearbeiten & löschen
✓ Erwähnungen mit @-Notifications
✓ Upload-Vorschau – Bilder im Chat, ohne öffnen zu müssen
✓ Ungelesen-Zähler pro Kanal & Server
```

#### 3.3.2 Voice – Hörbar nah

```
🎙️ Sprachkanäle

Tritt ein, red' los. Unsere Audio-Engine liefert klaren Sound mit
minimaler Latenz – für Gaming, Arbeit oder einfach so.

✓ LiveKit-WebRTC – niedrige Latenz, hohe Qualität
✓ Rauschunterdrückung – weniger Hintergrundgeräusche
✓ Sprech-Erkennung – sieh sofort, wer redet
✓ Push-to-Talk & Sprachaktivierung
✓ Automatische Audio-Pegel-Anzeige
✓ Stabile Verbindung via TURN-Server-Fallback
✓ Teilnehmer-Liste mit Status (Online, Leise, Abwesend)
```

#### 3.3.3 Screen-Sharing – Zeig, was du siehst

```
🖥️ Screen-Sharing

Teile deinen Bildschirm in 1080p bei 60 fps – ideal für
Präsentationen, gemeinsames Coden oder Filmabende.

✓ 1080p/60fps – gestochen scharf und flüssig
✓ Tab-Audio teilen – stream' Videos mit Ton aus Chrome-Tabs
✓ Vollbild-Modus für den geteilten Bildschirm
✓ Beliebig viele Zuschauer pro Kanal
✓ Optimiert für geringe Bandbreite
```

#### 3.3.4 Communities – Dein Raum, deine Regeln

```
🏘️ Server & Communities

Erstelle Server für dein Team, deine Community oder deine Freunde.
Strukturiert in Kanälen und Kategorien.

✓ Unbegrenzte Server erstellen oder beitreten
✓ Kategorien & Kanäle – Text und Voice getrennt organisieren
✓ Einladelinks mit individuellem Code
✓ Rollen-basierte Berechtigungen (Admin, Moderator, Mitglied)
✓ Server durchsuchen – finde Kanäle auf einen Blick
✓ Benutzerdefinierte Server-Icons
```

#### 3.3.5 Direktnachrichten – Privat und direkt

```
✉️ Direktnachrichten & Freunde

Schreib' deinen Freunden, ohne einen Server zu betreten. Mit vollem
Funktionsumfang – inklusive Sprachkanal.

✓ Private 1:1-Unterhaltungen
✓ Freundesliste mit Online-Status
✓ Freundesanfragen & Benachrichtigungen
✓ Schnellsuche – finde Freunde und Kanäle sofort
✓ Eigener Voice-Kanal für jede DM
```

#### 3.3.6 Mobil & Modern

```
📱 Für unterwegs gemacht

Streambite läuft im Browser – auf dem Desktop und auf dem
Smartphone. Mit optimierter Touch-Steuerung.

✓ Voll responsive – Desktop, Tablet, Smartphone
✓ Touch-Gesten – lange drücken für Kontextmenüs
✓ iOS Safe-Area – keine Notch-Probleme
✓ Mobile Bottom-Navigation
✓ Slide-In Seitenleisten für kleine Bildschirme
✓ GPU-beschleunigte Animationen
```

### 3.4 How it Works (3 Schritte)

```
So funktioniert's

1. 📝 Konto erstellen
   Mit E-Mail oder Google – in unter 30 Sekunden.

2. 🏘️ Server beitreten oder erstellen
   Tritt einem bestehenden Server bei oder erstelle deinen eigenen –
   mit eigenem Namen und Icon.

3. 💬 Loslegen
   Schreib' Nachrichten, starte einen Voice-Call oder teile deinen
   Bildschirm. Alles ohne Installation.
```

Horizontales 3-Spalten-Layout auf Desktop, vertikal auf Mobil.

### 3.5 Technologie-Stack (vertrauensbildend)

```
🔧 Technisch auf der Höhe

⚡ Next.js 16    🔥 Firebase Firestore    🎙️ LiveKit WebRTC
🎨 Tailwind CSS  📦 Cloudinary            🔒 TURN-Verschlüsselung
💨 Framer Motion

Kein Download, keine Installation – nur ein Link und los geht's.
```

Grid-Layout mit Badge-ähnlichen Karten für jede Technologie.

### 3.6 CTA Section (vor Footer)

```
Bereit?

Tritt deiner ersten Community bei oder erstelle deinen eigenen
Server – kostenlos, ohne Verpflichtung.

        [🚀 Jetzt kostenlos registrieren]

Bereits Mitglied? → [Anmelden]
```

- Großer zentrierter Block
- Primary Button (`bg-(--accent)`) + Secondary Link
- Minimaler Abstand zum Footer

### 3.7 Footer

```
Streambite © 2026  |  Über uns  |  Datenschutz  |  Impressum

"Community chat, voice and streaming"
```

- Einzeilig, dezente Schrift
- Unterseiten als Platzhalter (können später befüllt werden)

---

## 4. Design-Richtlinien

| Element | Wert |
|---|---|
| **Farben** | Bestehendes Streambite-Theme (zinc-dark + blurple accent `#5865f2`) |
| **Schrift** | Geist Sans (bereits geladen) |
| **Headline-Größe** | `text-4xl` bis `text-6xl` je Breakpoint |
| **Section-Abstand** | `py-24` bis `py-32` |
| **Max Width** | `max-w-6xl`, zentriert |
| **Buttons** | Gleicher `Button`-Component aus `components/buttons/` |
| **Animation** | Framer Motion: fade-in-up beim Scrollen (viewport-triggered) |
| **Keine Client-Komplexität** | Landing Page bleibt Server Component; nur interaktive Teile (Buttons, Smooth-Scroll) client-seitig |

---

## 5. Was bleibt / Was ändert sich

| Datei | Änderung |
|---|---|
| `app/page.js` | ❌ Löschen (alter Redirect) |
| `app/(marketing)/page.jsx` | ✨ Neu: Landing Page (Server Component) |
| `app/layout.js` | 🔧 Entferne Redirect-Logik falls vorhanden; unverändert falls nicht |
| `app/(app)/layout.jsx` | 🔁 Unverändert (AuthGuard bleibt) |
| `app/(auth)/layout.jsx` | 🔁 Unverändert |
| `components/landing/` | ✨ Neu: Ordner für Landing-Komponenten (hero, features, etc.) |

---

## 6. Nicht im Scope

- i18n / mehrsprachige Inhalte
- Pricing-Seite / Abo-Modell
- Blog / Changelog
- SEO-Meta-Tags über Basics hinaus
- Analytics / Tracking
- CMS-Anbindung

---

## 7. Spezifikations-Review

- ❌ Platzhalter? Keine. Alle Inhalte sind definiert.
- ❌ Widersprüche? Keine. Passt zur bestehenden App-Architektur.
- ✅ Umfang: Landing Page + Komponenten – ein implementierbarer Schritt.
- ✅ Eindeutigkeit: Jede Section ist klar beschrieben.
