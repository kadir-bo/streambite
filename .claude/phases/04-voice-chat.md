# Phase 4 — Voice Chat (LiveKit)

## Ziel
Nutzer können Voice-Kanälen beitreten, sprechen, sich gegenseitig hören,
stummschalten und den Kanal verlassen. Ende der Phase: Sprachchat funktioniert
vollständig mit visuellen Indikatoren (wer spricht, wer muted ist).

---

## Schritt 4.1 — LiveKit Setup

### Account & Credentials
1. Account auf livekit.io anlegen (Build-Tier: kostenlos)
2. API Key + Secret in `.env.local` eintragen
3. LiveKit Cloud URL eintragen (`NEXT_PUBLIC_LIVEKIT_URL`)

### Dependencies (bereits in Phase 1 installiert)
```bash
npm install livekit-client @livekit/components-react livekit-server-sdk
```

### Token-Endpoint
`app/api/livekit-token/route.js` (siehe ARCHITECTURE.md):
- Jede Voice-Channel-ID wird als LiveKit Room-Name verwendet
- Nutzer-ID als Identity
- Token ist kurzlebig (1 Stunde)

---

## Schritt 4.2 — Voice Context

`context/VoiceContext.jsx`:

```js
// State
{
  room: null,                    // LiveKit Room Instanz
  isConnected: false,
  currentChannelId: null,        // Welcher Voice-Kanal
  currentServerId: null,
  participants: [],              // LiveKit Participants
  localParticipant: null,
  isMuted: boolean,
  isDeafened: boolean,
  isScreenSharing: boolean,
  activeSpeakers: []             // Wer gerade spricht
}

// Actions
connect(serverId, channelId, userId, userName)
disconnect()
toggleMute()
toggleDeafen()
startScreenShare()
stopScreenShare()
```

### Room-Setup
```js
async function connect(serverId, channelId, userId, userName) {
  const response = await fetch(
    `/api/livekit-token?channelId=${channelId}&userId=${userId}&userName=${userName}`
  );
  const { token } = await response.json();

  const newRoom = new Room({
    adaptiveStream: true,
    dynacast: true,
    audioCaptureDefaults: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });

  // Event-Listener
  newRoom.on(RoomEvent.ParticipantConnected, handleParticipantJoin);
  newRoom.on(RoomEvent.ParticipantDisconnected, handleParticipantLeave);
  newRoom.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers);
  newRoom.on(RoomEvent.Disconnected, handleDisconnect);

  await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL, token);
  await newRoom.localParticipant.setMicrophoneEnabled(true);

  // Presence-Update in Firestore
  await updatePresence(userId, { voiceChannelId: channelId, serverId });

  setRoom(newRoom);
  setIsConnected(true);
  setCurrentChannelId(channelId);
}
```

---

## Schritt 4.3 — Voice Channel Join UI

In `components/channel/ChannelItem.jsx` für Voice-Channels:
- Kein Klick-Navigation wie Text-Channels
- Klick → Direkt beitreten (Connect)
- Wenn verbunden: grüner Indikator im Channel-Header des aktuellen Kanals

`components/voice/VoiceChannel.jsx`:
- Wird unten in der Channel-Sidebar angezeigt (unterhalb der Channel-Liste)
- Zeigt: Kanal-Name, verbundene Teilnehmer als kleine Avatare
- "Verlassen"-Button (rotes Telefon-Icon)

---

## Schritt 4.4 — Verbundene Nutzer in Channel-Liste

Wenn Nutzer in einem Voice-Channel sind, werden ihre Avatare
direkt unter dem Channel-Namen in der Channel-Sidebar angezeigt:

```jsx
// In ChannelItem.jsx für type="voice"
{voiceParticipants.length > 0 && (
  <div className="ml-6 mt-1 space-y-0.5">
    {voiceParticipants.map(participant => (
      <div key={participant.id} className="flex items-center gap-1.5 py-0.5">
        <UserAvatar userId={participant.id} size={16} />
        <span className="text-xs text-zinc-400">{participant.name}</span>
        {participant.isMuted && <MicrophoneSlashIcon size={12} />}
      </div>
    ))}
  </div>
)}
```

Presence-Daten aus Firestore: welcher Nutzer ist in welchem Voice-Channel.

---

## Schritt 4.5 — Voice Controls Bar

`components/voice/VoiceControls.jsx`:

Erscheint am unteren Ende der Channel-Sidebar wenn verbunden:
```
┌─────────────────────────────────────┐
│ 🔊 Allgemein  ·  Verbunden ✓        │
│ [Server-Name]                        │
├─────────────────────────────────────┤
│ [Mikrofon-Icon] [Kopfhörer-Icon] [X]│
└─────────────────────────────────────┘
```

