import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import app from "@/lib/firebase/config";

function getDB() {
  if (!app) throw new Error("Firebase not available server-side");
  return getFirestore(app);
}

export function getDmId(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

export async function getDm(dmId) {
  const db = getDB();
  const snap = await getDoc(doc(db, "dms", dmId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Ensures a dms/{dmId} doc exists for this pair and returns its id. Also
// un-hides it for the caller in case they'd previously closed it - starting
// a chat again is an explicit "reopen" signal.
export async function ensureDm(myUid, otherUid) {
  const db = getDB();
  const dmId = getDmId(myUid, otherUid);
  const ref = doc(db, "dms", dmId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [myUid, otherUid],
      lastMessage: null,
      updatedAt: serverTimestamp(),
      hiddenBy: [],
    });
  } else if (snap.data().hiddenBy?.includes(myUid)) {
    await updateDoc(ref, { hiddenBy: arrayRemove(myUid) });
  }
  return dmId;
}

export async function touchDmLastMessage(dmId, lastMessage) {
  const db = getDB();
  await updateDoc(doc(db, "dms", dmId), {
    lastMessage,
    updatedAt: serverTimestamp(),
    // A new message reopens the conversation for whoever had closed it.
    hiddenBy: [],
  });
}

// "Closes" a DM from the caller's own sidebar - like Discord, this doesn't
// delete any messages or affect the other participant; it just hides the
// conversation until a new message arrives or either side reopens it.
export async function closeDm(dmId, myUid) {
  const db = getDB();
  await updateDoc(doc(db, "dms", dmId), { hiddenBy: arrayUnion(myUid) });
}

// Subscribes to every DM conversation the user is part of, sorted by most recent activity.
export function subscribeToUserDms(uid, callback) {
  if (!app) return () => {};
  const db = getFirestore(app);
  const q = query(
    collection(db, "dms"),
    where("participants", "array-contains", uid),
  );
  return onSnapshot(
    q,
    (snap) => {
      const dms = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((dm) => !dm.hiddenBy?.includes(uid) && dm.lastMessage != null)
        .sort(
          (a, b) =>
            (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0),
        );
      callback(dms);
    },
    (err) => console.error("[listener] dms:", err.code, err.message),
  );
}
