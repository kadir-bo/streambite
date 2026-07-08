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
  const [screenShareHasAudio, setScreenShareHasAudio] = useState(false);
  const [participants, setParticipants] = useState([]);
  const localSpeakingRef = useRef(false); // manual RMS-based speaking detection for local participant

  // Mic/headphone state and device/volume preferences all live here, not
  // gated behind an active call - exactly like Discord, you can mute
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
  const unlockCtxRef = useRef(null); // iOS AudioContext-Unlock, bleibt für Session offen
  const audioElementsRef = useRef(new Set()); // alle <audio>-Elemente von Remote-Teilnehmern, für Resume nach startAudio()

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
    cancelAnimationFrame(pipeline.rafId);
    pipeline.rafId = null;
    pipeline.active = false;
    // Source trennen, aber AudioContext OFFEN lassen - beim nächsten
    // unmute wird nur die Quelle neu verbunden (kein neuer AudioContext
    // nötig, was iOS-spezifische Suspension-Probleme vermeidet).
    if (pipeline.source) {
      pipeline.source.disconnect();
      pipeline.source = null;
    }
  }

  // Erzeugt einen neuen Source-Knoten im bestehenden AudioContext,
  // der an den aktuellen Mikrofon-Track von LiveKit angebunden wird.
  // Wird beim erstmaligen Aufbau und nach mute/unmute benötigt,
  // da LiveKit den MediaStreamTrack nach setMicrophoneEnabled neu anlegt.
  function connectPipelineSource(room) {
    const pipeline = audioPipelineRef.current;
    if (!pipeline) return null;

    const publication = room.localParticipant.getTrackPublication(
      Track.Source.Microphone,
    );
    const track = publication?.track;
    const mediaTrack = track?.mediaStreamTrack;
    if (!track || !mediaTrack) return null;

    // Alten Source trennen, falls vorhanden
    if (pipeline.source) {
      pipeline.source.disconnect();
      pipeline.source = null;
    }

    try {
      const source = pipeline.audioContext.createMediaStreamSource(
        new MediaStream([mediaTrack]),
      );
      source.connect(pipeline.analyser);
      source.connect(pipeline.gainNode);
      pipeline.source = source;

      track
        .replaceTrack(pipeline.destination.stream.getAudioTracks()[0], true)
        .catch((err) => {
          console.warn("[voice] mic pipeline replaceTrack failed:", err);
        });
      return source;
    } catch (err) {
      console.warn("[voice] connectPipelineSource failed:", err);
      return null;
    }
  }

  // Wartet, bis LiveKit einen gültigen Mikrofon-Track bereitstellt.
  // Nach setMicrophoneEnabled(true) kann es auf iOS kurz dauern,
  // bis der Track tatsächlich verfügbar ist (Race-Condition).
  async function waitForMicTrack(room, maxRetries = 15, delay = 50) {
    for (let i = 0; i < maxRetries; i++) {
      const pub = room.localParticipant.getTrackPublication(
        Track.Source.Microphone,
      );
      if (pub?.track?.mediaStreamTrack) return pub.track;
      await new Promise((r) => setTimeout(r, delay));
    }
    return null;
  }

  // Tick-Funktion für die Mic-Pipeline - liest analyzer/gainNode/data aus
  // audioPipelineRef.current, damit sie AUßERHALB des try-Blocks aufrufbar ist
  // (wird sowohl beim ersten Aufbau als auch beim Reaktivieren einer pausierten
  // Pipeline benötigt; der frühe Exist-Zweig in startMicPipeline hat sonst keine
  // Referenz auf micTick).
  function runMicTick(room) {
    const pipeline = audioPipelineRef.current;
    if (!pipeline || !pipeline.active) return;
    if (!room.localParticipant.isMicrophoneEnabled) {
      pipeline.rafId = requestAnimationFrame(() => runMicTick(room));
      return;
    }
    pipeline.analyser.getByteTimeDomainData(pipeline.data);
    let sumSquares = 0;
    for (let i = 0; i < pipeline.data.length; i++) {
      const normalized = (pipeline.data[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / pipeline.data.length);
    const threshold = 0.05 * (1 - micSensitivityRef.current / 100);
    const isCurrentlySpeaking = rms > threshold;

    // Weicher Gate: statt hartem 0/1-Übergang (klingt choppy) verwenden wir
    // eine Hüllkurve mit schnellem Attack (0.5) und langsamem Release (0.04).
    // - Sprache beginnt → Gain öffnet sich innerhalb weniger Frames
    // - Sprache endet → Gain schließt langsam, verschluckt keine Satzenden
    const targetGain = isCurrentlySpeaking ? inputVolumeRef.current / 100 : 0;
    const smoothFactor = isCurrentlySpeaking ? 0.5 : 0.04;
    pipeline.gainNode.gain.value +=
      (targetGain - pipeline.gainNode.gain.value) * smoothFactor;

    if (isCurrentlySpeaking !== localSpeakingRef.current) {
      localSpeakingRef.current = isCurrentlySpeaking;
      snapshotParticipants(roomRef.current);
    }

    pipeline.rafId = requestAnimationFrame(() => runMicTick(room));
  }

  function startMicPipeline(room) {
    const existing = audioPipelineRef.current;

    // Wenn bereits eine Pipeline existiert, nur die Quelle neu verbinden
    if (existing && existing.audioContext) {
      connectPipelineSource(room);
      if (!existing.active) {
        existing.active = true;
        existing.rafId = requestAnimationFrame(() => runMicTick(room));
      }
      return;
    }

    // Erster Aufbau: alles neu anlegen
    const publication = room.localParticipant.getTrackPublication(
      Track.Source.Microphone,
    );
    const track = publication?.track;
    const mediaTrack = track?.mediaStreamTrack;
    if (!track || !mediaTrack) return;

    try {
      const audioContext = new AudioContext();
      // iOS: AudioContext ist oft "suspended" nach async gap → explizit resume
      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

      const source = audioContext.createMediaStreamSource(
        new MediaStream([mediaTrack]),
      );
      const data = new Uint8Array(512);

      // AnalyserNode first - gets raw microphone BEFORE gain/gate
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);

      // GainNode second - input volume + noise gate (set to 0 when silent)
      const gainNode = audioContext.createGain();
      gainNode.gain.value = inputVolumeRef.current / 100;
      source.connect(gainNode);

      const destination = audioContext.createMediaStreamDestination();
      gainNode.connect(destination);
      track
        .replaceTrack(destination.stream.getAudioTracks()[0], true)
        .catch((err) => {
          console.warn("[voice] mic pipeline replaceTrack failed:", err);
        });

      audioPipelineRef.current = {
        audioContext,
        gainNode,
        analyser,
        destination,
        source,
        data,
        rafId: requestAnimationFrame(() => runMicTick(room)),
        active: true,
      };
    } catch (err) {
      console.warn("[voice] startMicPipeline failed:", err);
    }
  }

  function applyOutputVolume(room) {
    if (!room) return;
    const vol = outputVolumeRef.current / 100;
    room.remoteParticipants.forEach((p) => {
      // LiveKit bietet setVolume() pro Quelle - nutzen statt manuellem
      // element.volume, da es sowohl Mikrofon- als auch Screen-Share-Audio
      // zuverlässiger steuert (auch auf iOS).
      if (typeof p.setVolume === "function") {
        p.setVolume(vol, Track.Source.Microphone);
        p.setVolume(vol, Track.Source.ScreenShareAudio);
      } else {
        // Fallback für ältere LiveKit-Versionen
        p.audioTrackPublications.forEach((pub) => {
          pub.track?.attachedElements.forEach((el) => {
            el.volume = vol;
          });
        });
      }
    });
  }

  // iOS: Nach room.startAudio() alle gesammelten <audio>-Elemente explizit
  // abspielen. Während connect() blockiert die Autoplay-Policy el.play(),
  // weil der User-Gesture-Kontext verloren geht. Nach startAudio() ist
  // die Audio-Session entsperrt und play() funktioniert.
  function resumeAudioElements() {
    const els = audioElementsRef.current;
    if (els.size === 0) return;
    els.forEach((el) => {
      el.play().catch(() => {});
    });
    console.log(`[voice] resumed ${els.size} audio element(s) after startAudio()`);
  }

  const setMicSensitivity = useCallback((value) => {
    micSensitivityRef.current = value;
    setMicSensitivityState(value);
  }, []);

  const setInputVolume = useCallback((value) => {
    inputVolumeRef.current = value;
    setInputVolumeState(value);
    if (audioPipelineRef.current)
      audioPipelineRef.current.gainNode.gain.value = value / 100;
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
        screenShareAudioTrack:
          p.getTrackPublication?.(Track.Source.ScreenShareAudio)?.track ?? null,
      })),
    );
  }

  const connect = useCallback(
    async (serverId, channelId, channelName) => {
      if (!firebaseUser) return;
      if (roomRef.current) await disconnect();

      // ===== iOS Audio + Mic Unlock (vor await!) =====
      // Auf iOS verfällt die user gesture nach dem ersten await (fetch oder
      // room.connect()). Da connect() mehrere async-Stufen durchläuft, wären
      // room.startAudio() und setMicrophoneEnabled() ohne gesture → stumm.
      // Daher unlocken wir beides SOFORT vor jedem await:
      //
      // 1. AudioContext → Silence → Seite ist "audio unlocked" für Session.
      //    Wichtig: Den Context NICHT schließen - iOS Safari verliert sonst
      //    den Unlock-Status bei Navigation/Route-Change.
      // 2. getUserMedia → Berechtigungsdialog wird getriggert (oder bereits
      //    erteilte Berechtigung bestätigt) → mic ist später nutzbar
      try {
        unlockCtxRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
        if (unlockCtxRef.current.state === "suspended")
          unlockCtxRef.current.resume();
        const _buf = unlockCtxRef.current.createBuffer(1, 1, 22050);
        const _src = unlockCtxRef.current.createBufferSource();
        _src.buffer = _buf;
        _src.connect(unlockCtxRef.current.destination);
        _src.start(0);

        // getUserMedia nur triggern (nicht awaiten) - iOS zeigt dann sofort
        // den Berechtigungsdialog, und setMicrophoneEnabled später funktioniert.
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((_s) => _s.getTracks().forEach((t) => t.stop()))
          .catch(() => {});
      } catch (_e) {
        /* non-critical - Desktop/Android brauchen das nicht */
      }

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
        // Audio: 128 kbps Opus Stereo für klaren Sound bei Screen-Sharing.
        const room = new Room({
          audioCaptureDefaults: {
            channelCount: 2,
            sampleRate: 48000,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          publishDefaults: {
            forceStereo: true,
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
        room.on(RoomEvent.TrackSubscribed, (track) => {
          // Auf iOS müssen wir Audio-Tracks explizit an <audio>-Elemente
          // binden, da LiveKit's interne Auto-Attachment dort nicht zuverlässig
          // funktioniert (Autoplay-Policy blockiert die Wiedergabe).
          // Screen-Share-Audio wird von LiveKit als eigener Track mit
          // source=screen_share_audio publiziert - hier ebenfalls abfangen.
          if (track && track.kind === "audio") {
            try {
              const el = track.attach();
              el.setAttribute("playsinline", "");
              // ⚠️ KEIN el.play() hier! Auf iOS blockiert die Autoplay-Policy,
              // weil der User-Gesture-Kontext nach den await-Schritten in
              // connect() bereits verfallen ist. Stattdessen speichern wir
              // das Element und resumen ALLE gesammelten Elemente NACH
              // room.startAudio() (siehe resumeAudioElements unten).
              audioElementsRef.current.add(el);
              console.log(
                `[voice] audio track subscribed: source=${track.source ?? "unknown"}, kind=${track.kind}`,
              );
            } catch (err) {
              console.warn("[voice] track.attach failed:", err);
            }
          }
          applyOutputVolume(room);
          snapshotParticipants(room);
        });
        room.on(RoomEvent.LocalTrackPublished, (pub) => {
          const isEnabled = room.localParticipant.isScreenShareEnabled;
          setScreenShare(isEnabled);
          // Prüfen, ob Screen-Share-Audio-Track vorhanden ist
          const audioPub = room.localParticipant.getTrackPublication(
            Track.Source.ScreenShareAudio,
          );
          setScreenShareHasAudio(isEnabled && !!audioPub?.track);
          if (isEnabled && !audioPub?.track) {
            console.warn(
              "[voice] Screen-Share gestartet, aber KEIN Audio-Track erkannt. Der Nutzer muss beim Teilen eines Browser-Tabs 'Tab-Audio teilen' aktivieren.",
            );
          }
          snapshotParticipants(room);
        });
        room.on(RoomEvent.LocalTrackUnpublished, () => {
          // Catches the browser's native "Stop sharing" button, not just our own toggle.
          const isEnabled = room.localParticipant.isScreenShareEnabled;
          setScreenShare(isEnabled);
          if (!isEnabled) setScreenShareHasAudio(false);
          snapshotParticipants(room);
        });
        room.on(RoomEvent.Disconnected, () => {
          roomRef.current = null;
          stopMicPipeline();
          clearPresence();
          audioElementsRef.current.forEach((el) => {
            try { el.pause(); el.remove(); } catch (_) { /* ignore */ }
          });
          audioElementsRef.current.clear();
          setParticipants([]);
          setScreenShare(false);
          setScreenShareHasAudio(false);
          setConnection({
            status: "idle",
            serverId: null,
            channelId: null,
            channelName: null,
            error: null,
          });
        });

        await room.connect(data.url, data.token);

        // Audio-Tracks von Teilnehmern, die bereits vor uns im Raum waren,
        // wurden vor unserem on(TrackSubscribed)-Listener subscribt - also
        // hängen wir sie hier nachträglich an. Auch hier kein el.play() -
        // wird gemeinsam nach startAudio() resumed.
        room.remoteParticipants.forEach((p) => {
          p.audioTrackPublications.forEach((pub) => {
            if (pub.track && pub.track.kind === "audio") {
              try {
                const el = pub.track.attach();
                el.setAttribute("playsinline", "");
                audioElementsRef.current.add(el);
              } catch (err) {
                /* bereits attached, ignorieren */
              }
            }
          });
        });

        // iOS erzwingt eine explizite Freigabe der Audiowiedergabe, da der
        // Browser Autoplay blockiert. startAudio() nach dem Attachment aller
        // bestehenden Tracks aufrufen, damit sie alle erfasst werden.
        // Bei Bedarf mehrfach versuchen (iOS braucht manchmal zwei Anläufe).
        for (let i = 0; i < 3; i++) {
          try {
            await room.startAudio();
            break;
          } catch {
            /* retry */
          }
          await new Promise((r) => setTimeout(r, 100));
        }
        applyOutputVolume(room);
        // iOS: Alle <audio>-Elemente, die während connect() (vor startAudio)
        // attached wurden, jetzt explizit abspielen. Ohne diesen Schritt
        // bleiben sie auf iOS stumm, weil die Autoplay-Policy zum Zeitpunkt
        // des Attachments noch blockiert war.
        resumeAudioElements();

        // Den unlock AudioContext NICHT schließen - auf iOS Safari kann
        // der Unlock-Status bei Navigation/Route-Change verloren gehen,
        // wenn kein aktiver AudioContext mehr existiert. Ein minimaler,
        // stummer Context hält die Seite für die gesamte Session entsperrt.

        presenceRef.current = { serverId, channelId, uid: firebaseUser.uid };
        joinVoicePresence(serverId, channelId, firebaseUser.uid, {
          name: userDoc?.displayName ?? firebaseUser.displayName ?? "Nutzer",
          avatarUrl: userDoc?.avatarUrl ?? null,
        }).catch((err) =>
          console.warn("[voice] joinVoicePresence failed:", err),
        );

        if (activeAudioInputIdRef.current) {
          await room
            .switchActiveDevice("audioinput", activeAudioInputIdRef.current)
            .catch(() => {});
        }
        if (activeAudioOutputIdRef.current) {
          await room
            .switchActiveDevice("audiooutput", activeAudioOutputIdRef.current)
            .catch(() => {});
        }

        let micFailed = false;
        try {
          await room.localParticipant.setMicrophoneEnabled(!mutedRef.current);
        } catch (micErr) {
          // Handled gracefully below (join muted + visible banner) - warn, not error.
          console.warn("[voice] microphone unavailable:", micErr);
          micFailed = true;
        }

        snapshotParticipants(room);
        if (micFailed) setMuted(true);
        mutedRef.current = micFailed || mutedRef.current;
        if (!micFailed && !mutedRef.current) startMicPipeline(room);

        Room.getLocalDevices("audioinput", true)
          .then((devices) => {
            setAudioInputs(
              devices.map((d) => ({ deviceId: d.deviceId, label: d.label })),
            );
            if (!micFailed)
              setActiveAudioInputIdState(
                room.getActiveDevice("audioinput") ?? null,
              );
          })
          .catch((err) => console.warn("[voice] loadAudioInputs failed:", err));
        Room.getLocalDevices("audiooutput", true)
          .then((devices) => {
            setAudioOutputs(
              devices.map((d) => ({ deviceId: d.deviceId, label: d.label })),
            );
            setActiveAudioOutputIdState(
              room.getActiveDevice("audiooutput") ?? null,
            );
          })
          .catch((err) =>
            console.warn("[voice] loadAudioOutputs failed:", err),
          );

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
        if (unlockCtxRef.current && unlockCtxRef.current.state !== "closed") {
          unlockCtxRef.current.close().catch(() => {});
        }
        setConnection({
          status: "error",
          serverId,
          channelId,
          channelName: channelName ?? null,
          error: "Verbindung zum Sprachkanal fehlgeschlagen.",
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firebaseUser, userDoc],
  );

  const disconnect = useCallback(async () => {
    stopMicPipeline();
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    clearPresence();
    // Gesammelte Audio-Elemente freigeben
    audioElementsRef.current.forEach((el) => {
      try { el.pause(); el.remove(); } catch (_) { /* ignore */ }
    });
    audioElementsRef.current.clear();
    setParticipants([]);
    setScreenShare(false);
    setConnection({
      status: "idle",
      serverId: null,
      channelId: null,
      channelName: null,
      error: null,
    });
    // iOS unlock AudioContext freigeben (wird beim nächsten connect() neu angelegt)
    if (unlockCtxRef.current && unlockCtxRef.current.state !== "closed") {
      unlockCtxRef.current.close().catch(() => {});
      unlockCtxRef.current = null;
    }
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
        // Manuelles Unmuten hebt nicht den Taubschalt-Modus auf;
        // nur explizites Undeafen darf das. (Discord-Verhalten)
        mutedByDeafenRef.current = false;
      }
      return;
    }
    try {
      await room.localParticipant.setMicrophoneEnabled(!next);
      mutedRef.current = next;
      setMuted(next);
      if (!next) {
        // UNMUTE: sicherstellen, dass LiveKit den neuen Track bereit hat
        // Manuelles Unmuten hebt nicht den Taubschalt-Modus auf.
        mutedByDeafenRef.current = false;
        await waitForMicTrack(room);
        startMicPipeline(room);
      } else {
        // MUTE: Pipeline anhalten (AudioContext bleibt offen)
        mutedByDeafenRef.current = false;
        stopMicPipeline();
      }
    } catch (err) {
      console.warn("[voice] toggleMute failed:", err);
      mutedRef.current = true;
      setMuted(true);
    }
    snapshotParticipants(room);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deafening also mutes the mic (matches Discord) - but undeafen should
  // only RELEASE that mute if deafen is what caused it. A mute that already
  // existed before deafening is left alone on undeafen.
  const toggleDeafen = useCallback(async () => {
    const room = roomRef.current;
    const next = !deafenedRef.current;
    deafenedRef.current = next;
    setDeafened(next);

    if (room) {
      room.remoteParticipants.forEach((p) => {
        if (typeof p.setVolume === "function") {
          // LiveKit-API: Volume auf 0 = stumm, Normalwert = hörbar
          p.setVolume(
            next ? 0 : outputVolumeRef.current / 100,
            Track.Source.Microphone,
          );
          p.setVolume(
            next ? 0 : outputVolumeRef.current / 100,
            Track.Source.ScreenShareAudio,
          );
        } else {
          // Fallback: Elemente direkt muten
          p.audioTrackPublications.forEach((pub) => {
            if (pub.track)
              pub.track.attachedElements.forEach((el) => (el.muted = next));
          });
        }
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
          await waitForMicTrack(room);
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !screenShare;
    try {
      await room.localParticipant.setScreenShareEnabled(next, {
        audio: {
          channelCount: 2,
          sampleRate: 48000,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        resolution: { width: 1920, height: 1080, frameRate: 60 },
      });
      setScreenShare(next);
      if (next) {
        // Warten bis der Screen-Share-Video-Track wirklich registriert ist,
        // damit snapshotParticipants ihn erfasst → ScreenShareTile rendert.
        for (let i = 0; i < 30; i++) {
          if (room.localParticipant.getTrackPublication(Track.Source.ScreenShare)?.track) break;
          await new Promise((r) => setTimeout(r, 50));
        }
        // Kurz warten bis LiveKit den Audio-Track publiziert hat
        await new Promise((r) => setTimeout(r, 500));
        const audioPub = room.localParticipant.getTrackPublication(
          Track.Source.ScreenShareAudio,
        );
        const hasAudio = !!audioPub?.track;
        setScreenShareHasAudio(hasAudio);
        if (!hasAudio) {
          console.warn(
            "[voice] Screen-Share hat kein Audio - Browser erfasst nur Video. Tipp: Chrome-Tab teilen und 'Tab-Audio teilen' aktivieren.",
          );
        }
      } else {
        setScreenShareHasAudio(false);
      }
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
  // selection live needs one - otherwise it's stored and used on next connect().
  const loadAudioInputs = useCallback(async () => {
    try {
      const devices = await Room.getLocalDevices("audioinput", true);
      const mapped = devices.map((d) => ({
        deviceId: d.deviceId,
        label: d.label,
      }));
      setAudioInputs(mapped);
      // Auto-select first device if none selected yet (system default)
      if (!activeAudioInputIdRef.current && mapped.length > 0) {
        activeAudioInputIdRef.current = mapped[0].deviceId;
        setActiveAudioInputIdState(mapped[0].deviceId);
      }
      const room = roomRef.current;
      if (room)
        setActiveAudioInputIdState(
          room.getActiveDevice("audioinput") ?? mapped[0]?.deviceId ?? null,
        );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAudioOutputs = useCallback(async () => {
    try {
      const devices = await Room.getLocalDevices("audiooutput", true);
      const mapped = devices.map((d) => ({
        deviceId: d.deviceId,
        label: d.label,
      }));
      setAudioOutputs(mapped);
      // Auto-select first device if none selected yet (system default)
      if (!activeAudioOutputIdRef.current && mapped.length > 0) {
        activeAudioOutputIdRef.current = mapped[0].deviceId;
        setActiveAudioOutputIdState(mapped[0].deviceId);
      }
      const room = roomRef.current;
      if (room)
        setActiveAudioOutputIdState(
          room.getActiveDevice("audiooutput") ?? mapped[0]?.deviceId ?? null,
        );
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
    screenShareHasAudio,
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
