import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import app from '@/lib/firebase/config'

function getStorageInstance() {
  if (!app) throw new Error('Firebase not available server-side')
  return getStorage(app)
}

export async function uploadFile(path, file) {
  const storage = getStorageInstance()
  const storageRef = ref(storage, path)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}

export async function deleteFile(path) {
  const storage = getStorageInstance()
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

export async function uploadAvatar(uid, file) {
  const path = `avatars/${uid}/avatar`
  return uploadFile(path, file)
}

export async function uploadServerIcon(serverId, file) {
  const path = `servers/${serverId}/icon`
  return uploadFile(path, file)
}

export async function uploadAttachment(serverId, channelId, file) {
  const ts = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = serverId
    ? `attachments/${serverId}/${channelId}/${ts}_${safeName}`
    : `attachments/dm/${channelId}/${ts}_${safeName}`
  return uploadFile(path, file)
}
