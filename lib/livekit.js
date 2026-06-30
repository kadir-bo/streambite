export function getLiveKitConfig() {
  return {
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
  };
}
