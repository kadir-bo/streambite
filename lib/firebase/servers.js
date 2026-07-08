import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  documentId,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
} from "firebase/firestore";
import app from "@/lib/firebase/config";
import { generateInviteCode } from "@/lib/utils";

function getDB() {
  if (!app) throw new Error("Firebase not available server-side");
  return getFirestore(app);
}

async function createDefaultChannels(serverId) {
  const db = getDB();
  const batch = writeBatch(db);

  const textCatRef = doc(collection(db, "servers", serverId, "categories"));
  batch.set(textCatRef, {
    id: textCatRef.id,
    name: "TEXTKANÄLE",
    position: 0,
    collapsed: false,
    type: "text",
  });

  const voiceCatRef = doc(collection(db, "servers", serverId, "categories"));
  batch.set(voiceCatRef, {
    id: voiceCatRef.id,
    name: "SPRACHKANÄLE",
    position: 1,
    collapsed: false,
    type: "voice",
  });

  const generalRef = doc(collection(db, "servers", serverId, "channels"));
  batch.set(generalRef, {
    id: generalRef.id,
    name: "general",
    type: "text",
    categoryId: textCatRef.id,
    position: 0,
    topic: "Allgemeiner Gesprächskanal",
    createdAt: serverTimestamp(),
  });

  const voiceRef = doc(collection(db, "servers", serverId, "channels"));
  batch.set(voiceRef, {
    id: voiceRef.id,
    name: "Allgemein",
    type: "voice",
    categoryId: voiceCatRef.id,
    position: 0,
    topic: null,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return generalRef.id;
}

export async function createServer(userId, name) {
  const db = getDB();
  const serverRef = doc(collection(db, "servers"));
  const serverId = serverRef.id;
  const inviteCode = generateInviteCode();

  const batch = writeBatch(db);

  batch.set(serverRef, {
    id: serverId,
    name,
    iconUrl: null,
    ownerId: userId,
    inviteCode,
    memberCount: 1,
    memberIds: [userId],
    createdAt: serverTimestamp(),
  });

  batch.set(doc(db, "servers", serverId, "members", userId), {
    userId,
    roles: ["owner"],
    joinedAt: serverTimestamp(),
  });

  batch.update(doc(db, "users", userId), {
    servers: arrayUnion(serverId),
  });

  batch.set(doc(db, "invites", inviteCode), {
    code: inviteCode,
    serverId,
    createdBy: userId,
    expiresAt: null,
    maxUses: null,
    uses: 0,
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  const defaultChannelId = await createDefaultChannels(serverId);
  return { serverId, defaultChannelId, inviteCode };
}

export async function joinServerByCode(inviteCode, userId) {
  const db = getDB();

  const inviteSnap = await getDoc(doc(db, "invites", inviteCode));
  if (!inviteSnap.exists()) throw new Error("Ungültiger Einladungscode");

  const invite = inviteSnap.data();
  const { serverId, maxUses, uses } = invite;

  if (maxUses && uses >= maxUses)
    throw new Error("Diese Einladung ist abgelaufen");

  const memberSnap = await getDoc(
    doc(db, "servers", serverId, "members", userId),
  );
  if (memberSnap.exists()) return serverId;

  const batch = writeBatch(db);

  batch.set(doc(db, "servers", serverId, "members", userId), {
    userId,
    roles: [],
    joinedAt: serverTimestamp(),
  });

  batch.update(doc(db, "servers", serverId), {
    memberIds: arrayUnion(userId),
    memberCount: increment(1),
  });

  batch.update(doc(db, "users", userId), {
    servers: arrayUnion(serverId),
  });

  batch.update(doc(db, "invites", inviteCode), {
    uses: increment(1),
  });

  await batch.commit();
  return serverId;
}

export async function leaveServer(serverId, userId) {
  const db = getDB();
  const batch = writeBatch(db);

  batch.delete(doc(db, "servers", serverId, "members", userId));
  batch.update(doc(db, "servers", serverId), {
    memberIds: arrayRemove(userId),
    memberCount: increment(-1),
  });
  batch.update(doc(db, "users", userId), {
    servers: arrayRemove(serverId),
  });

  await batch.commit();
}

export function subscribeToUserServers(serverIds, callback) {
  if (!app || !serverIds?.length) {
    callback([]);
    return () => {};
  }
  const db = getFirestore(app);
  const servers = new Map();
  let cancelled = false;
  const activeUnsubs = new Map();

  function emit() {
    callback(
      serverIds.filter((id) => servers.has(id)).map((id) => servers.get(id)),
    );
  }

  // Right after creating/joining a server, the local user doc updates
  // (and triggers this subscription) slightly before the batched write to
  // the server doc's memberIds is guaranteed visible to a brand-new listen
  // request. That shows up as a transient permission-denied - retry a few
  // times before actually dropping the server.
  function attach(serverId, retriesLeft = 3) {
    const unsub = onSnapshot(
      doc(db, "servers", serverId),
      (snap) => {
        if (snap.exists())
          servers.set(serverId, { id: snap.id, ...snap.data() });
        else servers.delete(serverId);
        emit();
      },
      (err) => {
        if (err.code === "permission-denied" && retriesLeft > 0) {
          setTimeout(() => {
            if (!cancelled) attach(serverId, retriesLeft - 1);
          }, 800);
          return;
        }
        console.error(`[listener] servers/${serverId}:`, err.code, err.message);
        servers.delete(serverId);
        emit();
      },
    );
    activeUnsubs.set(serverId, unsub);
  }

  serverIds.forEach((id) => attach(id));

  return () => {
    cancelled = true;
    activeUnsubs.forEach((u) => u());
  };
}

export function subscribeToServerChannels(serverId, onChannels, onCategories) {
  if (!app) {
    onChannels([]);
    onCategories([]);
    return () => {};
  }
  const db = getFirestore(app);

  let cancelled = false;

  const unsubChannels = onSnapshot(
    query(collection(db, "servers", serverId, "channels"), orderBy("position")),
    (snap) => {
      if (!cancelled)
        onChannels(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (err) => {
      if (err.code === "permission-denied") {
        cancelled = true;
        unsubChannels();
        unsubCats();
        onChannels([]);
        onCategories([]);
        return;
      }
      console.error(
        `[listener] servers/${serverId}/channels:`,
        err.code,
        err.message,
      );
    },
  );

  const unsubCats = onSnapshot(
    query(
      collection(db, "servers", serverId, "categories"),
      orderBy("position"),
    ),
    (snap) => {
      if (!cancelled)
        onCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (err) => {
      if (err.code === "permission-denied") {
        cancelled = true;
        unsubChannels();
        unsubCats();
        onChannels([]);
        onCategories([]);
        return;
      }
      console.error(
        `[listener] servers/${serverId}/categories:`,
        err.code,
        err.message,
      );
    },
  );

  return () => {
    cancelled = true;
    unsubChannels();
    unsubCats();
  };
}

/**
 * Subscribe to server members with ~5 listeners instead of 2×N:
 *  - 1 collection listener on servers/{serverId}/members (roles)
 *  - chunked documentId-in queries on the users collection (profiles + status)
 *
 * Firestore's `in` queries are limited to 30 values each, so 100 members
 * need at most 4 chunks → 5 listeners total instead of 200.
 */
export function subscribeToServerMembers(serverId, memberIds, callback) {
  if (!app || !memberIds?.length) {
    callback([]);
    return () => {};
  }
  const db = getFirestore(app);
  const profiles = new Map();
  const memberMeta = new Map();
  const ids = memberIds.slice(0, 100);
  let cancelled = false;
  const unsubs = [];

  function emit() {
    if (cancelled) return;
    callback(
      ids
        .filter((id) => profiles.has(id))
        .map((id) => ({
          ...profiles.get(id),
          roles: memberMeta.get(id)?.roles ?? [],
        })),
    );
  }

  // Chunked document ID queries (max 30 per chunk → 4 chunks for 100 members)
  const CHUNK_SIZE = 30;
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const q = query(collection(db, "users"), where(documentId(), "in", chunk));
    const unsub = onSnapshot(
      q,
      (snap) => {
        snap.docs.forEach((d) =>
          profiles.set(d.id, { id: d.id, ...d.data() }),
        );
        emit();
      },
      (err) => console.error(`[listener] users (chunk):`, err.code, err.message),
    );
    unsubs.push(unsub);
  }

  // Single collection listener for member metadata (roles)
  const unsubMeta = onSnapshot(
    query(collection(db, "servers", serverId, "members")),
    (snap) => {
      snap.docs.forEach((d) => memberMeta.set(d.id, d.data()));
      emit();
    },
    (err) =>
      console.error(
        `[listener] servers/${serverId}/members:`,
        err.code,
        err.message,
      ),
  );
  unsubs.push(unsubMeta);

  return () => {
    cancelled = true;
    unsubs.forEach((u) => u());
  };
}

export async function setMemberRoles(serverId, uid, roles) {
  const db = getDB();
  await updateDoc(doc(db, "servers", serverId, "members", uid), { roles });
}

/**
 * Subscribe to the current user's own roles on a given server.
 * Returns an unsubscribe function.
 */
export function subscribeToMemberRoles(serverId, uid, callback) {
  const db = getFirestore(app);
  return onSnapshot(
    doc(db, "servers", serverId, "members", uid),
    (snap) => {
      callback(snap.exists() ? (snap.data().roles ?? []) : []);
    },
  );
}

// Owner-only removal of another member from the server (vs. leaveServer, which is self-service).
export async function kickMember(serverId, uid) {
  const db = getDB();
  const batch = writeBatch(db);
  batch.delete(doc(db, "servers", serverId, "members", uid));
  batch.update(doc(db, "servers", serverId), {
    memberIds: arrayRemove(uid),
    memberCount: increment(-1),
  });
  batch.update(doc(db, "users", uid), { servers: arrayRemove(serverId) });
  await batch.commit();
}

export async function createChannel(serverId, name, type, categoryId) {
  const db = getDB();
  const ref = doc(collection(db, "servers", serverId, "channels"));
  await setDoc(ref, {
    id: ref.id,
    name,
    type,
    categoryId,
    position: Date.now(),
    topic: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateChannel(serverId, channelId, data) {
  const db = getDB();
  await updateDoc(doc(db, "servers", serverId, "channels", channelId), data);
}

// A server must always keep at least one text and one voice channel, so the
// channel list (and therefore voice presence / chat) is never left empty.
export async function deleteChannel(serverId, channelId) {
  const db = getDB();
  const channelRef = doc(db, "servers", serverId, "channels", channelId);
  const snap = await getDoc(channelRef);
  if (!snap.exists()) return;

  const { type } = snap.data();
  const sameTypeSnap = await getDocs(
    query(
      collection(db, "servers", serverId, "channels"),
      where("type", "==", type),
    ),
  );
  if (sameTypeSnap.size <= 1) {
    throw new Error(
      type === "voice"
        ? "Der letzte Sprachkanal kann nicht gelöscht werden."
        : "Der letzte Textkanal kann nicht gelöscht werden.",
    );
  }

  await deleteDoc(channelRef);
}

/* ---- Voice channel presence (mini avatars in the sidebar, Discord-style) ---- */

function voicePresenceId(serverId, channelId, uid) {
  return `${serverId}__${channelId}__${uid}`;
}

export async function joinVoicePresence(serverId, channelId, uid, profile) {
  const db = getDB();
  await setDoc(
    doc(db, "voicePresence", voicePresenceId(serverId, channelId, uid)),
    {
      serverId,
      channelId,
      uid,
      name: profile?.name ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
      joinedAt: serverTimestamp(),
    },
  );
}

export async function leaveVoicePresence(serverId, channelId, uid) {
  const db = getDB();
  await deleteDoc(
    doc(db, "voicePresence", voicePresenceId(serverId, channelId, uid)),
  ).catch(() => {});
}

// Single query per server; grouped client-side by channelId so the sidebar
// can show mini avatars under every voice channel without one listener each.
export function subscribeToServerVoicePresence(serverId, callback) {
  if (!app || !serverId) {
    callback({});
    return () => {};
  }
  const db = getFirestore(app);
  return onSnapshot(
    query(collection(db, "voicePresence"), where("serverId", "==", serverId)),
    (snap) => {
      const byChannel = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (!byChannel[data.channelId]) byChannel[data.channelId] = [];
        byChannel[data.channelId].push(data);
      });
      callback(byChannel);
    },
    (err) => {
      if (err.code !== "permission-denied") {
        console.error(
          `[listener] voicePresence (server ${serverId}):`,
          err.code,
          err.message,
        );
      }
      callback({});
    },
  );
}

export async function getInviteInfo(code) {
  if (!app) return null;
  try {
    const db = getFirestore(app);
    const inviteSnap = await getDoc(doc(db, "invites", code));
    if (!inviteSnap.exists()) return null;
    const invite = inviteSnap.data();
    const serverSnap = await getDoc(doc(db, "servers", invite.serverId));
    if (!serverSnap.exists()) return null;
    return { invite, server: { id: serverSnap.id, ...serverSnap.data() } };
  } catch {
    return null;
  }
}

export async function updateServer(serverId, data) {
  const db = getDB();
  await updateDoc(doc(db, "servers", serverId), data);
}

// Lets any member (not just the owner) bump a channel's lastMessageAt for unread indicators.
export async function touchChannelLastMessage(serverId, channelId) {
  const db = getDB();
  await updateDoc(doc(db, "servers", serverId, "channels", channelId), {
    lastMessageAt: serverTimestamp(),
  });
}

/* ---- Pending server invites (shown as a rail icon until joined/declined) ---- */

export async function inviteToServer(fromUid, fromName, toUid, server) {
  const db = getDB();
  const toRef = doc(db, "users", toUid);
  const toSnap = await getDoc(toRef);
  const existing = toSnap.data()?.pendingInvites ?? [];

  // One pending invite per server - replace rather than duplicate.
  const next = existing.filter((inv) => inv.serverId !== server.id);
  next.push({
    serverId: server.id,
    serverName: server.name,
    serverIconUrl: server.iconUrl ?? null,
    inviteCode: server.inviteCode,
    invitedBy: fromUid,
    invitedByName: fromName,
  });

  await updateDoc(toRef, { pendingInvites: next });
}

export async function declineServerInvite(uid, serverId) {
  const db = getDB();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const existing = snap.data()?.pendingInvites ?? [];
  await updateDoc(ref, {
    pendingInvites: existing.filter((inv) => inv.serverId !== serverId),
  });
}

export async function acceptServerInvite(uid, invite) {
  const newServerId = await joinServerByCode(invite.inviteCode, uid);
  await declineServerInvite(uid, invite.serverId);
  return newServerId;
}

export async function deleteServer(serverId, userId) {
  const db = getDB();
  const batch = writeBatch(db);

  batch.delete(doc(db, "servers", serverId));
  batch.delete(doc(db, "servers", serverId, "members", userId));
  batch.update(doc(db, "users", userId), {
    servers: arrayRemove(serverId),
  });

  await batch.commit();
}
