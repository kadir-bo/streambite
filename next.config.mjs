/** @type {import('next').NextConfig} */
const nextConfig = {
  // Erlaubt Zugriff vom iPhone übers lokale Netzwerk
  // (Next.js 16 blockiert Nicht-localhost-Origins standardmäßig)
  allowedDevOrigins: ["*"],
};

export default nextConfig;
