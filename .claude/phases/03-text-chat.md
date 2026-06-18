# Phase 3 — Text Chat

## Ziel
Voll funktionierender Echtzeit-Text-Chat mit Message-Gruppierung, Reaktionen,
Antworten (Reply), Datei-Uploads, Bearbeiten/Löschen und Markdown-Rendering.
Ende der Phase: Der Kern der App funktioniert.

---

## Schritt 3.1 — Message List

`components/chat/MessageList.jsx`:

Virtualisierte Scroll-Liste für Performance.
Scroll-Position: Beim Laden immer ans Ende springen.
Bei neuer Nachricht vom eingeloggten Nutzer: ans Ende scrollen.
Bei neuer Nachricht von anderem Nutzer: "Neue Nachricht ↓" Toast.

```jsx
// Grundstruktur
<div className="flex-1 overflow-y-auto flex flex-col">
  {/* Kanal-Willkommensnachricht */}
  <ChannelWelcome channel={activeChannel} />

  {/* Grupierte Nachrichten */}
  {groupedMessages.map((group) => (
    <MessageGroup key={group.messages[0].id} group={group} />
  ))}
</div>
```

Kanal-Willkommensnachricht (leerer Kanal):
- Großes Hash-Icon (48px, zinc-500)
- "Willkommen in #channel-name"
- "Das ist der Anfang des #channel-name Kanals."

---

## Schritt 3.2 — Message Group & Message

`components/chat/MessageGroup.jsx`:
```jsx
// Erste Nachricht: Avatar + Username + Timestamp
// Folgenachrichten: nur Inhalt (Avatar-Platz freigehalten)
```

`components/chat/Message.jsx`:

**Hover State** (Framer Motion):
```jsx
<motion.div
  onHoverStart={() => setHovered(true)}
  onHoverEnd={() => setHovered(false)}
>
  {/* Nachrichteninhalt */}
  <AnimatePresence>
    {hovered && <MessageActions />}
  </AnimatePresence>
</motion.div>
```

Inline-Timestamp bei gruppierten Nachrichten:
```jsx
// Erscheint links, wenn die grouped message gehoverd wird
<AnimatePresence>
  {hovered && (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-[11px] font-mono text-zinc-600 absolute left-0"
    >
      {formatTime(message.createdAt)}
    </motion.span>
  )}
</AnimatePresence>
```

---

## Schritt 3.3 — Message Actions

`components/chat/MessageActions.jsx`:
- Erscheint als schwebende Toolbar rechts oben beim Hover
- Buttons: Emoji-Reaktion (+), Antworten, Bearbeiten (nur eigene), Mehr (drei Punkte)
- `bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl`
- Framer Motion: `initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}`
- "Mehr"-Dropdown: Nachricht kopieren, Link kopieren, Löschen (eigene/Admin)

---

## Schritt 3.4 — Message Input

`components/chat/MessageInput.jsx`:

```jsx
<div className="px-4 pb-6 pt-2 shrink-0">
  {/* Reply-Preview (wenn aktiv) */}
  <AnimatePresence>
    {replyTarget && <ReplyPreview target={replyTarget} />}
  </AnimatePresence>

  {/* Input-Container */}
  <motion.div
    className="flex items-end gap-2 bg-zinc-800 rounded-xl px-4 py-3"
    whileFocusWithin={{
      borderColor: "rgba(99,102,241,0.5)",
      boxShadow: "0 0 0 2px rgba(99,102,241,0.15)"
    }}
    style={{ border: "1px solid transparent" }}
  >
    {/* Attachment-Button */}
    <button><PaperclipIcon size={20} /></button>

    {/* Textarea (auto-resize) */}
    <textarea
      placeholder={`Schreib etwas in #${activeChannel.name}`}
      rows={1}
    />

    {/* Emoji + Send */}
  </motion.div>
