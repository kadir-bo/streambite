"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Microphone } from "@phosphor-icons/react";
import { useVoice } from "@/context";
import { Select, SectionLabel, Button } from "@/components";

const TEST_BAR_COUNT = 30;

export default function VoiceVideoSettings() {
  const {
    audioInputs,
    activeAudioInputId,
    audioOutputs,
    activeAudioOutputId,
    inputVolume,
    outputVolume,
    micSensitivity,
    setInputVolume,
    setOutputVolume,
    setMicSensitivity,
    loadAudioInputs,
    loadAudioOutputs,
    selectAudioInput,
    selectAudioOutput,
  } = useVoice();

  const [testing, setTesting] = useState(false);
  const [level, setLevel] = useState(0);
  const [testError, setTestError] = useState("");
  const testRef = useRef(null); // { stream, audioContext, rafId }

  function stopTest() {
    const t = testRef.current;
    if (t) {
      cancelAnimationFrame(t.rafId);
      t.stream.getTracks().forEach((tr) => tr.stop());
      t.audioContext.close().catch(() => {});
      testRef.current = null;
    }
    setTesting(false);
    setLevel(0);
  }

  useEffect(() => {
    loadAudioInputs();
    loadAudioOutputs();
    return () => stopTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startTest() {
    setTestError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: activeAudioInputId ? { deviceId: { exact: activeAudioInputId } } : true,
      });
      const audioContext = new AudioContext();
      // iOS: AudioContext ist nach async getUserMedia oft "suspended"
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      function tick() {
        analyser.getByteTimeDomainData(data);
        let sumSquares = 0;
        for (let i = 0; i < data.length; i++) {
          const normalized = (data[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / data.length);
        setLevel(Math.min(1, rms * 4));
        testRef.current.rafId = requestAnimationFrame(tick);
      }

      testRef.current = { stream, audioContext, rafId: requestAnimationFrame(tick) };
      setTesting(true);
    } catch (err) {
      console.warn("[voice] mic test failed:", err);
      setTestError("Mikrofon konnte nicht getestet werden (Berechtigung verweigert?).");
    }
  }

  function toggleTest() {
    if (testing) stopTest();
    else startTest();
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-zinc-100">Sprachchat</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Select
          label="Mikrofon"
          value={activeAudioInputId ?? ""}
          onChange={(e) => selectAudioInput(e.target.value)}
        >
          {audioInputs.length === 0 && <option value="">Standard</option>}
          {audioInputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || "Mikrofon"}
            </option>
          ))}
        </Select>

        <Select
          label="Lautsprecher"
          value={activeAudioOutputId ?? ""}
          onChange={(e) => selectAudioOutput(e.target.value)}
        >
          {audioOutputs.length === 0 && <option value="">Standard</option>}
          {audioOutputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || "Lautsprecher"}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <SectionLabel>Mikrofonlautstärke</SectionLabel>
          <input
            type="range"
            min={0}
            max={100}
            value={inputVolume}
            onChange={(e) => setInputVolume(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-zinc-500 mt-1">{inputVolume}%</p>
        </div>
        <div>
          <SectionLabel>Lautsprecherlautstärke</SectionLabel>
          <input
            type="range"
            min={0}
            max={100}
            value={outputVolume}
            onChange={(e) => setOutputVolume(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-zinc-500 mt-1">{outputVolume}%</p>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant={testing ? "ghost" : "primary"} onClick={toggleTest}>
          <span className="flex items-center gap-2">
            <Microphone className="text-xl md:text-lg" />
            {testing ? "Test beenden" : "Mikrofontest"}
          </span>
        </Button>
        <div className="flex flex-1 items-center gap-0.5 h-5">
          {Array.from({ length: TEST_BAR_COUNT }).map((_, i) => (
            <span
              key={i}
              className="h-5 flex-1 rounded-[4px] transition-colors duration-75"
              style={{
                backgroundColor:
                  testing && level * TEST_BAR_COUNT > i
                    ? "var(--accent)"
                    : "var(--surface-deep)",
              }}
            />
          ))}
        </div>
      </div>
      {testError && <p className="text-xs text-red-500">{testError}</p>}

      <div className="h-px bg-white/5" />

      <div>
        <SectionLabel>Mikrofonempfindlichkeit</SectionLabel>
        <p className="text-xs text-zinc-500 mb-2">
          Bestimmt, ab welcher Lautstärke dein Mikrofon Ton überträgt.
        </p>
        <input
          type="range"
          min={0}
          max={100}
          value={micSensitivity}
          onChange={(e) => setMicSensitivity(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-zinc-500 mt-1">{micSensitivity}%</p>
      </div>
    </div>
  );
}
