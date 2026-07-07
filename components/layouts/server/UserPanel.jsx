"use client";
import { useState } from "react";
import {
  Gear,
  SignOut,
  Microphone,
  MicrophoneSlash,
  Headphones,
  PhoneDisconnect,
  WifiHigh,
  CaretUp,
  BellSimple,
} from "@phosphor-icons/react";
import { useAuth, useVoice } from "@/context";
import { updateUserDocument, logoutUser, STATUS_COLORS, STATUS_LABELS } from "@/lib";
import { useLongPress } from "@/hooks";
import {
  Avatar,
  ContextMenu,
  VolumeSlider,
  StatusDot,
  IconBtn,
} from "@/components";
import { UserSettingsModal } from "@/components";

const STATUS_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "busy", label: "Beschäftigt" },
  { value: "idle", label: "Abwesend" },
  { value: "offline", label: "Offline" },
];

export default function UserPanel() {
  const { userDoc, firebaseUser } = useAuth();
  const {
    connection,
    muted,
    deafened,
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
    toggleMute,
    toggleDeafen,
    disconnect,
    loadAudioInputs,
    selectAudioInput,
    loadAudioOutputs,
    selectAudioOutput,
  } = useVoice();
  const inVoice = connection.status === "connected";
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [menuWidth, setMenuWidth] = useState(0);
  const longPress = useLongPress(openMenu);
  const [inputMenuOpen, setInputMenuOpen] = useState(false);
  const [inputMenuPos, setInputMenuPos] = useState({ x: 0, y: 0 });
  const [outputMenuOpen, setOutputMenuOpen] = useState(false);
  const [outputMenuPos, setOutputMenuPos] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const displayName =
    userDoc?.displayName ?? firebaseUser?.displayName ?? "Nutzer";
  const status = userDoc?.status ?? "online";

  // Measured (not hardcoded) so the dropdown always matches the sidebar's
  // actual rendered width, even if that width changes elsewhere later.
  function openMenu(e) {
    const panel = e.currentTarget.closest("[data-user-panel]");
    const rect = (panel ?? e.currentTarget).getBoundingClientRect();
    setMenuPos({ x: rect.left, y: rect.top - 4 });
    setMenuWidth(rect.width);
    setMenuOpen(true);
  }

  function openInputMenu(e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setInputMenuPos({ x: rect.left, y: rect.top - 4 });
    loadAudioInputs();
    setInputMenuOpen(true);
  }

  function openOutputMenu(e) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setOutputMenuPos({ x: rect.left, y: rect.top - 4 });
    loadAudioOutputs();
    setOutputMenuOpen(true);
  }

  async function setStatus(newStatus) {
    if (!firebaseUser) return;
    await updateUserDocument(firebaseUser.uid, { status: newStatus });
  }

  const menuItems = [
    ...STATUS_OPTIONS.map((opt) => ({
      icon: <StatusDot color={STATUS_COLORS[opt.value]} />,
      label: opt.label,
      active: status === opt.value,
      onClick: () => setStatus(opt.value),
    })),
    { divider: true },
    {
      icon: <Gear />,
      label: "Profileinstellungen",
      onClick: () => setShowSettings(true),
    },
    { divider: true },
    {
      icon: <SignOut />,
      label: "Abmelden",
      danger: true,
      onClick: () => logoutUser(),
    },
  ];

  const activeInputLabel =
    audioInputs.find((d) => d.deviceId === activeAudioInputId)?.label ??
    "Standard";
  const activeOutputLabel =
    audioOutputs.find((d) => d.deviceId === activeAudioOutputId)?.label ??
    "Standard";

  const inputMenuItems = [
    {
      label: "Eingabegerät",
      subtitle: activeInputLabel,
      submenu: audioInputs.map((d) => ({
        label: d.label || "Mikrofon",
        active: d.deviceId === activeAudioInputId,
        onClick: () => selectAudioInput(d.deviceId),
      })),
    },
    { divider: true },
    {
      custom: (
        <VolumeSlider
          label="Eingabelautstärke"
          value={inputVolume}
          onChange={setInputVolume}
        />
      ),
    },
    { divider: true },
    {
      custom: (
        <VolumeSlider
          label="Mikrofonempfindlichkeit"
          value={micSensitivity}
          onChange={setMicSensitivity}
        />
      ),
    },
  ];

  const outputMenuItems = [
    {
      label: "Ausgabegerät",
      subtitle: activeOutputLabel,
      submenu: audioOutputs.map((d) => ({
        label: d.label || "Lautsprecher",
        active: d.deviceId === activeAudioOutputId,
        onClick: () => selectAudioOutput(d.deviceId),
      })),
    },
    { divider: true },
    {
      custom: (
        <VolumeSlider
          label="Ausgabelautstärke"
          value={outputVolume}
          onChange={setOutputVolume}
        />
      ),
    },
  ];

  return (
    <>
      <div
        data-user-panel
        className="shrink-0 px-3 pb-3 pt-1 max-sm:px-4 max-sm:pb-4 bg-surface-sidebar border-r border-white/5"
      >
        <div className="flex items-center gap-3 rounded-2xl bg-surface-deep p-3">
          {/* Avatar + Name + Status */}
          <button
            {...longPress.handlers}
            onClick={openMenu}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-none bg-transparent p-0 text-left"
          >
            <div className="relative shrink-0">
              <Avatar
                src={userDoc?.avatarUrl}
                name={displayName}
                size="lg"
                status={status}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-[15px] font-bold text-white">
                  {displayName}
                </p>
                <svg
                  className="shrink-0 text-zinc-400"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {inVoice ? (
                <p className="flex items-center gap-1 truncate text-xs font-medium text-accent">
                  <WifiHigh size={12} className="shrink-0" />
                  Sprachverbunden
                </p>
              ) : (
                <p className="truncate text-xs text-zinc-500">
                  {STATUS_LABELS[status] ?? "Online"}
                </p>
              )}
            </div>
          </button>

          {/* Bell icon */}
          <button
            type="button"
            title="Benachrichtigungen"
            className="flex shrink-0 items-center justify-center size-10 rounded-full border-none bg-surface-hover text-zinc-400 cursor-pointer transition-colors hover:text-white"
          >
            <BellSimple weight="regular" className="text-xl" />
          </button>
        </div>
      </div>

      <ContextMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        position={menuPos}
        anchor="bottom"
        width={menuWidth}
        items={menuItems}
      />

      <ContextMenu
        open={inputMenuOpen}
        onClose={() => setInputMenuOpen(false)}
        position={inputMenuPos}
        anchor="bottom"
        width={190}
        items={inputMenuItems}
      />

      <ContextMenu
        open={outputMenuOpen}
        onClose={() => setOutputMenuOpen(false)}
        position={outputMenuPos}
        anchor="bottom"
        width={190}
        items={outputMenuItems}
      />

      <UserSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
