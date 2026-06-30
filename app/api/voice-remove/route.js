import { RoomServiceClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { getLiveKitConfig } from "@/lib/livekit";

// Ownership is enforced client-side (only the server owner sees the "remove"
// option) — consistent with the rest of this app's existing trust model,
// where API routes trust client-submitted identity rather than verifying a
// session server-side (no firebase-admin/service account set up here).
export async function POST(request) {
  const { apiKey, apiSecret, url } = getLiveKitConfig();
  if (!apiKey || !apiSecret || !url) {
    return NextResponse.json(
      { error: "livekit_not_configured", message: "LiveKit ist nicht konfiguriert." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const { roomName, identity } = body ?? {};
  if (!roomName || !identity) {
    return NextResponse.json(
      { error: "missing_params", message: "roomName und identity sind erforderlich" },
      { status: 400 },
    );
  }

  try {
    const client = new RoomServiceClient(url.replace(/^wss:/, "https:").replace(/^ws:/, "http:"), apiKey, apiSecret);
    await client.removeParticipant(roomName, identity);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "remove_failed", message: err.message ?? "Entfernen fehlgeschlagen" },
      { status: 500 },
    );
  }
}
