# Phase 2 — Server & Channel Management

## Ziel
Nutzer können Server erstellen, einem Server per Einladungslink beitreten,
Channels anlegen, und die vollständige drei-Panel Navigation funktioniert.
Ende der Phase: Die App sieht aus wie Discord — ohne Chat.

---

## Schritt 2.1 — Server Context

`context/ServerContext.jsx`:
```js
// State
{
  servers: [],              // Alle Server des Nutzers
  activeServerId: null,
  activeChannelId: null,
  activeServer: null,       // Server-Dokument
  activeChannel: null,      // Channel-Dokument
  channels: [],             // Channels des aktiven Servers
  categories: [],           // Categories des aktiven Servers
  members: []               // Members des aktiven Servers
}
```

Firestore Subscriptions:
- Server-Liste: `onSnapshot` auf alle Server wo Nutzer Mitglied ist
  (Query auf `/servers` wo `/servers/{id}/members/{userId}` existiert)
- Channels: `onSnapshot` auf `/servers/{serverId}/channels`
- Members: Lazy-load (nur wenn Member-Sidebar geöffnet)

---

## Schritt 2.2 — Server-Icon in Sidebar

`components/server/ServerIcon.jsx`:

```jsx
"use client";
import { motion } from "motion/react";

// Hover: Icon morpht von abgerundeten Ecken zu Kreis
// Active: weißer Pill-Indikator links
// Notification Badge: roter Dot rechts unten
```

Framer Motion Varianten:
```js
const iconVariants = {
  idle: { borderRadius: "30%", scale: 1 },
  hover: { borderRadius: "50%", scale: 1.1 },
  active: { borderRadius: "50%", scale: 1 }
};

const indicatorVariants = {
  idle: { height: 8 },
  hover: { height: 20 },
  active: { height: 32 }
};
```

---

## Schritt 2.3 — Server erstellen

`components/server/CreateServerModal.jsx`:

Zwei Schritte:
1. **Server-Name** (Input) + optional Server-Icon-Upload
2. **Erstellt!** — Animation und Redirect

Firestore-Operationen:
```js
// In lib/firebase/firestore.js
async function createServer(userId, name, iconFile) {
  const serverId = doc(collection(db, "servers")).id;
  const inviteCode = generateInviteCode();

  // Server-Dokument anlegen
  await setDoc(doc(db, "servers", serverId), {
    id: serverId,
    name,
    icon: null, // nach Upload updaten
    ownerId: userId,
    inviteCode,
    memberCount: 1,
    createdAt: serverTimestamp()
  });

  // Owner als Member hinzufügen
  await setDoc(doc(db, "servers", serverId, "members", userId), {
    userId,
    roles: [],
    joinedAt: serverTimestamp()
  });

  // Standard-Channels anlegen
  await createDefaultChannels(serverId);

  // Invite-Dokument anlegen
  await setDoc(doc(db, "invites", inviteCode), {
    code: inviteCode,
    serverId,
    createdBy: userId,
    expiresAt: null,
    maxUses: null,
    uses: 0,
    createdAt: serverTimestamp()
  });

  return serverId;
}

async function createDefaultChannels(serverId) {
  // Kategorie: Textkanäle
  // Kategorie: Sprachkanäle
  // Channel: #general (text)
  // Channel: Allgemein (voice)
}
```

---

## Schritt 2.4 — Server beitreten (Invite-Flow)

### Invite-Link-Seite
`app/invite/[code]/page.jsx`:
- Server-Preview laden (Name, Icon, Mitgliederzahl)
- "Beitreten"-Button
- Redirect zu `/app/servers/{serverId}` nach Beitritt

### `/app/api/invite/[code]/route.js`
```js
export async function GET(request, { params }) {
  // Invite-Dokument lesen
  // Prüfen ob abgelaufen oder max. Uses erreicht
  // Server-Info zurückgeben
}
```

### Beitritts-Logik
```js
async function joinServer(inviteCode, userId) {
  // Invite lesen und validieren
  // Member-Dokument anlegen
  // Invite uses inkrementieren
  // memberCount im Server-Dokument inkrementieren
}
```

---

