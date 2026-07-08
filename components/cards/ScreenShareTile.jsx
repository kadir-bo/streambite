"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowsOut,
  ArrowsIn,
  PlayCircle,
  MonitorPlay,
  MicrophoneSlash,
  Microphone,
  StopCircle,
} from "@phosphor-icons/react";
import { useVoice } from "@/context";

export default function ScreenShareTile({ participant }) {
  const { toggleScreenShare, toggleMute, muted } = useVoice();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [maximized, setMaximized] = useState(false);
  const maximizedRef = useRef(false);
  const track = participant.screenShareTrack;

  // Lokaler Stream: sofort beitreten. Remote: Overlay.
  const [streamJoined, setStreamJoined] = useState(participant.isLocal);

  // Track koppeln/entkoppeln. Wenn der Track verschwindet (Stream-Ende),
  // setze den "joined"-Zustand zurück, damit der Overlay-Button erscheint.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!track) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStreamJoined(false);
      return;
    }
    if (streamJoined) {
      track.attach(el);
      el.play().catch(() => {});
    }
    return () => {
      track?.detach(el);
    };
  }, [track, streamJoined]);

  // iOS Rotation-Fix: Bei orientationchange/resize Video neu attachen
  useEffect(() => {
    if (!streamJoined || !track || !videoRef.current) return;
    function reattach() {
      const el = videoRef.current;
      if (!el || !track) return;
      try {
        track.detach(el);
        track.attach(el);
        el.play().catch(() => {});
      } catch (_) {
        /* ignore */
      }
    }
    window.addEventListener("orientationchange", reattach);
    window.addEventListener("resize", reattach);
    return () => {
      window.removeEventListener("orientationchange", reattach);
      window.removeEventListener("resize", reattach);
    };
  }, [streamJoined, track]);

  function handleJoinStream() {
    setStreamJoined(true);
  }

  // iOS Safari: Fullscreen-Event-Lister
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
    const video = videoRef.current;

    const fsEl = document.fullscreenElement ?? document.webkitFullscreenElement;
    if (fsEl) {
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen)
          await document.webkitExitFullscreen();
      } catch (err) {
        console.warn("[ScreenShare] exitFullscreen failed:", err);
      }
      return;
    }

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

    maximizedRef.current = true;
    setMaximized(true);
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-2">
      <div
        ref={containerRef}
        className={`group relative flex-1 overflow-hidden rounded-lg border border-white/5 bg-black ${
          maximized
            ? "fixed inset-0 z-50 flex items-center justify-center bg-black"
            : ""
        }`}
      >
        {streamJoined ? (
          <>
            <video
              ref={videoRef}
              playsInline
              // object-cover auf Mobile (füllt ohne Balken), object-contain auf Desktop (zeigt alles)
              className="h-full w-full max-sm:object-cover object-contain"
            />
          </>
        ) : (
          /* Overlay: "Stream beitreten"-Button (nur für Remote) */
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-(--accent)/20">
              <MonitorPlay size={32} className="text-(--accent)" />
            </div>
            <p className="text-center text-sm font-medium text-zinc-400">
              {participant.name} teilt seinen Bildschirm
            </p>
            <button
              onClick={handleJoinStream}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--accent) px-5 py-2.5 text-sm font-semibold text-white border-none hover:opacity-90 active:opacity-80"
            >
              <PlayCircle size={20} weight="fill" />
              Stream beitreten
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
