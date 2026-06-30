import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  writeBatch,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import app from '@/lib/firebase/config'

function getDB() {
  if (!app) throw new Error('Firebase not available server-side')
  return getFirestore(app)
}

export async function getUserByTag(nameTag) {
  const db = getDB()
  const normalized = nameTag.toLowerCase().trim()
  const q = query(collection(db, 'users'), where('nameTag', '==', normalized))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function sendFriendRequest(fromUid, toUid) {
  if (fromUid === toUid) throw new Error('Du kannst dir selbst keine Anfrage schicken')
  const db = getDB()

  const fromSnap = await getDoc(doc(db, 'users', fromUid))
  const fromData = fromSnap.data() ?? {}

  if (fromData.friends?.includes(toUid)) throw new Error('Ihr seid bereits befreundet')
  if (fromData.outgoingRequests?.includes(toUid)) throw new Error('Anfrage bereits gesendet')

  if (fromData.incomingRequests?.includes(toUid)) {
    return acceptFriendRequest(fromUid, toUid)
  }

  const batch = writeBatch(db)
  batch.update(doc(db, 'users', fromUid), { outgoingRequests: arrayUnion(toUid) })
  batch.update(doc(db, 'users', toUid), { incomingRequests: arrayUnion(fromUid) })
  await batch.commit()
}

export async function acceptFriendRequest(myUid, fromUid) {
  const db = getDB()
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', myUid), {
    incomingRequests: arrayRemove(fromUid),
    friends: arrayUnion(fromUid),
  })
  batch.update(doc(db, 'users', fromUid), {
    outgoingRequests: arrayRemove(myUid),
    friends: arrayUnion(myUid),
  })
  await batch.commit()
}

export async function declineFriendRequest(myUid, fromUid) {
  const db = getDB()
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', myUid), { incomingRequests: arrayRemove(fromUid) })
  batch.update(doc(db, 'users', fromUid), { outgoingRequests: arrayRemove(myUid) })
  await batch.commit()
}

export async function removeFriend(myUid, friendUid) {
  const db = getDB()
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', myUid), { friends: arrayRemove(friendUid) })
  batch.update(doc(db, 'users', friendUid), { friends: arrayRemove(myUid) })
  await batch.commit()
}

// Blocking also severs any existing friendship/pending requests in both
// directions, matching how Discord treats it (you can't stay friends with
// someone you've blocked).
export async function blockUser(myUid, blockedUid) {
  const db = getDB()
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', myUid), {
    blockedUsers: arrayUnion(blockedUid),
    friends: arrayRemove(blockedUid),
    incomingRequests: arrayRemove(blockedUid),
    outgoingRequests: arrayRemove(blockedUid),
  })
  batch.update(doc(db, 'users', blockedUid), {
    friends: arrayRemove(myUid),
    incomingRequests: arrayRemove(myUid),
    outgoingRequests: arrayRemove(myUid),
  })
  await batch.commit()
}

export async function unblockUser(myUid, blockedUid) {
  const db = getDB()
  await updateDoc(doc(db, 'users', myUid), { blockedUsers: arrayRemove(blockedUid) })
}

export function subscribeToFriendUsers(uids, callback) {
  if (!app || !uids?.length) {
    callback([])
    return () => {}
  }
  const db = getFirestore(app)
  const users = new Map()

  const unsubscribers = uids.slice(0, 50).map((uid) =>
    onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) users.set(uid, { id: snap.id, ...snap.data() })
        callback(uids.filter((id) => users.has(id)).map((id) => users.get(id)))
      },
      (err) => console.error(`[listener] users/${uid}:`, err.code, err.message)
    )
  )

  return () => unsubscribers.forEach((u) => u())
}
