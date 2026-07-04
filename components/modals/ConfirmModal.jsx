'use client'

import { Modal, Button } from "@/components"

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Bist du sicher?',
  description,
  confirmLabel = 'Bestätigen',
  loading = false,
  error,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={400}>
      {description && (
        <p className="text-sm text-zinc-400 leading-(--leading-relaxed) mb-6">
          {description}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500 leading-(--leading-relaxed) mb-4">{error}</p>
      )}
      <div className="flex gap-2.5 justify-end">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
