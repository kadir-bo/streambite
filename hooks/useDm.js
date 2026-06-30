'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context'
import { getDm, subscribeToUser } from '@/lib'

export function useDm(dmId) {
  const { firebaseUser } = useAuth()
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!dmId || !firebaseUser) {
      setOtherUser(null)
      setLoading(false)
      return
    }

    let unsubscribeUser = () => {}
    setLoading(true)

    getDm(dmId)
      .then((dm) => {
        const otherUid = dm?.participants?.find((uid) => uid !== firebaseUser.uid)
        if (!otherUid) {
          setLoading(false)
          return
        }
        unsubscribeUser = subscribeToUser(otherUid, (doc) => {
          setOtherUser(doc)
          setLoading(false)
        })
      })
      .catch((err) => {
        console.error(`[dm] dms/${dmId}:`, err.code, err.message)
        setLoading(false)
      })

    return () => unsubscribeUser()
  }, [dmId, firebaseUser])

  return { otherUser, loading }
}
