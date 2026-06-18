# Phase 6 — Settings, Profil & Finishing

## Ziel
Vollständige Settings-Erfahrung (User-Account, Profil, Appearance, Notifications),
Nutzer-Profilkarte, Server-Settings mit Member-Management, und alle kleinen
UX-Details die die App "fertig" wirken lassen.

---

## Schritt 6.1 — Settings Modal (Shell)

`components/settings/SettingsModal.jsx`:

Vollbild-Modal (wie Discord) mit Framer Motion:
```jsx
<AnimatePresence>
  {settingsOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex bg-zinc-900"
    >
      {/* Linke Nav-Sidebar */}
      <SettingsNav onClose={() => setSettingsOpen(false)} />
      {/* Rechter Content-Bereich */}
      <SettingsContent section={activeSection} />
    </motion.div>
  )}
</AnimatePresence>
```

`Escape`-Taste schließt die Settings (KeyboardEvent Listener).

### Settings-Navigation (linke Sidebar)
```
NUTZER-EINSTELLUNGEN
  Mein Konto
  Profil
  Datenschutz & Sicherheit
  Verbundene Apps (Phase 2)

APP-EINSTELLUNGEN
  Erscheinungsbild
  Benachrichtigungen
  Sprache & Region
  Barrierefreiheit

STIMME & VIDEO
  Stimme & Video
  Tastenkombinationen

─────────────────────
[Abmelden]          ← rot
```

---

## Schritt 6.2 — Account-Einstellungen

`components/settings/AccountSettings.jsx`:

- **Avatar ändern**: Klick auf Avatar → File Picker → Crop-Dialog (optional) → Upload
- **Anzeigename**: Input-Feld mit "Speichern"-Button
- **E-Mail ändern**: Erfordert aktuelles Passwort
- **Passwort ändern**: Aktuelles + Neues + Bestätigung
- **Konto löschen**: Danger Zone, Confirm-Modal mit Passwort-Eingabe

Avatar-Upload:
```js
async function handleAvatarUpload(file) {
  const url = await uploadAvatar(user.uid, file);
  await updateUserProfile(user.uid, { avatar: url });
  // Firebase Auth photoURL auch updaten
  await updateProfile(user, { photoURL: url });
}
```

---

## Schritt 6.3 — Profil-Einstellungen

`components/settings/ProfileSettings.jsx`:

- **Profilbanner**: Upload (empfohlen: 1500×500px)
- **Bio**: Textarea (max 190 Zeichen)
- **Custom Status**: Freitext + optionales Emoji
- **Live-Vorschau** rechts: zeigt wie das Profil aussieht

Profilkarte-Vorschau-Design:
```
┌────────────────────────────────┐
│ [BANNER (dunkel/bild)]         │
│                          [Pen] │
│ [AVATAR]   Name                │
│            Custom Status       │
│ ────────────────────────────── │
│ BIO                            │
│ Deine Bio steht hier.          │
└────────────────────────────────┘
```

---

## Schritt 6.4 — Erscheinungsbild

`components/settings/AppearanceSettings.jsx`:

- **Schriftgröße**: Slider (klein / normal / groß) → `fontSize` in User-Settings
- **Kompakter Modus**: Toggle (Nachrichten-Spacing reduzieren)
- **Zeitformat**: 12h / 24h

Änderungen werden sofort angewendet (LocalStorage + Firestore speichern).
Bei Kompakt-Modus: anderes Spacing in `MessageGroup.jsx` (CSS-Variable).

---

## Schritt 6.5 — Benachrichtigungen

`components/settings/NotificationSettings.jsx`:

- **Desktop-Benachrichtigungen**: Toggle (Browser-Permission anfragen)
- **Töne**: Toggle (Message-Sound, Voice-Connect-Sound)
- **@mentions immer benachrichtigen**: Toggle
- **Kanäle stummschalten**: Liste der gemuteten Kanäle

Browser-Notification Permission:
```js
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  // "granted" | "denied" | "default"
}
```

---

## Schritt 6.6 — Stimme & Video Einstellungen

`components/settings/VoiceVideoSettings.jsx`:

- **Eingabegerät**: Dropdown (MediaDevices.enumerateDevices)
- **Ausgabegerät**: Dropdown
- **Input-Lautstärke**: Slider + Live-Indicator
- **Rauschunterdrückung**: Toggle (LiveKit-nativ)
- **Echo-Unterdrückung**: Toggle

Mikrofon-Test: kurzer "Testaufnahme" Button.

---

## Schritt 6.7 — User Popover / Profilkarte

`components/user/UserPopover.jsx`:

Erscheint bei Klick auf einen Nutzer-Avatar (in Member-Sidebar, in Nachrichten):
- Position: neben dem Element (Framer Motion spring-in)
- Zeigt: Banner, Avatar, Name, Status, Bio
- Button: "Nachricht schicken" (Phase 2: DMs)
- Für eigenes Profil: "Profil bearbeiten" Link

```jsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute z-50 bg-zinc-800 rounded-xl w-72 shadow-2xl overflow-hidden"
    >
      {/* Banner (falls vorhanden, sonst neutraler zinc Gradient) */}
      <div className="h-16 bg-gradient-to-br from-zinc-700 to-zinc-800" />
      {/* Avatar (überlappend) */}
      {/* Inhalt */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## Schritt 6.8 — Server-Einstellungen (Erweitert)

`components/server/ServerSettingsModal.jsx` — vollständige Implementation:

### Übersicht
- Server-Name + Icon + Banner bearbeiten
- Beschreibung (Textarea)
- Einladungslink verwalten

### Rollen (Basic)
- Vordefinierte Rollen: Admin, Moderator
- Nutzer Rollen zuweisen/entziehen

### Mitglieder verwalten
- Liste aller Mitglieder mit Rollen
- Suche nach Mitgliedernamen
- Aktionen: Rollen ändern, Kick, (Ban für Phase 2)
- Kick-Confirm-Modal: "Soll @username vom Server entfernt werden?"

### Einladungen
- Bestehende Invite-Links anzeigen
- Neuen Link erstellen (mit Optionen: Ablauf, Max. Uses)
- Link löschen/deaktivieren

### Danger Zone
- **Server löschen**: Modal mit Server-Namen eingeben + Bestätigen

---

## Schritt 6.9 — Toast-System

`components/ui/Toast.jsx`:

Für transiente Feedback-Meldungen:
- Unten Mitte des Screens
- Types: Success (grün, semantisch), Error (rot, semantisch), Info (zinc-700 bg — kein Farb-Akzent)
- Auto-dismiss nach 3 Sekunden
- Framer Motion: `y: 20 → 0` beim Erscheinen, `opacity: 1 → 0` beim Verschwinden

```js
// Verwendung überall:
import { useToast } from "@/context/ToastContext";
const { toast } = useToast();

toast.success("Einladungslink kopiert!");
toast.error("Fehler beim Hochladen. Datei zu groß.");
```

---

## Schritt 6.10 — Keyboard Shortcuts

`components/settings/KeyboardShortcuts.jsx` (nur Anzeige):

| Shortcut | Aktion |
|----------|--------|
| Ctrl+K | Schnellnavigation / Suche |
| Alt+↑/↓ | Zwischen Kanälen navigieren |
| Ctrl+Shift+M | Mikrofon muten/unmuten |
| Ctrl+Shift+D | Deafen toggle |
| Escape | Modal schließen |
| Enter | Nachricht senden |
| Shift+Enter | Neue Zeile im Input |

---

## Schritt 6.11 — Quick Switcher (Ctrl+K)

`components/ui/QuickSwitcher.jsx`:

Minimales Search-Modal (Command Palette):
- `Ctrl+K` öffnet es
- Suche nach: Server, Kanäle, Nutzer
- Framer Motion spring-in von oben
- Escape schließt es

---

## Schritt 6.12 — Status-Wechsel

`components/user/StatusSelector.jsx`:

Klick auf Status-Dot unten links (User Panel):
- Dropdown mit: Online, Abwesend, Nicht stören, Unsichtbar
- Custom-Status-Textfeld
- Framer Motion origin-bottom-left scale-in

```js
async function setStatus(status) {
  await updateDoc(doc(db, "users", user.uid), { status });
  await updateDoc(doc(db, "presence", user.uid), { status });
}
```

---

## Schritt 6.13 — Mobile Responsive

Finaler Mobile-Check:

- [ ] Server-Sidebar als Bottom-Navigation Bar
- [ ] Channel-Sidebar als Drawer (swipe-able)
- [ ] Settings als Full-Screen (kein Split-Layout auf Mobile)
- [ ] Voice Controls auf Mobile korrekt positioniert
- [ ] Input auf Mobile: `done`-Taste auf der Tastatur sendet nicht (only Enter)
- [ ] Touch-friendly: alle Buttons min. 44px Tappable Area

---

## Schritt 6.14 — Performance & Cleanup

- [ ] Framer Motion `AnimatePresence` auf allen Modals (korrekte Exit-Animationen)
- [ ] `useEffect` cleanups für alle Firestore-Listeners
- [ ] Voice-Disconnect bei Tab-Wechsel / Schließen (beforeunload)
- [ ] Lazy-load von Settings-Modal (nicht im Initial Bundle)
- [ ] Lazy-load von EmojiPicker
- [ ] Bilder lazy-load in Message-Liste

---

## Checkpoints

- [ ] Settings-Modal öffnet/schließt (Escape-Taste funktioniert)
- [ ] Avatar-Upload und -Anzeige
- [ ] Passwort-Änderung funktioniert
- [ ] Profil-Bio und Custom-Status speichern
- [ ] Erscheinungsbild (Schriftgröße) wird sofort angewendet
- [ ] Desktop-Benachrichtigungen (Permission + Test)
- [ ] User-Popover auf Avatar-Klick
- [ ] Status-Selector (Online/Idle/DND/Invisible)
- [ ] Toast-System funktioniert (Success, Error)
- [ ] Ctrl+K Quick-Switcher öffnet
- [ ] Server-Mitglieder kicken funktioniert
- [ ] Server-Einladungen verwalten
- [ ] Mobile-Layout vollständig responsive
