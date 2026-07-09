/**
 * Entfernt einen Teilnehmer aus einem LiveKit-Sprachkanal.
 * Wird von Admin-Aktionen in der Channel-Sidebar genutzt.
 */
export async function removeVoiceParticipant(roomName, identity) {
  const res = await fetch("/api/voice-remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName, identity }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`voice-remove fehlgeschlagen (${res.status}): ${text}`);
  }
}
