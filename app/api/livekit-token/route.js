import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { getLiveKitConfig } from "@/lib/livekit";

export async function POST(request) {
  const { apiKey, apiSecret, url } = getLiveKitConfig();
  if (!apiKey || !apiSecret || !url) {
    return NextResponse.json(
      {
        error: "livekit_not_configured",
        message:
          "LiveKit ist nicht konfiguriert. LIVEKIT_API_KEY, LIVEKIT_API_SECRET und NEXT_PUBLIC_LIVEKIT_URL in .env.local setzen.",
      },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const { roomName, identity, name } = body ?? {};
  if (!roomName || !identity) {
    return NextResponse.json(
      { error: "missing_params", message: "roomName und identity sind erforderlich" },
      { status: 400 },
    );
  }

  const token = new AccessToken(apiKey, apiSecret, { identity, name: name ?? identity });
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const jwt = await token.toJwt();
  return NextResponse.json({ token: jwt, url });
}
