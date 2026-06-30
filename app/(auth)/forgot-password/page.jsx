'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { AuthCard, Input, Button } from '@/components'
import { resetPassword, fade } from '@/lib'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.code === 'auth/user-not-found'
        ? 'Kein Konto mit dieser E-Mail gefunden.'
        : 'Fehler beim Senden. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
            className="flex flex-col gap-4 text-center"
          >
            <div className="text-[32px] mb-1">✉️</div>
            <h1 className="text-lg font-bold text-(--text-primary)">
              E-Mail gesendet
            </h1>
            <p className="text-sm text-(--text-muted)">
              Überprüfe dein Postfach und folge dem Link zum Zurücksetzen.
            </p>
            <Link href="/login" className="text-sm text-(--text-secondary) hover:text-zinc-100 transition-colors mt-2">
              Zurück zur Anmeldung
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-(--text-primary) tracking-tight">
                Passwort zurücksetzen
              </h1>
              <p className="text-sm text-(--text-muted)">
                Wir senden dir einen Link per E-Mail.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="E-Mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                error={error || undefined}
              />
              <Button type="submit" loading={loading} className="w-full">
                Link senden
              </Button>
            </form>

            <Link href="/login" className="text-xs text-(--text-muted) text-center hover:text-zinc-300 transition-colors">
              Zurück zur Anmeldung
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  )
}
