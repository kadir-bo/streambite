"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowsOut, ArrowsIn } from "@phosphor-icons/react";

export default function ScreenShareTile({ participant }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [maximized, setMaximized] = useState(false);
  const maximizedRef = useRef(false);

  useEffect(() => {
    const el = videoRef.current;
    const track = participant.screenShareTrack;
    if (!el || !track) return;
    track.attach(el);
    return () => track.detach(el);
  }, [participant.screenShareTrack]);

  useEffect(() => {
    function onFullscreenChange() {
      const inFullscreen =
        document.fullscreenElement === containerRef.current ||
        (document.fullscreenElement === document.documentElement &&
          maximizedRef.current);
      maximizedRef.current = inFullscreen;
      setMaximized(inFullscreen);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function toggleMaximize(e) {
    e.stopPropagation();

    if (!document.fullscreenEnabled) {
      // Fullscreen API nicht verfügbar (z. B. eingeschränkter Modus)
      return;
    }

    // Fullscreen beenden
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn("[ScreenShare] exitFullscreen failed:", err);
      }
      return;
    }

    // Versuche zuerst den Container in Fullscreen zu schicken
    const el = containerRef.current;
    if (el) {
      try {
        maximizedRef.current = true;
        await el.requestFullscreen({ navigationUI: "hide" });
        return;
      } catch (err) {
        maximizedRef.current = false;
        console.warn("[ScreenShare] container requestFullscreen failed:", err);
      }
    }

    // Fallback: gesamtes Dokument fullscrennen
    try {
      maximizedRef.current = true;
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch (err) {
      maximizedRef.current = false;
      console.warn("[ScreenShare] document fallback fullscreen also failed:", err);
      setMaximized(false);
    }
  }

  return (
    <div className="flex w-full max-w-6xl flex-col gap-2">
      <div
        ref={containerRef}
        className={`group relative overflow-hidden rounded-(--radius-base) border border-(--border-subtle) bg-black ${
          maximized
            ? "fixed inset-0 z-50 flex items-center justify-center bg-black"
            : ""
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={maximized ? "h-full w-full object-contain" : "w-full"}
        />
        <button
          onClick={toggleMaximize}
          title={maximized ? "Vollbild beenden" : "Maximieren"}
          className="absolute bottom-4 right-4 flex size-12 items-center justify-center rounded-(--radius-base) border-none bg-black/60 text-white opacity-0 transition-opacity duration-150 cursor-pointer group-hover:opacity-100 hover:bg-black/80"
        >
          {maximized ? <ArrowsIn size={22} /> : <ArrowsOut size={22} />}
        </button>
      </div>
      <span className="text-sm text-(--text-muted)">
        {participant.name}
        {participant.isLocal ? " (Du)" : ""} teilt den Bildschirm
      </span>
    </div>
  );
}
