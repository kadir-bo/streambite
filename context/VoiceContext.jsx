"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Room, RoomEvent, Track, ScreenSharePresets } from "livekit-client";
import { useAuth } from "@/context";
import { joinVoicePresence, leaveVoicePresence } from "@/lib";

const VoiceContext = createContext(null);

export function VoiceProvider({ children }) {
  const { firebaseUser, userDoc } = useAuth();
  const roomRef = useRef(null);
  const presenceRef = useRef(null); // { serverId, channelId, uid } of the currently-joined voice channel's presence doc
  const [connection, setConnection] = useState({
    status: "idle", // idle | connecting | connected | error
    serverId: null,
    channelId: null,
    channelName: null,
    error: null,
  });
  const [screenShare, setScreenShare] = useState(false);
  const [participants, setParticipants] = useState([]);
  const localSpeakingRef = useRef(false); // manual RMS-based speaking detection for local participant

  // Mic/headphone state and device/volume preferences all live here, not
  // gated behind an active call — exactly like Discord, you can mute
  // yourself, pick devices, and adjust volume before ever joining a channel.
  // Preferences applied immediately when connected; otherwise stored and
  // applied automatically on the next connect().
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [audioInputs, setAudioInputs] = useState([]);
  const [activeAudioInputId, setActiveAudioInputIdState] = useState(null);
  const [audioOutputs, setAudioOutputs] = useState([]);
  const [activeAudioOutputId, setActiveAudioOutputIdState] = useState(null);
  const [inputVolume, setInputVolumeState] = useState(100);
  const [outputVolume, setOutputVolumeState] = useState(100);
  const [micSensitivity, setMicSensitivityState] = useState(50); // 0-100, higher = picks up quieter sound

  const mutedRef = useRef(false);
  const deafenedRef = useRef(false);
  const mutedByDeafenRef = useRef(false); // true if deafen is what muted the mic, so undeafen knows to release it
  const activeAudioInputIdRef = useRef(null);
  const activeAudioOutputIdRef = useRef(null);
  const inputVolumeRef = useRef(100);
  const outputVolumeRef = useRef(100);
  const micSensitivityRef = useRef(50);
  const audioPipelineRef = useRef(null); // { audioContext, gainNode, analyser, rafId }

  // Mic processing pipeline: raw mic source → AnalyserNode (RMS speaking
  // detection) → GainNode (input volume / noise gate) → published track.
  //
  // ⚠️ CRITICAL: The AnalyserNode MUST sit BEFORE the GainNode. If the
  // analyser comes after the gain, and the gain is 0 (silent / gated), the
  // analyser sees only silence → RMS stays 0 → "not speaking" forever →
  // gain stays 0 → never detects speech → DEADLOCK.
  function stopMicPipeline() {
    const pipeline = audioPipelineRef.current;
    if (!pipeline) return;
    audioPipelineRef.current = null;
    cancelAnimationFrame(pipeline.rafId);
    pipeline.audioContext.close().catch(() => {});
  }

  function startMicPipeline(room) {
    stopMicPipeline();
    const publication = room.localParticipant.getTrackPublication(Track.Source.Microphone);
    const track = publication?.track;
    const mediaTrack = track?.mediaStreamTrack;
    if (!track || !mediaTrack) return;

    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(new MediaStream([mediaTrack]));
      const data = new Uint8Array(512);

      // AnalyserNode first — gets raw microphone BEFORE gain/gate
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      // GainNode second — input volume + noise gate (set to 0 when silent)
      const gainNode = audioContext.createGain();
      gainNode.gain.value = inputVolumeRef.current / 100;
      source.connect(gainNode);

      const destination = audioContext.createMediaStreamDestination();
      gainNode.connect(destination);
      track.replaceTrack(destination.stream.getAudioTracks()[0], true).catch((err) => {
        console.warn("[voice] mic pipeline replaceTrack failed:", err);
      });

      function tick() {
        if (!room.localParticipant.isMicrophoneEnabled) {
          audioPipelineRef.current.rafId = requestAnimationFrame(tick);
          return;
        }
        analyser.getByteTimeDomainData(data);
        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
          const normalized = (data[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        // sensitivity 0 → only loud sound passes; 100 → almost anything passes
        const threshold = 0.05 * (1 - micSensitivityRef.current / 100);
        const isCurrentlySpeaking = rms > threshold;

        // Gain as noise gate: 0 when silent keeps the track alive (LiveKit
        // sees isSpeaking) but no audio reaches the published destination.
        gainNode.gain.value = isCurrentlySpeaking
          ? inputVolumeRef.current / 100
          : 0;

        // Trigger snapshot only on transition to avoid excessive re-renders.
        if (isCurrentlySpeaking !== localSpeakingRef.current) {
          localSpeakingRef.current = isCurrentlySpeaking;
          snapshotParticipants(roomRef.current);
        }

        audioPipelineRef.current.rafId = requestAnimationFrame(tick);
      }

      audioPipelineRef.current = {
        audioContext,
        gainNode,
        analyser,
        rafId: requestAnimationFrame(tick),
      };
    } catch (err) {
      console.warn("[voice] startMicPipeline failed:", err);
    }
  }

  function applyOutputVolume(room) {
    if (!room) return;
    room.remoteParticipants.forEach((p) => {
      p.audioTrackPublications.forEach((pub) => {
        pub.track?.attachedElements.forEach((el) => {
          el.volume = outputVolumeRef.current / 100;
        });
      });
    });
  }

  const setMicSensitivity = useCallback((value) => {
    micSensitivityRef.current = value;
    setMicSensitivityState(value);
  }, []);

  const setInputVolume = useCallback((value) => {
    inputVolumeRef.current = value;
    setInputVolumeState(value);
    if (audioPipelineRef.current) audioPipelineRef.current.gainNode.gain.value = value / 100;
  }, []);

  const setOutputVolume = useCallback((value) => {
    outputVolumeRef.current = value;
    setOutputVolumeState(value);
    applyOutputVolume(roomRef.current);
  }, []);

  function clearPresence() {
    const p = presenceRef.current;
    if (!p) return;
    presenceRef.current = null;
    leaveVoicePresence(p.serverId, p.channelId, p.uid).catch(() => {});
  }

  function snapshotParticipants(room) {
    const all = [
      room.localParticipant,
      ...Array.from(room.remoteParticipants.values()),
    ];
    setParticipants(
      all.map((p) => ({
        identity: p.identity,
        name: p.name || p.identity,
        isLocal: p.isLocal,
        // Remote: use LiveKit's isSpeaking. Local: use our own RMS-based detection
        // since LiveKit may not detect speaking on a replaceTrack'd audio source.
        isSpeaking: p.isLocal ? localSpeakingRef.current : p.isSpeaking,
        isMicMuted: !p.isMicrophoneEnabled,
        isScreenSharing: p.isScreenShareEnabled,
        screenShareTrack:
          p.getTrackPublication?.(Track.Source.ScreenShare)?.track ?? null,
      })),
    );
  }

  const connect = useCallback(
    async (serverId, channelId, channelName) => {
      if (!firebaseUser) return;
      if (roomRef.current) await disconnect();

      setConnection({
        status: "connecting",
        serverId,
        channelId,
        channelName: channelName ?? null,
        error: null,
      });

      try {
        const res = await fetch("/api/livekit-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: `${serverId}:${channelId}`,
            identity: firebaseUser.uid,
            name: userDoc?.displayName ?? firebaseUser.displayName ?? "Nutzer",
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setConnection({
            status: "error",
            serverId,
            channelId,
            channelName: channelName ?? null,
            error: data.message ?? "Verbindung fehlgeschlagen",
          });
          return;
        }

        // 1080p/60fps with high bitrate for maximum stream quality. The
        // LiveKit default was too conservative for text-heavy content.
        // 1080p/60fps @ 15 Mbps gives crystal-clear text and smooth motion.
        const room = new Room({
          publishDefaults: {
            screenShareEncoding: {
              ...ScreenSharePresets.h1080fps30.encoding,
              maxBitrate: 15_000_000,
              maxFramerate: 60,
            },
          },
        });
        roomRef.current = room;

        room.on(RoomEvent.ParticipantConnected, () =>
          snapshotParticipants(room),
        );
        room.on(RoomEvent.ParticipantDisconnected, () =>
          snapshotParticipants(room),
        );
        room.on(RoomEvent.ActiveSpeakersChanged, () =>
          snapshotParticipants(room),
        );
        room.on(RoomEvent.TrackMuted, () => snapshotParticipants(room));
        room.on(RoomEvent.TrackUnmuted, () => snapshotParticipants(room));
        room.on(RoomEvent.TrackPublished, () => snapshotParticipants(room));
        room.on(RoomEvent.TrackUnpublished, () => snapshotParticipants(room));
        room.on(RoomEvent.TrackSubscribed, () => {
          applyOutputVolume(room);
          snapshotParticipants(room);
        });
        room.on(RoomEvent.LocalTrackPublished, () => {
          setScreenShare(room.localParticipant.isScreenShareEnabled);
          snapshotParticipants(room);
        });
        room.on(RoomEvent.LocalTrackUnpublished, () => {
          // Catches the browser's native "Stop sharing" button, not just our own toggle.
          setScreenShare(room.localParticipant.isScreenShareEnabled);
          snapshotParticipants(room);
        });
        room.on(RoomEvent.Disconnected, () => {
          roomRef.current = null;
          stopMicPipeline();
          clearPresence();
          setParticipants([]);
          setScreenShare(false);
          setConnection({
            status: "idle",
            serverId: null,
            channelId: null,
            channelName: null,
            error: null,
          });
        });

        await room.connect(data.url, data.token);

        presenceRef.current = { serverId, channelId, uid: firebaseUser.uid };
        joinVoicePresence(serverId, channelId, firebaseUser.uid, {
          name: userDoc?.displayName ?? firebaseUser.displayName ?? "Nutzer",
          avatarUrl: userDoc?.avatarUrl ?? null,
        }).catch((err) => console.warn("[voice] joinVoicePresence failed:", err));

        if (activeAudioInputIdRef.current) {
          await room.switchActiveDevice("audioinput", activeAudioInputIdRef.current).catch(() => {});
        }
        if (activeAudioOutputIdRef.current) {
          await room.switchActiveDevice("audiooutput", activeAudioOutputIdRef.current).catch(() => {});
        }

        let micFailed = false;
        try {
          await room.localParticipant.setMicrophoneEnabled(!mutedRef.current);
        } catch (micErr) {
          // Handled gracefully below (join muted + visible banner) — warn, not error.
          console.warn("[voice] microphone unavailable:", micErr);
          micFailed = true;
        }

        snapshotParticipants(room);
        if (micFailed) setMuted(true);
        mutedRef.current = micFailed || mutedRef.current;
        if (!micFailed && !mutedRef.current) startMicPipeline(room);

        Room.getLocalDevices("audioinput", true)
          .then((devices) => {
            setAudioInputs(devices.map((d) => ({ deviceId: d.deviceId, label: d.label })));
            if (!micFailed) setActiveAudioInputIdState(room.getActiveDevice("audioinput") ?? null);
          })
          .catch((err) => console.warn("[voice] loadAudioInputs failed:", err));
        Room.getLocalDevices("audiooutput", true)
          .then((devices) => {
            setAudioOutputs(devices.map((d) => ({ deviceId: d.deviceId, label: d.label })));
            setActiveAudioOutputIdState(room.getActiveDevice("audiooutput") ?? null);
          })
          .catch((err) => console.warn("[voice] loadAudioOutputs failed:", err));

        setConnection({
          status: "connected",
          serverId,
          channelId,
          channelName: channelName ?? null,
          error: micFailed
            ? "Mikrofon nicht verfügbar (wird von einer anderen App genutzt oder blockiert). Du bist stummgeschaltet beigetreten."
            : null,
        });
      } catch (err) {
        console.error("[voice] connect failed:", err);
        setConnection({
          status: "error",
          serverId,
          channelId,
          channelName: channelName ?? null,
          error: "Verbindung zum Sprachkanal fehlgeschlagen.",
        });
      }
    },
    [firebaseUser, userDoc],
  );

  const disconnect = useCallback(async () => {
    stopMicPipeline();
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    clearPresence();
    setParticipants([]);
    setScreenShare(false);
    setConnection({
      status: "idle",
      serverId: null,
      channelId: null,
      channelName: null,
      error: null,
    });
  }, []);

  // Mute/deafen are preferences, not call-only controls: togglable any time.
  // With an active room, they take effect immediately; otherwise they're
  // just remembered and applied as the initial state on the next connect().
  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    const next = !mutedRef.current;
    if (!room) {
      mutedRef.current = next;
      setMuted(next);
      if (!next) {
        mutedByDeafenRef.current = false;
        deafenedRef.current = false;
        setDeafened(false);
      }
      return;
    }
    try {
      await room.localParticipant.setMicrophoneEnabled(!next);
      mutedRef.current = next;
      setMuted(next);
      if (!next) {
        mutedByDeafenRef.current = false;
        deafenedRef.current = false;
        setDeafened(false);
        startMicPipeline(room);
      } else {
        mutedByDeafenRef.current = false; // manual mute, not caused by deafen
        stopMicPipeline();
      }
    } catch (err) {
      console.warn("[voice] toggleMute failed:", err);
      mutedRef.current = true;
      setMuted(true);
    }
    snapshotParticipants(room);
  }, []);

  // Deafening also mutes the mic (matches Discord) — but undeafen should
  // only RELEASE that mute if deafen is what caused it. A mute that already
  // existed before deafening is left alone on undeafen.
  const toggleDeafen = useCallback(async () => {
    const room = roomRef.current;
    const next = !deafenedRef.current;
    deafenedRef.current = next;
    setDeafened(next);

    if (room) {
      room.remoteParticipants.forEach((p) => {
        p.audioTrackPublications.forEach((pub) => {
          if (pub.track)
            pub.track.attachedElements.forEach((el) => (el.muted = next));
        });
      });

      if (next) {
        if (!mutedRef.current) {
          mutedByDeafenRef.current = true;
          await room.localParticipant.setMicrophoneEnabled(false);
          mutedRef.current = true;
          setMuted(true);
          stopMicPipeline();
        } else {
          mutedByDeafenRef.current = false;
        }
      } else if (mutedByDeafenRef.current) {
        mutedByDeafenRef.current = false;
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          mutedRef.current = false;
          setMuted(false);
          startMicPipeline(room);
        } catch (err) {
          console.warn("[voice] undeafen mic release failed:", err);
          mutedRef.current = true;
          setMuted(true);
        }
      }
    } else if (next) {
      if (!mutedRef.current) {
        mutedByDeafenRef.current = true;
        mutedRef.current = true;
        setMuted(true);
      } else {
        mutedByDeafenRef.current = false;
      }
    } else if (mutedByDeafenRef.current) {
      mutedByDeafenRef.current = false;
      mutedRef.current = false;
      setMuted(false);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !screenShare;
    try {
      await room.localParticipant.setScreenShareEnabled(next, {
        audio: true,
        resolution: { width: 1920, height: 1080, frameRate: 60 },
      });
      setScreenShare(next);
    } catch (err) {
      console.warn("[voice] toggleScreenShare failed:", err);
    }
    snapshotParticipants(room);
  }, [screenShare]);

  const removeFromVoice = useCallback(
    async (identity) => {
      if (!connection.serverId || !connection.channelId) return;
      try {
        const res = await fetch("/api/voice-remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: `${connection.serverId}:${connection.channelId}`,
            identity,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message ?? "Entfernen fehlgeschlagen");
        }
      } catch (err) {
        console.error("[voice] removeFromVoice failed:", err);
        throw err;
      }
    },
    [connection.serverId, connection.channelId],
  );

  // Device lists are enumerable without a live room; only *applying* a
  // selection live needs one — otherwise it's stored and used on next connect().
  const loadAudioInputs = useCallback(async () => {
    try {
      const devices = await Room.getLocalDevices("audioinput", true);
      const mapped = devices.map((d) => ({ deviceId: d.deviceId, label: d.label }));
      setAudioInputs(mapped);
      // Auto-select first device if none selected yet (system default)
      if (!activeAudioInputIdRef.current && mapped.length > 0) {
        activeAudioInputIdRef.current = mapped[0].deviceId;
        setActiveAudioInputIdState(mapped[0].deviceId);
      }
      const room = roomRef.current;
      if (room) setActiveAudioInputIdState(room.getActiveDevice("audioinput") ?? mapped[0]?.deviceId ?? null);
    } catch (err) {
      console.warn("[voice] loadAudioInputs failed:", err);
    }
  }, []);

  const selectAudioInput = useCallback(async (deviceId) => {
    activeAudioInputIdRef.current = deviceId;
    setActiveAudioInputIdState(deviceId);
    const room = roomRef.current;
    if (!room) return;
    try {
      await room.switchActiveDevice("audioinput", deviceId);
      startMicPipeline(room); // new device → new MediaStreamTrack, re-attach the pipeline
    } catch (err) {
      console.warn("[voice] selectAudioInput failed:", err);
    }
  }, []);

  const loadAudioOutputs = useCallback(async () => {
    try {
      const devices = await Room.getLocalDevices("audiooutput", true);
      const mapped = devices.map((d) => ({ deviceId: d.deviceId, label: d.label }));
      setAudioOutputs(mapped);
      // Auto-select first device if none selected yet (system default)
      if (!activeAudioOutputIdRef.current && mapped.length > 0) {
        activeAudioOutputIdRef.current = mapped[0].deviceId;
        setActiveAudioOutputIdState(mapped[0].deviceId);
      }
      const room = roomRef.current;
      if (room) setActiveAudioOutputIdState(room.getActiveDevice("audiooutput") ?? mapped[0]?.deviceId ?? null);
    } catch (err) {
      console.warn("[voice] loadAudioOutputs failed:", err);
    }
  }, []);

  const selectAudioOutput = useCallback(async (deviceId) => {
    activeAudioOutputIdRef.current = deviceId;
    setActiveAudioOutputIdState(deviceId);
    const room = roomRef.current;
    if (!room) return;
    try {
      await room.switchActiveDevice("audiooutput", deviceId);
    } catch (err) {
      console.warn("[voice] selectAudioOutput failed:", err);
    }
  }, []);

  // Best-effort: clean up the presence doc on tab close so other users
  // don't see a stale "still in voice" avatar. Not guaranteed (no time for
  // the async Firestore delete to land before the page actually unloads),
  // but harmless to attempt.
  useEffect(() => {
    function handlePageHide() {
      clearPresence();
    }
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      stopMicPipeline();
    };
  }, []);

  const value = {
    connection,
    participants,
    muted,
    deafened,
    screenShare,
    audioInputs,
    activeAudioInputId,
    audioOutputs,
    activeAudioOutputId,
    inputVolume,
    outputVolume,
    micSensitivity,
    setMicSensitivity,
    setInputVolume,
    setOutputVolume,
    connect,
    disconnect,
    toggleMute,
    toggleDeafen,
    toggleScreenShare,
    loadAudioInputs,
    selectAudioInput,
    loadAudioOutputs,
    selectAudioOutput,
    removeFromVoice,
  };

  return (
    <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
  );
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
}