## Schritt 2.5 — Channel-Liste

`components/channel/ChannelList.jsx`:

Rendert Kategorien und ihre Channels:
```jsx
// Struktur:
// KATEGORIE-HEADER (klappbar)
//   # text-channel (hover → active state)
//   # another-channel
// KATEGORIE-HEADER
//   🔊 voice-channel
```

`components/channel/ChannelItem.jsx`:
```jsx
// Framer Motion für Hover-State
// Active-State (white/10 bg + white pill indicator)
// Voice-Channel: zeigt verbundene Nutzer-Avatare darunter
// Unread-Indicator: bold text + weißer Dot links
```

---

## Schritt 2.6 — Channel erstellen/bearbeiten/löschen

`components/channel/CreateChannelModal.jsx`:
- Channel-Typ auswählen (Text / Voice / Announcement)
- Name-Input mit Live-Preview (Sonderzeichen → Bindestrich)
- Kategorie auswählen

Nur Owner/Admin darf Channels erstellen.
Einstellungen-Icon im Channel-Hover für Owner.

---

## Schritt 2.7 — Server Settings Modal

`components/server/ServerSettingsModal.jsx`:

Vollbild-Modal mit Nav-Sidebar:
- **Übersicht**: Name, Icon, Banner, Beschreibung
- **Rollen** (Phase 2: nur Anzeige)
- **Einladungen**: Aktive Einladungslinks generieren/löschen
- **Mitglieder**: Liste mit Kick/Ban-Aktionen (Owner/Admin only)
- **Danger Zone**: Server löschen (nur Owner)

---

## Schritt 2.8 — Invite Modal

`components/modals/InviteModal.jsx`:
- Zeigt aktuellen Invite-Link an
- "Kopieren"-Button
- Optionen: Ablaufdatum, Max. Uses
- Neuen Link generieren

---

## Schritt 2.9 — Member Sidebar

`components/layout/MemberSidebar.jsx`:
- Rechte Sidebar (240px)
- Zeigt Mitglieder gruppiert nach Status: Online / Offline
- Jeder Eintrag: Avatar + Status-Dot + Nutzername
- Klick auf Nutzer → UserPopover

Ein-/Ausklappen per Button im Channel-Header.
Framer Motion width-Animation: 240px → 0px.

---

## Schritt 2.10 — Channel Header

`components/channel/ChannelHeader.jsx`:
- Channel-Name (linksbündig)
- Channel-Topic (muted text)
- Icons rechts: Suche, Mitglieder, Pinnned Messages, Einstellungen

---

## Schritt 2.11 — Navigations-Logik

Bei Klick auf Server:
1. `setActiveServerId` in ServerContext
2. Redirect zu ersten Textkanal des Servers
3. `setActiveChannelId` setzen
4. Channels aus Firestore laden

Bei App-Start:
- Letzten aktiven Server aus `localStorage` restoren
- Falls kein letzter Server: ersten Server der Liste

---

## Schritt 2.12 — Server-Recht-Klick-Menü

`components/ui/ContextMenu.jsx` (allgemein):
Rechtsklick auf Server-Icon öffnet Kontext-Menü:
- Einladungslink kopieren
- Benachrichtigungen anpassen
- Server verlassen
- Einstellungen (Owner/Admin only)

Framer Motion: `initial={{ opacity: 0, scale: 0.95 }}` spring-in.

---

## Checkpoints

- [ ] Server erstellen (Name + Icon) funktioniert
- [ ] Invite-Link generiert und nutzbar
- [ ] Server beitreten via Invite-Code
- [ ] Channel-Liste rendert (Text + Voice-Channels)
- [ ] Kategorien klappbar
- [ ] Channel-Wechsel updatet URL + Content-Bereich
- [ ] Server-Settings Modal öffnet/schließt
- [ ] Member-Sidebar animiert ein/aus
- [ ] Server-Icon Hover-Animation (corner-radius morphing)
- [ ] Active-State in Channel-Liste korrekt (white/10 bg + weißer Pill)
- [ ] Kontext-Menü auf Server-Icon
- [ ] Nur Owner kann Server löschen / Channels anlegen
