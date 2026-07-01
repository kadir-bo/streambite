"use client";
import { useState, useEffect } from "react";
import { updateChannel } from "@/lib";
import { Modal, Input, Button } from "@/components";

export default function RenameChannelModal({ open, onClose, serverId, channel }) {
  const [name, setName] = useState(channel?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setName(channel?.name ?? "");
  }, [open, channel?.name]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) {
      setError("Bitte gib einen Kanalnamen ein");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await updateChannel(serverId, channel.id, { name: trimmed });
      onClose();
    } catch {
      setError("Fehler beim Umbenennen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Kanal umbenennen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Kanalname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          autoFocus
          error={error}
        />
        <Button type="submit" loading={loading} disabled={!name.trim()}>
          Speichern
        </Button>
      </form>
    </Modal>
  );
}
