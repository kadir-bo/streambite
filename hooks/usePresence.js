'use client'

import { useEffect, useRef } from 'react'
import { updateUserDocument } from '@/lib'

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

/**
 * Setzt den Firestore-Status über die REST API (keepalive-fähig).
 * Diese Funktion MUSS synchron aufrufbar sein (kein await).
 */
function firestoreKeepalive(uid, token, status) {
  fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=status`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: { status: { stringValue: status } },
      }),
      keepalive: true,
    },
  ).catch(() => {})
}

/**
 * Automatische Online/Offline/Idle-Erkennung:
 *  - Tab sichtbar           → Status 'online' (oder benutzerdefiniert)
 *  - Tab versteckt          → 'idle' (nur wenn vorher 'online' war)
 *  - Browser geschlossen    → 'offline' (per Firestore REST API + keepalive)
 *
 * Ruft keine useAuth() auf – die Werte werden von AuthProvider übergeben,
 * damit SSR/Prerendering nicht abstürzt.
 */
export function usePresence({ firebaseUser, userDoc }) {
  const intendedStatus = useRef('online')
  const tokenRef = useRef(null)

  // Behält den zuletzt vom User gewählten Status (setzt voraus, dass
  // userDoc live per Firestore-Snapshot aktualisiert wird).
  useEffect(() => {
    if (userDoc?.status) intendedStatus.current = userDoc.status
  }, [userDoc?.status])

  useEffect(() => {
    const uid = firebaseUser?.uid
    if (!uid) return

    // ---------- Token-Caching für beforeunload ----------
    // Das Firebase ID-Token wird asynchron geladen. Beim
    // Browser-Schließen muss der keepalive-Fetch aber
    // synchron abgesetzt werden können. Deshalb cachen
    // wir das Token hier und refreshen es alle 5 Minuten.
    const refreshToken = () => {
      firebaseUser
        .getIdToken(/* forceRefresh */ false)
        .then((t) => {
          tokenRef.current = t
        })
        .catch(() => {})
    }
    refreshToken()
    const tokenInterval = setInterval(refreshToken, 5 * 60 * 1000)

    // ---------- Initialen Status setzen ----------
    const current = userDoc?.status ?? 'online'
    if (current === 'online' || current === 'idle') {
      updateUserDocument(uid, { status: 'online' }).catch(() => {})
    }

    // ---------- Visibility-Handler ----------
    const handleVisibility = () => {
      if (document.hidden) {
        if (intendedStatus.current === 'online') {
          updateUserDocument(uid, { status: 'idle' }).catch(() => {})
          // Fallback per REST API (falls der SDK-Write blockiert)
          if (tokenRef.current) {
            firestoreKeepalive(uid, tokenRef.current, 'idle')
          }
        }
      } else {
        const restore =
          intendedStatus.current === 'offline' ? 'offline' : 'online'
        updateUserDocument(uid, { status: restore }).catch(() => {})
      }
    }

    // ---------- beforeunload (Browser/Tab schließen) ----------
    const handleBeforeUnload = () => {
      const token = tokenRef.current
      if (!token) {
        // Fallback: versuche trotzdem asynchron (best-effort)
        firebaseUser.getIdToken().then((t) => {
          firestoreKeepalive(uid, t, 'offline')
        })
        return
      }
      firestoreKeepalive(uid, token, 'offline')
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(tokenInterval)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      updateUserDocument(uid, { status: 'offline' }).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid])
}
