'use client'

import { useState } from 'react'
import { useServer } from '@/context'
import { Input, Button } from '@/components'

export default function CreateTab({ onSuccess }) {
  const { createServer } = useServer()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Bitte gib einen Servernamen ein')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await createServer(trimmed)
      onSuccess?.(result.serverId, result.defaultChannelId)
    } catch (err) {
      setError(err.message ?? 'Fehler beim Erstellen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-(--text-muted) leading-normal">
        Erstelle deinen eigenen Server und lade Freunde ein.
      </p>

      <Input
        label="Servername"
        placeholder="Mein toller Server"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error}
        maxLength={100}
        autoFocus
      />

      <Button type="submit" loading={loading} disabled={!name.trim()}>
        Server erstellen
      </Button>
    </form>
  )
}
