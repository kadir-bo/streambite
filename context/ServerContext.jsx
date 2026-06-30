'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context'
import {
  subscribeToUserServers,
  subscribeToServerChannels,
  subscribeToServerVoicePresence,
  createServer as fsCreateServer,
  joinServerByCode,
} from '@/lib'

const ServerContext = createContext(null)

export function ServerProvider({ children }) {
  const { userDoc, firebaseUser } = useAuth()
  const [servers, setServers] = useState([])
  const [activeServerId, setActiveServerId] = useState(null)
  const [channels, setChannels] = useState([])
  const [categories, setCategories] = useState([])
  // Defaults closed: on mobile this renders as a full-screen overlay, so
  // auto-opening it would otherwise ambush mobile users on every channel visit.
  const [showMembers, setShowMembers] = useState(false)
  const [voicePresence, setVoicePresence] = useState({})

  const serverIdsKey = (userDoc?.servers ?? []).join('|')

  useEffect(() => {
    const ids = userDoc?.servers ?? []
    const unsubscribe = subscribeToUserServers(ids, setServers)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverIdsKey])

  useEffect(() => {
    if (!activeServerId) {
      setChannels([])
      setCategories([])
      return
    }
    const unsubscribe = subscribeToServerChannels(activeServerId, setChannels, setCategories)
    return unsubscribe
  }, [activeServerId])

  useEffect(() => {
    if (!activeServerId) {
      setVoicePresence({})
      return
    }
    const unsubscribe = subscribeToServerVoicePresence(activeServerId, setVoicePresence)
    return unsubscribe
  }, [activeServerId])

  const createServer = useCallback(
    async (name) => {
      if (!firebaseUser) throw new Error('Nicht authentifiziert')
      return fsCreateServer(firebaseUser.uid, name)
    },
    [firebaseUser]
  )

  const joinServer = useCallback(
    async (inviteCode) => {
      if (!firebaseUser) throw new Error('Nicht authentifiziert')
      return joinServerByCode(inviteCode, firebaseUser.uid)
    },
    [firebaseUser]
  )

  const toggleMembers = useCallback(() => setShowMembers((v) => !v), [])

  const value = {
    servers,
    activeServerId,
    setActiveServerId,
    channels,
    categories,
    voicePresence,
    createServer,
    joinServer,
    showMembers,
    toggleMembers,
  }

  return <ServerContext.Provider value={value}>{children}</ServerContext.Provider>
}

export function useServer() {
  const ctx = useContext(ServerContext)
  if (!ctx) throw new Error('useServer must be used within ServerProvider')
  return ctx
}
