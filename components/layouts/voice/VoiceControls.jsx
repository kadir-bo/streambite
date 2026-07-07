"use client";

import {
  SpeakerHigh,
  MicrophoneSlash,
  Microphone,
  Headphones,
  MonitorPlay,
  PhoneDisconnect,
} from "@phosphor-icons/react";

/**
 * Floating voice controls bar.
 *
 * @param {object}  props
 * @param {boolean} props.muted        – Mic currently muted
 * @param {boolean} props.deafened     – Speaker currently muted
 * @param {boolean} props.screenShare  – Screen share active
 * @param {Function} props.onToggleMute
 * @param {Function} props.onToggleDeafen
 * @param {Function} props.onToggleScreenShare
 * @param {Function} props.onDisconnect
 */
export default function VoiceControls({
  muted,
  deafened,
  screenShare,
  onToggleMute,
  onToggleDeafen,
  onToggleScreenShare,
  onDisconnect,
}) {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center px-4">
      <div className="flex items-center gap-2 rounded-3xl bg-surface-deep p-3">
        {/* Speaker / Deafen */}
        <ControlButton
          active={!deafened}
          onClick={onToggleDeafen}
        >
          <SpeakerHigh weight="regular" className="text-xl" />
        </ControlButton>

        {/* Microphone */}
        <ControlButton
          danger={muted}
          onClick={onToggleMute}
        >
          {muted ? (
            <MicrophoneSlash weight="regular" className="text-xl" />
          ) : (
            <Microphone weight="regular" className="text-xl" />
          )}
        </ControlButton>

        {/* Headphones */}
        <ControlButton>
          <Headphones weight="regular" className="text-xl" />
        </ControlButton>

        {/* Screen Share */}
        <ControlButton
          active={screenShare}
          onClick={onToggleScreenShare}
        >
          <MonitorPlay weight="regular" className="text-xl" />
        </ControlButton>

        {/* Disconnect */}
        <ControlButton danger onClick={onDisconnect}>
          <PhoneDisconnect weight="regular" className="text-xl" />
        </ControlButton>
      </div>
    </div>
  );
}

/* ─── Single pill button ─── */
function ControlButton({ children, danger, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-none text-white transition-colors ${
        danger
          ? "bg-red hover:bg-red-hover"
          : active
            ? "bg-accent hover:bg-accent-hover"
            : "bg-surface-hover hover:bg-surface-raised"
      }`}
    >
      {children}
    </button>
  );
}
