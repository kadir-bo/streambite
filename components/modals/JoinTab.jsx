'use client'

import { useState } from 'react'
import { useServer } from '@/context'
import { Input, Button } from '@/components'

export default function JoinTab({ onSuccess }) {
  const { joinServer } = useServer()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Bitte gib einen Einladungscode ein')
      return
    }
    setError('')
    setLoading(true)
    try {
      const serverId = await joinServer(trimmed)
      onSuccess?.(serverId, null)
    } catch (err) {
      setError(err.message ?? 'Ungültiger Code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500 leading-normal">
        Gib einen Einladungslink oder -code ein, um einem Server beizutreten.
      </p>

      <Input
        label="Einladungscode"
        placeholder="z.B. aBcDeFgH"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        error={error}
        autoFocus
      />

      <Button type="submit" loading={loading} disabled={!code.trim()}>
        Server beitreten
      </Button>
    </form>
  )
}
