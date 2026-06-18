# Streambite — Technical Architecture

## Tech Stack

| Schicht | Technologie | Warum |
|---------|-------------|-------|
| Frontend | Next.js 15 (App Router) | Routing, RSC, API Routes |
| Styling | Tailwind CSS v4 | Utility-first, dark theme |
| Animationen | Framer Motion (motion/react) | Micro-animations, Spring-Physics |
| Auth | Firebase Auth | Email/Password, Google OAuth |
| Datenbank | Firestore (Blaze Plan) | Real-time onSnapshot, schemalos |
| Storage | Firebase Storage | Avatare, Attachments |
| Voice/Video | LiveKit (Cloud Build-Tier) | SFU für Voice-Kanäle + Streaming |
| Hosting | Vercel (Hobby) | Next.js-native, kostenlos |
| Icons | @phosphor-icons/react | Eine Bibliothek, konsistent |
| Language | JavaScript (.js / .jsx) | Kein TypeScript |

---

## Projektstruktur

```
streambite/
├── app/
│   ├── (public)/
│   │   ├── page.jsx                 — Landing Page
│   │   └── layout.jsx
│   ├── (auth)/
│   │   ├── layout.jsx
│   │   ├── sign-in/page.jsx
│   │   ├── sign-up/page.jsx
│   │   └── forgot-password/page.jsx
│   ├── (app)/
│   │   ├── layout.jsx               — App Shell (drei Panels)
│   │   ├── channels/
│   │   │   └── @me/page.jsx         — DMs / Freunde (Phase 2+)
│   │   └── servers/
│   │       └── [serverId]/
│   │           ├── page.jsx         — Server-Startseite
│   │           └── [channelId]/
│   │               └── page.jsx     — Kanal-Ansicht
│   └── api/
│       ├── livekit-token/route.js   — LiveKit Token-Endpoint
│       └── invite/[code]/route.js   — Invite-Validierung
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx             — Drei-Panel Layout-Wrapper
│   │   ├── ServerSidebar.jsx        — Linke Server-Icon-Liste
│   │   ├── ChannelSidebar.jsx       — Kanal-Liste + User-Panel
│   │   └── MemberSidebar.jsx        — Rechte Mitglieder-Liste
│   ├── server/
│   │   ├── ServerIcon.jsx           — Icon mit Hover-Morphing
│   │   ├── CreateServerModal.jsx
│   │   └── ServerSettingsModal.jsx
│   ├── channel/
│   │   ├── ChannelList.jsx
│   │   ├── ChannelItem.jsx
│   │   ├── ChannelHeader.jsx
│   │   └── CreateChannelModal.jsx
│   ├── chat/
│   │   ├── MessageList.jsx          — Virtualisierte Liste
│   │   ├── MessageGroup.jsx         — Gruppierte Nachrichten
│   │   ├── Message.jsx
│   │   ├── MessageInput.jsx
│   │   ├── MessageActions.jsx       — Hover-Actions (React, Reply, More)
│   │   ├── ReactionBar.jsx
│   │   └── EmojiPicker.jsx
│   ├── voice/
│   │   ├── VoiceChannel.jsx         — LiveKit Room-Wrapper
│   │   ├── VoiceControls.jsx        — Mute/Deafen/Leave
│   │   ├── ParticipantTile.jsx
│   │   └── SpeakingIndicator.jsx
│   ├── streaming/
│   │   ├── StreamView.jsx           — Viewer-Layout
│   │   └── ScreenShareTile.jsx
│   ├── user/
│   │   ├── UserPanel.jsx            — Unten in Channel-Sidebar
│   │   ├── UserAvatar.jsx           — Avatar + Status-Dot
│   │   ├── UserPopover.jsx          — Klick auf Avatar
│   │   └── StatusSelector.jsx
│   ├── settings/
│   │   ├── SettingsModal.jsx        — Vollbild Settings-Shell
│   │   ├── AccountSettings.jsx
│   │   ├── ProfileSettings.jsx
│   │   ├── AppearanceSettings.jsx
│   │   └── NotificationSettings.jsx
│   ├── modals/
│   │   ├── ConfirmModal.jsx
│   │   ├── InviteModal.jsx
│   │   └── Backdrop.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Tooltip.jsx
│       ├── ContextMenu.jsx
│       ├── Toast.jsx
│       └── EmptyState.jsx
├── context/
│   ├── index.js
│   ├── AuthContext.jsx
│   ├── ServerContext.jsx            — Aktiver Server/Channel
│   └── VoiceContext.jsx             — LiveKit Connection State
├── hooks/
│   ├── index.js
│   ├── useAuth.js
│   ├── useServer.js
│   ├── useChannel.js
│   ├── useMessages.js               — Firestore onSnapshot
│   ├── useVoice.js                  — LiveKit Room
│   └── usePresence.js              — Online-Status
├── lib/
│   ├── firebase/
│   │   ├── config.js
│   │   ├── auth.js                  — Auth-Helfer
│   │   ├── firestore.js             — DB-Helfer
│   │   └── storage.js               — Upload-Helfer
│   ├── livekit/
│   │   └── client.js               — Room-Setup
│   ├── ui/
│   │   └── animationVariants.js
│   └── utils/
│       ├── formatTime.js
│       ├── idUtils.js
│       └── permissions.js
├── public/
│   ├── fonts/ (Geist)
│   └── icons/
├── .claude/                         — Dieses Verzeichnis
├── .env.local
├── jsconfig.json
├── next.config.mjs
├── postcss.config.mjs
└── tailwind.config.js
```

