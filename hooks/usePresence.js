'use client'

import { useEffect, useRef } from 'react'
import { updateUserDocument } from '@/lib'

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const DEBOUNCE_MS = 10_000 // 10 s zwischen zwei Visibility-Writes

/**
 * Setzt den Firestore-Status über die REST API (keepalive-fähig).
 * Diese Funktion MUSS synchron aufrufbar sein (kein await).
 * Zählt als ein Write – aber ohne SDK-Overhead und Backpressure.
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
 * Optimiert für minimalen Write-Verbrauch:
 *  - SDK-Writes NUR beim initialen Setzen + Cleanup (2× pro Session)
 *  - Visibility-Änderungen laufen über die REST API (kein SDK-Backlog)
 *  - 10 s Debounce verhindert Rapid-Fire bei schnellen Tab-Wechseln
 */
export function usePresence({ firebaseUser, userDoc }) {
  const intendedStatus = useRef('online')
  const tokenRef = useRef(null)
  const lastVisibilityWrite = useRef(0)

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
    // Einmaliger SDK-Write pro Session um sicherzustellen, dass das
    // Dokument existiert und der Status gesetzt ist.
    const current = userDoc?.status ?? 'online'
    if (current === 'online' || current === 'idle') {
      updateUserDocument(uid, { status: 'online' }).catch(() => {})
    }

    // ---------- Visibility-Handler (REST API only + Debounce) ----------
    // Nutzt ausschließlich die REST API, um den SDK-internen Write-Limit
    // und die client-seitige Backoff-Logik zu umgehen. Der 10s-Debounce
    // verhindert, dass schnelle Tab-Wechsel dutzende Writes verursachen.
    const handleVisibility = () => {
      const now = Date.now()
      if (now - lastVisibilityWrite.current < DEBOUNCE_MS) return
      lastVisibilityWrite.current = now

      if (!tokenRef.current) return

      if (document.hidden) {
        if (intendedStatus.current === 'online') {
          firestoreKeepalive(uid, tokenRef.current, 'idle')
        }
      } else {
        const restore =
          intendedStatus.current === 'offline' ? 'offline' : 'online'
        firestoreKeepalive(uid, tokenRef.current, restore)
      }
    }

    // ---------- beforeunload (Browser/Tab schließen) ----------
    const handleBeforeUnload = () => {
      const token = tokenRef.current
      if (!token) {
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
      // SDK-Write beim Verlassen (einmalig pro Session)
      updateUserDocument(uid, { status: 'offline' }).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid])
}
