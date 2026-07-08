import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
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
// Bei "requires-recent-login" wird automatisch reagiert:
//   - Google-User → re-auth per Popup (nahtlos)
//   - Email-User → wirft einen Fehler, der die UI auffordert, ein Passwortfeld zu zeigen
export async function deleteUserAccount(uid) {
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user) throw new Error('Nicht authentifiziert')

  const providerId = user.providerData?.[0]?.providerId

  // Prüfe, ob Re-Auth nötig ist, BEVOR wir Firestore-Daten löschen
  if (providerId === 'google.com') {
    // Google-User: Re-Auth per Popup (nahtlos)
    try {
      await user.delete()
      // Erfolg → weiter zu Firestore-Cleanup (unten)
    } catch (err) {
      if (err.code !== 'auth/requires-recent-login') throw err
      const provider = new GoogleAuthProvider()
      await reauthenticateWithPopup(user, provider)
      await user.delete()
    }
  } else {
    // Email-User: Versuche direkt zu löschen
    try {
      await user.delete()
    } catch (err) {
      if (err.code !== 'auth/requires-recent-login') throw err
      if (user.email) {
        throw new ReAuthRequiredError(user.email)
      }
      throw new Error(
        'Bitte melde dich kurz ab und wieder an, dann versuche es erneut.',
      )
    }
  }

  // Auth erfolgreich gelöscht → erst jetzt Firestore-Dokument aufräumen
  const { doc, deleteDoc } = await import('firebase/firestore')
  const { getFirestore } = await import('firebase/firestore')
  const db = getFirestore(app)
  await deleteDoc(doc(db, 'users', uid)).catch(() => {})
}

// Spezieller Fehler-Typ, den ProfileSettings erkennen kann
export class ReAuthRequiredError extends Error {
  constructor(email) {
    super('REAUTH_REQUIRED')
    this.email = email
    this.code = 'reauth-required'
  }
}

// Wird nach Eingabe des Passworts aufgerufen – löscht zuerst das Firestore-Dokument,
// dann den Auth-Account (nach erfolgreichem Re-Auth).
export async function reauthWithPasswordAndDelete(password) {
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user || !user.email) throw new Error('Kein Email-User')
  const uid = user.uid

  const credential = EmailAuthProvider.credential(user.email, password)
  await reauthenticateWithCredential(user, credential)

  // Firestore löschen (vor Auth, weil Auth-Löschung den User abmeldet)
  const { doc, deleteDoc } = await import('firebase/firestore')
  const { getFirestore } = await import('firebase/firestore')
  const db = getFirestore(app)
  await deleteDoc(doc(db, 'users', uid)).catch(() => {})

  await user.delete()
}
