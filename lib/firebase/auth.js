import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
} from 'firebase/auth'
import app from '@/lib/firebase/config'

let persistenceReady = null

// IndexedDB-based persistence (Firebase's default) can hang indefinitely on
// Safari/iOS when served over a non-HTTPS local-network address, which leaves
// onAuthStateChanged stuck and the app spinning forever. Forcing
// browserLocalPersistence (localStorage) avoids that; if even that throws
// (e.g. fully locked-down private browsing), fall back to in-memory so auth
// state still resolves, just without persisting across reloads.
function getFirebaseAuth() {
  if (!app) throw new Error('Firebase not available server-side')
  const auth = getAuth(app)
  if (!persistenceReady) {
    persistenceReady = setPersistence(auth, browserLocalPersistence).catch(() =>
      setPersistence(auth, inMemoryPersistence).catch(() => {}),
    )
  }
  return auth
}

export async function registerUser(email, password, displayName) {
  const auth = getFirebaseAuth()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential.user
}

export async function loginUser(email, password) {
  const auth = getFirebaseAuth()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth()
  const provider = new GoogleAuthProvider()
  const credential = await signInWithPopup(auth, provider)
  return credential.user
}

export async function logoutUser() {
  const auth = getFirebaseAuth()
  await signOut(auth)
}

export async function resetPassword(email) {
  const auth = getFirebaseAuth()
  await sendPasswordResetEmail(auth, email)
}

export function subscribeToAuthState(callback) {
  if (!app) {
    callback(null)
    return () => {}
  }
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}

// Löscht den gesamten Account (Auth + Firestore-Dokument + abmelden).
// Der User muss kürzlich eingeloggt sein, sonst verlangt Firebase
// Re-Authentifizierung (wir fangen das und werfen einen klaren Fehler).
export async function deleteUserAccount(uid) {
  const auth = getFirebaseAuth()
  if (!auth.currentUser) throw new Error('Nicht authentifiziert')

  // Firestore-Dokument löschen (Friends, Server-Mitgliedschaften etc.
  // werden über Firestore-Regeln/cascading cleanup gehandhabt)
  const { doc, deleteDoc } = await import('firebase/firestore')
  const { getFirestore } = await import('firebase/firestore')
  const db = getFirestore(app)
  await deleteDoc(doc(db, 'users', uid)).catch(() => {})

  // Auth-Account löschen
  try {
    await auth.currentUser.delete()
  } catch (err) {
    if (err.code === 'auth/requires-recent-login') {
      throw new Error(
        'Zum Löschen des Accounts melde dich bitte kurz ab und wieder an, ' +
        'dann versuche es erneut.',
      )
    }
    throw err
  }
}