---

## Firestore Datenmodell

### `/users/{userId}`
```js
{
  uid: string,
  displayName: string,
  email: string,
  avatar: string | null,       // Firebase Storage URL
  banner: string | null,       // Profilbanner URL
  bio: string,
  status: "online" | "idle" | "dnd" | "invisible",
  customStatus: string,        // "Gerade am Coden 🎧"
  createdAt: Timestamp,
  lastSeen: Timestamp,
  settings: {
    theme: "dark",             // nur dark vorerst
    compactMode: boolean,
    fontSize: "small" | "medium" | "large",
    notifications: {
      desktop: boolean,
      mentions: boolean,
      sounds: boolean
    }
  }
}
```

### `/servers/{serverId}`
```js
{
  id: string,
  name: string,
  icon: string | null,         // Firebase Storage URL
  banner: string | null,
  ownerId: string,
  description: string,
  memberCount: number,         // denormalisiert
  inviteCode: string,          // Default-Invite (permanent)
  createdAt: Timestamp,
  settings: {
    publicJoin: boolean,
    verificationLevel: "none" | "low" | "medium" | "high"
  }
}
```

### `/servers/{serverId}/members/{userId}`
```js
{
  userId: string,
  displayName: string | null,  // Server-spezifischer Nickname
  roles: string[],             // ["admin", "moderator"] oder []
  joinedAt: Timestamp,
  muted: boolean,
  deafened: boolean
}
```

### `/servers/{serverId}/channels/{channelId}`
```js
{
  id: string,
  name: string,
  type: "text" | "voice" | "announcement",
  categoryId: string | null,
  position: number,            // Reihenfolge
  topic: string,               // Kanal-Beschreibung
  slowMode: number,            // Sekunden (0 = deaktiviert)
  nsfw: boolean,
  createdAt: Timestamp,
  lastMessageAt: Timestamp | null,
  // Für Voice-Kanäle:
  userLimit: number,           // 0 = unbegrenzt
  bitrate: number              // 64000 default
}
```

### `/servers/{serverId}/categories/{categoryId}`
```js
{
  id: string,
  name: string,
  position: number,
  collapsed: boolean
}
```

### `/servers/{serverId}/channels/{channelId}/messages/{messageId}`
```js
{
  id: string,
  content: string,
  authorId: string,
  authorName: string,          // denormalisiert (Snapshot)
  authorAvatar: string | null, // denormalisiert
  type: "default" | "system" | "reply",
  replyTo: {
    messageId: string,
    authorId: string,
    authorName: string,
    content: string            // preview (erste 100 Zeichen)
  } | null,
  attachments: [
    {
      url: string,
      type: "image" | "file",
      name: string,
      size: number
    }
  ],
  reactions: {
    "👍": { count: number, users: string[] },
    "❤️": { count: number, users: string[] }
    // ...
  },
  createdAt: Timestamp,
  editedAt: Timestamp | null,
  deleted: boolean             // soft delete
}
```

### `/invites/{inviteCode}`
```js
{
  code: string,
  serverId: string,
  createdBy: string,           // userId
  expiresAt: Timestamp | null, // null = permanent
  maxUses: number | null,      // null = unbegrenzt
  uses: number,
  createdAt: Timestamp
}
```

### `/presence/{userId}` (Real-time)
```js
{
  status: "online" | "offline",
  lastSeen: Timestamp,
  voiceChannelId: string | null,
  serverId: string | null      // Wo der Nutzer gerade ist
}
```

---

## Firebase Security Rules (Grundgerüst)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User-Profil: Nutzer kann nur eigenes bearbeiten
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Server: Lesen nur für Mitglieder
    match /servers/{serverId} {
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/servers/$(serverId)/members/$(request.auth.uid));
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        get(/databases/$(database)/documents/servers/$(serverId)).data.ownerId == request.auth.uid;

      // Members: Nur Owner/Admin kann schreiben
      match /members/{userId} {
        allow read: if request.auth != null &&
          exists(/databases/$(database)/documents/servers/$(serverId)/members/$(request.auth.uid));
        allow write: if request.auth != null && (
          request.auth.uid == userId ||
          get(/databases/$(database)/documents/servers/$(serverId)).data.ownerId == request.auth.uid
        );
      }

      // Channels
      match /channels/{channelId} {
        allow read: if request.auth != null &&
          exists(/databases/$(database)/documents/servers/$(serverId)/members/$(request.auth.uid));
        allow write: if request.auth != null &&
          get(/databases/$(database)/documents/servers/$(serverId)).data.ownerId == request.auth.uid;

        // Messages
        match /messages/{messageId} {
          allow read: if request.auth != null &&
            exists(/databases/$(database)/documents/servers/$(serverId)/members/$(request.auth.uid));
          allow create: if request.auth != null &&
            request.resource.data.authorId == request.auth.uid &&
            exists(/databases/$(database)/documents/servers/$(serverId)/members/$(request.auth.uid));
          allow update, delete: if request.auth != null &&
            resource.data.authorId == request.auth.uid;
        }
      }
    }

    // Invites: Öffentlich lesbar (für Beitritt-Flow), nur Auth-User erstellen
    match /invites/{code} {
      allow read: if true;
      allow create: if request.auth != null;
    }

    // Presence
    match /presence/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## LiveKit Integration

