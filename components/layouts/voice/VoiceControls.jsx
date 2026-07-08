"use client";

import {
  SpeakerHigh,
  MicrophoneSlash,
  Microphone,
  Headphones,
  MonitorPlay,
  PhoneDisconnect,
  Stop,
} from "@phosphor-icons/react";
import { ControlButton } from "@/components";
import { useVoice } from "@/context";
import { twMerge } from "tailwind-merge";

/**
 * VoiceControls – Konfigurierbare Button-Leiste für Sprachkanal-Steuerung.
 *
 * Bezieht State + Callbacks automatisch aus VoiceContext. Keine Props nötig.
 * Der Parent wählt via `items` aus, welche Buttons erscheinen.
 *
 * @param {object}   props
 * @param {string[]} [props.items] – Button-Keys in gewünschter Reihenfolge
 *        "speaker"    Speaker-Icon (mobileOnly), toggelt Taubschalten
 *        "mute"       Mikrofon stummschalten / aktivieren
 *        "deafen"     Kopfhörer (Taubschalten an/aus)
 *        "screen"     Bildschirm teilen / beenden
 *        "disconnect" Sprachkanal verlassen
 * @param {string}   [props.className]
 */
export default function VoiceControls({
  items = ["speaker", "mute", "deafen", "screen", "disconnect"],
  className = "",
  buttonClassName = "",
}) {
  const voice = useVoice();

  const buttons = {
    speaker: (
      <ControlButton
        className={buttonClassName}
        key="speaker"
        active={voice.deafened}
        onClick={voice.toggleDeafen}
        mobileOnly
      >
        <SpeakerHigh weight="regular" className="text-xl" />
      </ControlButton>
    ),
    mute: (
      <ControlButton
        className={buttonClassName}
        key="mute"
        danger={voice.muted}
        onClick={voice.toggleMute}
      >
        {voice.muted ? (
          <MicrophoneSlash weight="regular" className="text-xl" />
        ) : (
          <Microphone weight="regular" className="text-xl" />
        )}
      </ControlButton>
    ),
    deafen: (
      <ControlButton
        className={buttonClassName}
        key="deafen"
        danger={voice.deafened}
        onClick={voice.toggleDeafen}
      >
        <Headphones weight="regular" className="text-xl" />
      </ControlButton>
    ),
    screen: (
      <ControlButton
        className={buttonClassName}
        key="screen"
        active={voice.screenShare}
        onClick={voice.toggleScreenShare}
      >
        {voice.screenShare ? (
          <Stop weight="fill" className="text-xl" />
        ) : (
          <MonitorPlay weight="regular" className="text-xl" />
        )}
      </ControlButton>
    ),
    disconnect: (
      <ControlButton
        className={buttonClassName}
        key="disconnect"
        danger
        onClick={voice.disconnect}
      >
        <PhoneDisconnect weight="regular" className="text-xl" />
      </ControlButton>
    ),
  };

  return (
    <div
      className={twMerge(
        "flex items-center gap-2 rounded-3xl bg-surface-deep p-3",
        className,
      )}
    >
      {items.map((key) => buttons[key])}
    </div>
  );
}
