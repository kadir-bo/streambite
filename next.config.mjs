/** @type {import('next').NextConfig} */
const nextConfig = {
  // Erlaubt Zugriff vom iPhone übers lokale Netzwerk
  // (Next.js 16 blockiert Nicht-localhost-Origins standardmäßig)
  allowedDevOrigins: ["192.168.2.36", "localhost:3000"],
};

export default nextConfig;
