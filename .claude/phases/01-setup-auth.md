# Phase 1 — Project Setup + Auth + Architecture

## Ziel
Lauffähige Next.js-App mit vollständigem Auth-Flow, Firebase-Integration,
App-Shell-Layout und Navigation-Grundgerüst. Ende der Phase: Nutzer kann sich
registrieren, anmelden, landet im App-Shell (leer, aber korrekt aufgebaut).

---

## Schritt 1.1 — Next.js Projekt initialisieren

```bash
npx create-next-app@latest streambite \
  --no-typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir no \
  --import-alias "@/*"
```

Danach installieren:
```bash
npm install firebase framer-motion @phosphor-icons/react
npm install livekit-client @livekit/components-react livekit-server-sdk
```

---

## Schritt 1.2 — Tailwind v4 + Design Tokens

`tailwind.config.js` erweitern mit Streambite-Farbpalette aus `DESIGN.md`:
- Alle zinc-Varianten explizit benennen
- Indigo-Akzent als `accent` Token
- Statusfarben als Tokens

CSS-Variablen in `globals.css`:
```css
:root {
  --color-surface-deepest: #09090b;
  --color-surface-deep: #111113;
  --color-surface-base: #18181b;
  --color-surface-elevated: #27272a;
  --color-surface-overlay: #3f3f46;
  --color-text-primary: #f4f4f5;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;
  /* Kein Akzent — aktive States via Helligkeit */
  --color-hover: rgba(255, 255, 255, 0.04);
  --color-active: rgba(255, 255, 255, 0.10);
  --color-focus-ring: rgba(255, 255, 255, 0.20);
  /* Statusfarben: semantisch, nicht dekorativ */
  --color-status-online: #22c55e;
  --color-status-idle: #f59e0b;
  --color-status-dnd: #ef4444;
  --color-status-offline: #3f3f46;
  --color-status-live: #f43f5e;
  /* Danger: destruktive Aktionen */
  --color-danger: #ef4444;
}
```

---

## Schritt 1.3 — Geist Font via next/font

```js
// app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
```

---

## Schritt 1.4 — Firebase Setup

`lib/firebase/config.js` — exakt wie in Lura, mit `getFirebaseApp()`,
`getFirebaseAuth()`, `getFirebaseDB()`, `getFirebaseStorage()` Funktionen.

`lib/firebase/auth.js`:
```js
export async function signIn(email, password) { ... }
export async function signUp(email, password, displayName) { ... }
export async function signOut() { ... }
export async function resetPassword(email) { ... }
export async function updateUserProfile(userId, data) { ... }
export async function uploadAvatar(userId, file) { ... }
```

`lib/firebase/firestore.js`:
```js
// Alle CRUD-Operationen als Helfer-Funktionen
export async function createUser(userId, data) { ... }
export async function getUser(userId) { ... }
export async function createServer(data) { ... }
export async function joinServer(serverId, userId) { ... }
// etc.
```

---

## Schritt 1.5 — Auth Context

`context/AuthContext.jsx`:
- Wrapped mit `"use client"`
- `onAuthStateChanged` subscription
- Beim ersten Login: Firestore-User-Dokument anlegen (falls nicht vorhanden)
- Presence-Dokument updaten (`/presence/{userId}` → online)
- `onDisconnect` via Firebase Realtime Database oder Firestore + Heartbeat

State:
```js
{
  user: null,          // Firebase Auth User
  userProfile: null,   // Firestore /users/{uid}
  loading: true
}
```

---

## Schritt 1.6 — Auth-Routen

Alle Auth-Seiten unter `app/(auth)/`:

### `app/(auth)/layout.jsx`
```jsx
export default function AuthLayout({ children }) {
  return (
    <main className="h-dvh flex items-center justify-center bg-zinc-950">
      {children}
    </main>
  );
}
```

### `app/(auth)/sign-in/page.jsx`
- Email + Passwort Input
- "Weiter mit Google"-Button (Google OAuth)
- Link zu `/sign-up` und `/forgot-password`
- Fehlerbehandlung mit nutzerfreundlichen Messages
- Framer Motion: `initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}`

### `app/(auth)/sign-up/page.jsx`
- Anzeigename + Email + Passwort + Passwort-Bestätigung
- Client-seitige Validierung
- Nach Registrierung: Firestore User-Dokument anlegen
- Redirect zu `/app`

### `app/(auth)/forgot-password/page.jsx`
- Email-Input
- Firebase `sendPasswordResetEmail`
- Success-State mit Animation

---

## Schritt 1.7 — Route Protection

`lib/routing/PrivateRoute.jsx` (wie in Lura):
- Prüft `user` aus AuthContext
- Redirect zu `/sign-in` wenn nicht authenticated
- Loading-Spinner während Auth-State lädt

`app/(app)/layout.jsx`:
```jsx
"use client";
import PrivateRoute from "@/lib/routing/PrivateRoute";
import AppShell from "@/components/layout/AppShell";

export default function AppLayout({ children }) {
  return (
    <PrivateRoute>
      <AppShell>{children}</AppShell>
    </PrivateRoute>
  );
}
```

---

## Schritt 1.8 — App Shell Grundgerüst

`components/layout/AppShell.jsx`:
```jsx
"use client";
// Drei-Panel Layout
// ServerSidebar (64px) | ChannelSidebar (240px) | Content (flex-1)
// In dieser Phase: Sidebar-Panels leer/placeholder
```

`components/layout/ServerSidebar.jsx`:
- Vertikale Liste von Server-Icons
- "+" Button zum Server erstellen
- Direktnachrichten-Icon ganz oben
- In Phase 1: statisch, keine Daten

`components/layout/ChannelSidebar.jsx`:
- Server-Name-Header
- Channel-Liste (Phase 1: leer)
- User-Panel unten (Avatar, Nutzername, Status, Einstellungen-Icon)

---

## Schritt 1.9 — User Panel

`components/user/UserPanel.jsx`:
- Avatar (36px, rund) + Status-Dot
- Nutzername (14px, zinc-100)
- Discriminator oder Custom-Status (12px, zinc-500)
- Icons: Mikrofon, Kopfhörer, Einstellungen (je 20px, Phosphor)

---

## Schritt 1.10 — Providers

`context/Providers.jsx`:
```jsx
"use client";
export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ServerProvider>
        <VoiceProvider>
          {children}
        </VoiceProvider>
      </ServerProvider>
    </AuthProvider>
  );
}
```

`app/layout.jsx` wrapped mit `<Providers>`.

---

## Checkpoints

- [ ] `npm run dev` startet ohne Fehler
- [ ] Sign-up erstellt Firebase-Auth-Nutzer + Firestore-Dokument
- [ ] Sign-in funktioniert (Email + Google)
- [ ] Nicht-authentifizierter Nutzer wird zu `/sign-in` redirected
- [ ] App-Shell rendert (3 Panels sichtbar, leer)
- [ ] User-Panel zeigt eingeloggten Nutzer
- [ ] Geist-Font geladen (DevTools → Network prüfen)
- [ ] Framer Motion Entry-Animation auf Auth-Formularen funktioniert