### Token-Endpoint (`app/api/livekit-token/route.js`)
```js
import { AccessToken } from "livekit-server-sdk";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");
  const userId = searchParams.get("userId");
  const userName = searchParams.get("userName");

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: userId, name: userName }
  );

  token.addGrant({
    roomJoin: true,
    room: channelId,
    canPublish: true,
    canSubscribe: true,
    canPublishSources: ["camera", "microphone", "screen_share"]
  });

  return Response.json({ token: await token.toJwt() });
}
```

### Environment-Variablen
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# LiveKit
NEXT_PUBLIC_LIVEKIT_URL=wss://your-app.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

---

## Contexts & State Management

### AuthContext — User-Auth-State
- `user`: Firebase Auth User
- `userProfile`: Firestore User-Dokument
- `loading`: bool
- `signIn / signUp / signOut`

### ServerContext — Aktiver Navigation-State
- `activeServerId`: string
- `activeChannelId`: string
- `servers`: [] (Liste aller Server des Nutzers)
- `activeServer`: Objekt
- `activeChannel`: Objekt
- `members`: []
- `setActiveServer / setActiveChannel`

### VoiceContext — LiveKit State
- `room`: LiveKit Room
- `isConnected`: bool
- `participants`: []
- `isMuted`: bool
- `isDeafened`: bool
- `isScreenSharing`: bool
- `connect / disconnect / toggleMute / toggleDeafen / startScreenShare`

---

## Real-time Patterns

### Nachrichten (Firestore onSnapshot)
```js
// hooks/useMessages.js
export function useMessages(serverId, channelId) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!serverId || !channelId) return;

    const q = query(
      collection(db, "servers", serverId, "channels", channelId, "messages"),
      where("deleted", "==", false),
      orderBy("createdAt", "asc"),
      limitToLast(50)
    );

    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [serverId, channelId]);

  return messages;
}
```

### Online-Presence (Firestore)
- Beim App-Mount: `/presence/{userId}` auf `online` setzen
- Firebase `onDisconnect()` setzt es auf `offline`
- Andere Nutzer subscriben auf Presence-Dokumente der Server-Mitglieder

---

## Message-Gruppierung Logik

```js
// lib/utils/groupMessages.js
export function groupMessages(messages) {
  return messages.reduce((groups, msg, i) => {
    const prev = messages[i - 1];
    const sameAuthor = prev?.authorId === msg.authorId;
    const within7Min = prev &&
      (msg.createdAt.toDate() - prev.createdAt.toDate()) < 7 * 60 * 1000;

    if (sameAuthor && within7Min) {
      groups[groups.length - 1].messages.push(msg);
    } else {
      groups.push({ authorId: msg.authorId, messages: [msg] });
    }
    return groups;
  }, []);
}
```

---

## Routing-Struktur

```
/                           → Landing Page
/sign-in                    → Login
/sign-up                    → Registrierung
/forgot-password            → Passwort zurücksetzen
/app                        → App-Shell (redirect → erster Server oder leer)
/app/servers/[serverId]     → Server (redirect → ersten Textkanal)
/app/servers/[serverId]/[channelId] → Kanal-Ansicht
/invite/[code]              → Einladungslink-Seite
```

---

## Performance-Überlegungen

### Nachrichtenlistenliste
- Virtualisierte Scroll-Liste (react-virtuoso oder eigene Implementierung)
- Nur sichtbare Nachrichten im DOM
- Infinite scroll nach oben (ältere Nachrichten laden)

### Images
- Firebase Storage URLs direkt (kein next/image Optimizer für externe URLs notwendig)
- Lazy loading für Attachments

### Firestore Reads sparen
- Server-Metadaten in Context halten (nicht re-fetchen)
- Member-Liste nur laden wenn Member-Sidebar offen
- Presence nur für sichtbare Mitglieder subscriben

---

## Permissions-System (einfach)

```js
// lib/utils/permissions.js
export const Permissions = {
  MANAGE_SERVER: "manage_server",
  MANAGE_CHANNELS: "manage_channels",
  MANAGE_MEMBERS: "manage_members",
  SEND_MESSAGES: "send_messages",
  ATTACH_FILES: "attach_files"
};

export function hasPermission(member, serverOwnerId, permission) {
  if (member.userId === serverOwnerId) return true; // Owner hat alles
  if (member.roles.includes("admin")) return true;
  if (member.roles.includes("moderator") && [
    Permissions.MANAGE_MEMBERS
  ].includes(permission)) return true;
  return false;
}
```
