# Phase 5 — Streaming & Screen Share (LiveKit)

## Ziel
Nutzer können ihren Bildschirm in Voice-Kanälen teilen ("Go Live").
Andere können den Stream zuschauen. Ende der Phase: Screen Share + Stream-Viewer
mit Layout-Umschalten (Grid → Spotlight auf den Stream).

---

## Schritt 5.1 — Screen Share aktivieren

LiveKit unterstützt Screen Share nativ via `canPublishSources: ["screen_share"]`
(bereits im Token-Grant aus Phase 4 enthalten).

### VoiceContext-Erweiterung
```js
async function startScreenShare() {
  if (!room) return;
  await room.localParticipant.setScreenShareEnabled(true);
  setIsScreenSharing(true);
}

async function stopScreenShare() {
  await room.localParticipant.setScreenShareEnabled(false);
  setIsScreenSharing(false);
}
```

### Browser-Permission
Der Browser fragt, welches Fenster/Tab/Monitor geteilt wird.
Kein eigener Permission-Flow nötig — Browser-nativ.

---

## Schritt 5.2 — "Go Live" Button

In `components/voice/VoiceControls.jsx`:
- Monitor-Icon (Phosphor: `MonitorIcon`)
- Aktiv: `text-rose-500` (Live-Farbe)
- Tooltip: "Bildschirm teilen" / "Teilen beenden"

Beim Aktivieren: kurze Framer Motion pulse-Animation auf dem Button.

---

## Schritt 5.3 — Stream in Channel-Liste anzeigen

Wenn jemand teilt, erscheint in der Channel-Sidebar unter dem Voice-Channel:
```
🔊 Allgemein
   👁 Kadir streamt — [Anschauen]
     Avatar Avatar Avatar
```

Roter "LIVE" Badge neben dem Kanal-Namen.

---

## Schritt 5.4 — Screen Share Tile

`components/streaming/ScreenShareTile.jsx`:

```jsx
<div className="relative bg-zinc-900 rounded-xl overflow-hidden">
  {/* LiveKit VideoTrack für den Screen Share */}
  <VideoTrack trackRef={screenTrack} />

  {/* Overlay: Wer teilt */}
  <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 rounded-lg px-2 py-1">
    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
    <span className="text-xs text-white">{streamer.name}</span>
  </div>
</div>
```

---

## Schritt 5.5 — Layout-Wechsel: Grid → Spotlight

Wenn ein Screen Share aktiv ist, wechselt das Voice-Channel-Layout automatisch:

**Vorher (normales Grid)**:
```
┌──────┬──────┐
│ User │ User │
├──────┼──────┤
│ User │ User │
└──────┴──────┘
```

**Nachher (Spotlight-Layout)**:
```
┌─────────────────────────┬──────┐
│                         │ User │
│    Screen Share         ├──────┤
│    (groß, 70% Breite)   │ User │
│                         ├──────┤
│                         │ User │
└─────────────────────────┴──────┘
```

Framer Motion Layout-Animation für den Übergang:
```jsx
<motion.div layout layoutId="voice-grid">
  {/* Screen Share: nimmt mehr Platz ein */}
  {screenShareTrack && (
    <motion.div layout className="col-span-3">
      <ScreenShareTile />
    </motion.div>
  )}
  {/* Andere Teilnehmer: kleinere Spalte */}
  {participants.map(p => (
    <motion.div layout key={p.identity}>
      <ParticipantTile participant={p} compact={!!screenShareTrack} />
    </motion.div>
  ))}
</motion.div>
```

---

## Schritt 5.6 — Stream-Viewer (Beitreten ohne Mikrofon)

Nutzer können einem Voice-Kanal auch im "Viewer-Modus" beitreten:
- Sie können hören, aber nicht sprechen
- Sie sehen den Screen Share
- Token: `canPublish: false` (nur subscribe)

"Anschauen"-Button in der Channel-Sidebar öffnet den Stream-View
ohne Mikrofon-Permission-Anfrage.

---

## Schritt 5.7 — Stream-Controls Overlay

Über dem Screen Share gibt es ein Overlay das beim Hover erscheint:
```
                           [Vollbild] [Stream teilen] [Teilen beenden]
```

Vollbild: `element.requestFullscreen()`

---

## Schritt 5.8 — Mehrere Screen Shares

Wenn mehrere Nutzer gleichzeitig teilen:
- Tabs oben: "Kadirs Stream" | "Marias Stream"
- Aktiver Stream wird groß angezeigt
- Andere Streams als kleine Kacheln

Für MVP: maximal 1 aktiver Stream empfohlen.

---

## Checkpoints

- [ ] "Go Live" Button im Voice-Control
- [ ] Screen Share startet (Browser öffnet Fenster-Auswahl)
- [ ] Screen Share wird anderen Teilnehmern gezeigt
- [ ] "LIVE"-Badge im Channel-Sidebar
- [ ] Layout wechselt zu Spotlight wenn Stream aktiv
- [ ] Framer Motion Layout-Animation bei Wechsel
- [ ] Stream beenden funktioniert
- [ ] Viewer-Modus (Anschauen ohne Mikrofon)
- [ ] Vollbild-Funktion
