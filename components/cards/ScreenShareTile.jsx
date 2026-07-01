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

  // iOS Safari verwendet webkitfullscreenchange; Desktop/Chrome fullscreenchange.
  // Wir hören auf beide Events, um plattformunabhängig zu sein.
  useEffect(() => {
    function onFullscreenChange() {
      const el = videoRef.current;
      const fsEl =
        document.fullscreenElement ?? document.webkitFullscreenElement;
      const inFullscreen =
        fsEl === containerRef.current ||
        fsEl === el ||
        fsEl === document.documentElement;
      maximizedRef.current = inFullscreen;
      setMaximized(inFullscreen);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
    };
  }, []);

  async function toggleMaximize(e) {
    e.stopPropagation();

    // iOS Safari: requestFullscreen() funktioniert NUR auf <video>-Elementen,
    // nicht auf <div> oder documentElement.
    // Desktop-Browser: <video> und <div> funktionieren beide.
    // Daher versuchen wir zuerst das <video>-Element.
    const video = videoRef.current;

    // Fullscreen beenden
    const fsEl = document.fullscreenElement ?? document.webkitFullscreenElement;
    if (fsEl) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      } catch (err) {
        console.warn("[ScreenShare] exitFullscreen failed:", err);
      }
      return;
    }

    // 1. Versuch: <video>-Element in Fullscreen (funktioniert auf iOS + Desktop)
    if (video && video.requestFullscreen) {
      try {
        maximizedRef.current = true;
        await video.requestFullscreen({ navigationUI: "hide" });
        return;
      } catch (err) {
        maximizedRef.current = false;
        console.warn("[ScreenShare] video requestFullscreen failed:", err);
      }
    }

    // 2. Versuch: webkitEnterFullscreen (älteres iOS < 16)
    if (video && video.webkitEnterFullscreen) {
      try {
        maximizedRef.current = true;
        video.webkitEnterFullscreen();
        return;
      } catch (err) {
        maximizedRef.current = false;
        console.warn("[ScreenShare] video.webkitEnterFullscreen failed:", err);
      }
    }

    // 3. Versuch: Container <div> (Desktop-Fallback)
    const container = containerRef.current;
    if (container && container.requestFullscreen) {
      try {
        maximizedRef.current = true;
        await container.requestFullscreen({ navigationUI: "hide" });
        return;
      } catch (err) {
        maximizedRef.current = false;
        console.warn("[ScreenShare] container requestFullscreen failed:", err);
      }
    }

    // 4. Fallback: documentElement
    if (document.documentElement.requestFullscreen) {
      try {
        maximizedRef.current = true;
        await document.documentElement.requestFullscreen({
          navigationUI: "hide",
        });
        return;
      } catch (err) {
        maximizedRef.current = false;
        console.warn(
          "[ScreenShare] document fallback fullscreen also failed:",
          err,
        );
      }
    }

    // 5. Nichts hat funktioniert → CSS-Fullscreen setzen (fixed inset-0 z-50)
    // wird bereits über die CSS-Klasse gesteuert, daher setzen wir maximized
    // trotzdem auf true, damit das visuelle Layout stimmt.
    maximizedRef.current = true;
    setMaximized(true);
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-2">
      <div
        ref={containerRef}
        className={`group relative flex-1 overflow-hidden rounded-(--radius-base) border border-(--border-subtle) bg-black ${
          maximized
            ? "fixed inset-0 z-50 flex items-center justify-center bg-black"
            : ""
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
        <button
          onClick={toggleMaximize}
          title={maximized ? "Vollbild beenden" : "Maximieren"}
          className="absolute bottom-4 right-4 flex size-12 items-center justify-center rounded-(--radius-base) border-none bg-black/60 text-white opacity-0 transition-opacity duration-150 cursor-pointer sm:group-hover:opacity-100 hover:bg-black/80 max-sm:opacity-100 max-sm:bottom-2 max-sm:right-2 max-sm:size-10"
        >
          {maximized ? <ArrowsIn size={22} /> : <ArrowsOut size={22} />}
        </button>
      </div>
    </div>
  );
}