</div>
```

Auto-resize TextArea:
- `rows={1}` initial
- Bei jeder Änderung: Höhe auf scrollHeight setzen
- Max-Höhe: ~30% des Viewports

Send per Enter (Shift+Enter für Zeilenumbruch).

Nachricht senden:
```js
async function sendMessage(content, replyTo) {
  await addDoc(
    collection(db, "servers", serverId, "channels", channelId, "messages"),
    {
      content: content.trim(),
      authorId: user.uid,
      authorName: userProfile.displayName,
      authorAvatar: userProfile.avatar,
      type: replyTo ? "reply" : "default",
      replyTo: replyTo || null,
      attachments: [],
      reactions: {},
      createdAt: serverTimestamp(),
      editedAt: null,
      deleted: false
    }
  );
}
```

---

## Schritt 3.5 — Reply System

`components/chat/ReplyPreview.jsx`:
- Leiste über dem Input mit "Antwort auf @Username"
- Vorschau der Original-Nachricht (erste 80 Zeichen)
- "X" zum Abbrechen
- Framer Motion: height 0 → auto animation

In `Message.jsx` bei Reply-Typ:
- Kompakter Reply-Header über der Nachricht
- Klick springt zur Original-Nachricht + Highlight-Animation

---

## Schritt 3.6 — Nachrichten bearbeiten

In-Place-Bearbeitung:
1. "Bearbeiten" aus Message-Actions klicken
2. Input-Feld ersetzt den Nachrichtentext direkt
3. Enter zum Speichern, Escape zum Abbrechen
4. "bearbeitet"-Label erscheint neben dem Timestamp

```js
async function editMessage(messageId, newContent) {
  await updateDoc(
    doc(db, "servers", serverId, "channels", channelId, "messages", messageId),
    {
      content: newContent,
      editedAt: serverTimestamp()
    }
  );
}
```

---

## Schritt 3.7 — Nachrichten löschen

```js
async function deleteMessage(messageId) {
  // Soft delete (content behalten für Moderation, UI zeigt "Nachricht gelöscht")
  await updateDoc(..., { deleted: true, content: "" });
}
```

Confirm-Dialog: `components/modals/ConfirmModal.jsx`
- Kurzer Text: "Möchtest du diese Nachricht wirklich löschen?"
- Bestätigen = rot / Abbrechen = neutral

---

## Schritt 3.8 — Emoji-Reaktionen

`components/chat/ReactionBar.jsx`:
- Zeigt vorhandene Reaktionen: `😂 3`, `👍 2`
- Hover: zeigt welche Nutzer reagiert haben (Tooltip)
- Eigene Reaktion: `bg-white/10 border border-white/20` — neutral, heller als der Rest
- Klick auf vorhandene Reaktion: toggle (hinzufügen/entfernen)

```js
async function toggleReaction(messageId, emoji) {
  const reactionPath = `reactions.${emoji}`;
  const hasReacted = message.reactions[emoji]?.users.includes(user.uid);

  if (hasReacted) {
    await updateDoc(msgRef, {
      [`${reactionPath}.count`]: increment(-1),
      [`${reactionPath}.users`]: arrayRemove(user.uid)
    });
  } else {
    await updateDoc(msgRef, {
      [`${reactionPath}.count`]: increment(1),
      [`${reactionPath}.users`]: arrayUnion(user.uid)
    });
  }
}
```

`components/chat/EmojiPicker.jsx`:
- Kleines Dropdown-Panel mit häufigsten Emojis
- Suchfeld
- Kategorien (keine externe Library nötig für MVP)

---

## Schritt 3.9 — Datei-Uploads

`lib/firebase/storage.js`:
```js
export async function uploadAttachment(serverId, channelId, file) {
  const path = `attachments/${serverId}/${channelId}/${Date.now()}_${file.name}`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file);
  return getDownloadURL(ref);
}
```

Im MessageInput:
- Paperclip-Icon öffnet File-Picker
- Vorschau vor dem Senden (Thumbnail für Bilder)
- Progress-Indicator während Upload (Framer Motion width-Animation)
- Max. Dateigröße: 8MB (Firebase Storage Free Tier)

In Message-Rendering:
- Bilder: `<img>` mit lazy loading, klickbar für Vollbild
- Andere Dateien: Datei-Icon + Name + Größe

---

## Schritt 3.10 — Markdown Rendering (Basic)

Eigene Mini-Implementierung (keine externe Library für MVP):
```js
// lib/utils/parseMarkdown.js
// Unterstützte Syntax:
// **bold**
// *italic*
// `inline code`
// ~~strikethrough~~
// ```code block```
// > Zitat
// @username (Mention) → bg-white/10 + text-zinc-100 (hell, aber kein Farb-Akzent)
// #channel-name → Link zum Kanal
```

Sicherheitsregel: User-Input wird **nie** als raw HTML gerendert.
Nur bekannte Markdown-Tokens werden transformiert.

---

## Schritt 3.11 — Nachrichten laden (Pagination)

Initial: letzte 50 Nachrichten laden.
Infinite Scroll nach oben:
- Beim Scrolling zum Top: ältere Nachrichten nachladen (`startAfter` Query)
- Loading-Indicator oben in der Liste
- Scroll-Position beim Nachladen halten (Scroll-Anchoring)

---

## Schritt 3.12 — Unread-States

Konzept:
- Lokal in `localStorage` speichern: `{ [channelId]: lastReadMessageId }`
- Channels mit ungelesenen Nachrichten: fett + weißer Dot-Indikator
- Bei Kanal öffnen: als gelesen markieren

---

## Checkpoints

- [ ] Nachrichten werden in Echtzeit angezeigt (onSnapshot)
- [ ] Message-Gruppierung funktioniert (selber Autor, 7-Min-Fenster)
- [ ] Nachricht senden (Enter / Button)
- [ ] Reply-System funktioniert (Vorschau + Link zur Original-Nachricht)
- [ ] Bearbeiten funktioniert (In-Place, Escape abbricht)
- [ ] Löschen mit Confirm-Dialog
- [ ] Emoji-Reaktionen (toggle, Zähler)
- [ ] Datei-Upload (Bilder + Dateien)
- [ ] Markdown (bold, italic, code) gerendert
- [ ] Hover-Actions erscheinen mit Animation
- [ ] Message-Input auto-resize
- [ ] Scroll-to-Bottom beim Senden
- [ ] Unread-Indicators in Channel-Liste