Buttons:
- **Mikrofon**: Toggle Mute (grünes Mikro / durchgestrichenes rotes Mikro)
- **Kopfhörer**: Toggle Deafen (alle stumm hören)
- **Video**: Toggle Kamera (Phase 5 optional)
- **X**: Channel verlassen (rotes Telefon)

Framer Motion Entry-Animation (von unten einschieben).

---

## Schritt 4.6 — Sprechender-Indikator

`components/voice/SpeakingIndicator.jsx`:

In der Channel-Sidebar bei verbundenen Nutzern:
- Wenn Nutzer spricht: grüner Ring um Avatar
- Framer Motion: `scale: 1 → 1.05` kurzer Pulse

Im Main-Content (wenn Voice-Channel geöffnet):
- Größere Teilnehmer-Tiles zeigen Sprechenden-Status deutlicher

```jsx
// LiveKit liefert activeSpeakers automatisch
const isSpeaking = activeSpeakers.some(s => s.identity === participant.identity);
```

---

## Schritt 4.7 — Participant Tiles (Voice Channel View)

Wenn ein Nutzer einen Voice-Kanal öffnet (statt einen Text-Kanal):
`app/(app)/servers/[serverId]/[channelId]/page.jsx` checkt `channel.type === "voice"`

Layout-Varianten:
- 1 Teilnehmer: zentriert, groß
- 2-4 Teilnehmer: 2×2 Grid
- 5-9 Teilnehmer: 3×3 Grid
- 10+: kleinere Kacheln

Jede Kachel (`components/voice/ParticipantTile.jsx`):
```jsx
<div className="bg-zinc-800 rounded-xl aspect-video flex items-center justify-center relative">
  {/* Avatar groß zentriert */}
  <UserAvatar size={80} />
  {/* Name unten links */}
  <span className="absolute bottom-2 left-2 text-sm font-medium">
    {participant.name}
  </span>
  {/* Muted-Indikator */}
  {participant.isMuted && (
    <MicrophoneSlashIcon className="absolute bottom-2 right-2 text-red-400" />
  )}
  {/* Speaking-Ring */}
  {isSpeaking && <SpeakingRing />}
</div>
```

---

## Schritt 4.8 — Disconnect Handling

Beim Schließen des Browsers/Tabs:
- `useEffect` cleanup: `room.disconnect()`
- Presence in Firestore updaten: `voiceChannelId: null`

Beim Server-Wechsel:
- Aktueller Voice-Channel bleibt verbunden (wie Discord)
- VoiceControls Bar bleibt sichtbar in neuer Channel-Sidebar

Reconnect bei Verbindungsunterbrechung:
- LiveKit handhabt das automatisch via `RoomEvent.Reconnecting`
- UI zeigt "Verbindung wird wiederhergestellt..." Toast

---

## Schritt 4.9 — Mikrofon-Permission Flow

Beim ersten Voice-Beitritt:
1. Browser fragt nach Mikrofon-Permission
2. Wenn abgelehnt: Error-State mit Anleitung zum Erlauben
3. Wenn erlaubt: normal verbinden

```js
try {
  await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (err) {
  // Permission denied → UI-Fehler anzeigen
}
```

---

## Schritt 4.10 — Presence Sync für Voice

Wenn Nutzer einem Voice-Kanal beitritt/verlässt:
```js
// In Firestore /presence/{userId}
await updateDoc(presenceRef, {
  voiceChannelId: channelId || null,
  serverId: serverId || null
});
```

Channel-Sidebar subscribed auf Presence-Dokumente der Server-Mitglieder
und zeigt in Echtzeit wer in welchem Voice-Kanal ist.

---

## Checkpoints

- [ ] Token-Endpoint funktioniert (LiveKit Token wird generiert)
- [ ] Voice-Channel beitreten funktioniert
- [ ] Eigenes Mikrofon wird übertragen
- [ ] Andere Teilnehmer hören und werden gehört
- [ ] Mute toggle funktioniert
- [ ] Deafen toggle funktioniert
- [ ] Sprechenden-Indikator (grüner Ring) zeigt aktive Sprecher
- [ ] Channel verlassen trennt LiveKit-Verbindung
- [ ] Verbundene Nutzer erscheinen in Channel-Liste
- [ ] Voice Controls Bar erscheint/verschwindet mit Animation
- [ ] Browser-Tab schließen → Presence wird bereinigt
- [ ] Participant-Tile-Layout skaliert mit Teilnehmerzahl
