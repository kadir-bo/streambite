export default function manifest() {
  return {
    name: "Streambite",
    short_name: "Streambite",
    description: "Community chat, voice and streaming",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0c",
    theme_color: "#0a0a0c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
