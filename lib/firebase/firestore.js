import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limitToLast,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction,
} from 'firebase/firestore'
import app from '@/lib/firebase/config'


function getDB() {
  if (!app) throw new Error('Firebase not available server-side')
  return getFirestore(app)
}

/* ---- User ---- */

export async function createUserDocument(uid, data) {
  const db = getDB()
  const ref = doc(db, 'users', uid)

  // Transaction: atomisch prüfen, ob das Dokument existiert → nur dann anlegen,
  // wenn nicht. Verhindert, dass ein bestehendes Dokument (z.B. nach transientem
  // getDoc-Fehler) mit setDoc überschrieben wird – was servers/friends usw. löschen würde.
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref)
    if (snap.exists()) return // Niemals ein existierendes Dokument überschreiben!

    const { generateTag } = await import('@/lib/utils')
    const tag = generateTag()
    const username = data.username ?? null
    const nameTag = username ? `${username.toLowerCase()}#${tag}` : null
    transaction.set(ref, {
      ...data,
      username,
      tag,
      nameTag,
      createdAt: serverTimestamp(),
      status: 'online',
      servers: [],
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
    })
  })
}

export async function setUsername(uid, username, tag) {
  const db = getDB()
  const { generateTag } = await import('@/lib/utils')
  const finalTag = tag ?? generateTag()
  const nameTag = `${username.toLowerCase()}#${finalTag}`
  await updateDoc(doc(db, 'users', uid), { username, tag: finalTag, nameTag })
}

export async function getUserDocument(uid) {
  const db = getDB()
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUserDocument(uid, data) {
  const db = getDB()
  await updateDoc(doc(db, 'users', uid), data)
}

// Marks a channel or DM thread as read by the current user (for unread indicators).
export async function markRead(uid, threadId) {
  const db = getDB()
  await updateDoc(doc(db, 'users', uid), { [`lastRead.${threadId}`]: serverTimestamp() })
}

export function subscribeToUser(uid, callback) {
  if (!app) return () => {}
  const db = getFirestore(app)
  const unsub = onSnapshot(
    doc(db, 'users', uid),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    (err) => {
      // permission-denied beim Logout ist erwartbar – der Listener läuft noch,
      // während die Auth-Session bereits beendet ist. Stumm abmelden, kein Error-Log.
      if (err.code === 'permission-denied') {
        unsub()
        callback(null)
        return
      }
      console.error(`[listener] users/${uid}:`, err.code, err.message)
    }
  )
  return unsub
}

/* ---- Servers ---- */

/* ---- Messages ----
 * Channel messages live at servers/{serverId}/channels/{channelId}/messages.
 * Direct messages live at dms/{dmId}/messages. Both share the same shape and
 * UI components, so every function below resolves the right path: pass a
 * falsy serverId and the dmId as channelId to operate on a DM thread.
 */

function messagesCollectionPath(serverId, channelId) {
  return serverId
    ? ['servers', serverId, 'channels', channelId, 'messages']
    : ['dms', channelId, 'messages']
}

export function subscribeToMessages(serverId, channelId, callback, msgLimit = 50) {
  if (!app) return () => {}
  const db = getFirestore(app)
  const path = messagesCollectionPath(serverId, channelId)
  const q = query(
    collection(db, ...path),
    orderBy('createdAt', 'asc'),
    limitToLast(msgLimit),
  )
  const unsub = onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      if (err.code === 'permission-denied') {
        unsub()
        callback([])
        return
      }
      console.error(`[listener] ${path.join('/')}:`, err.code, err.message)
    },
  )
  return unsub
}

export async function sendMessage(serverId, channelId, data) {
  const db = getDB()
  return addDoc(
    collection(db, ...messagesCollectionPath(serverId, channelId)),
    {
      ...data,
      createdAt: serverTimestamp(),
      editedAt: null,
      deleted: false,
    }
  )
}

export async function editMessage(serverId, channelId, messageId, content) {
  const db = getDB()
  await updateDoc(
    doc(db, ...messagesCollectionPath(serverId, channelId), messageId),
    { content, editedAt: serverTimestamp() }
  )
}

export async function deleteMessage(serverId, channelId, messageId) {
  const db = getDB()
  await updateDoc(
    doc(db, ...messagesCollectionPath(serverId, channelId), messageId),
    { deleted: true, content: '' }
  )
}

export async function toggleReaction(serverId, channelId, messageId, emoji, userId, hasReacted) {
  const db = getDB()
  const msgRef = doc(db, ...messagesCollectionPath(serverId, channelId), messageId)
  if (hasReacted) {
    await updateDoc(msgRef, {
      [`reactions.${emoji}.count`]: increment(-1),
      [`reactions.${emoji}.users`]: arrayRemove(userId),
    })
  } else {
    await updateDoc(msgRef, {
      [`reactions.${emoji}.count`]: increment(1),
      [`reactions.${emoji}.users`]: arrayUnion(userId),
    })
  }
}
