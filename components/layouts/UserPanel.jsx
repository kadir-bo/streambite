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
} from "@phosphor-icons/react";
import { useAuth, useVoice } from "@/context";
import { updateUserDocument, logoutUser } from "@/lib";
import { Avatar, ContextMenu, VolumeSlider, StatusDot, IconBtn } from "@/components";
import { UserSettingsModal } from "@/components";

const STATUS_LABELS = {
  online: "Online",
  busy: "Beschäftigt",
  idle: "Abwesend",
  offline: "Offline",
};

const STATUS_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "busy", label: "Beschäftigt" },
  { value: "idle", label: "Abwesend" },
  { value: "offline", label: "Offline" },
];

const STATUS_COLORS = {
  online: "var(--status-online)",
  busy: "var(--status-busy)",
  idle: "var(--status-idle)",
  offline: "var(--status-offline)",
};

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
        className="flex flex-col shrink-0 items-center gap-1.5 border-t border-(--border-subtle) bg-(--surface-deep) p-2 max-sm:p-3 max-sm:gap-2 pb-safe-2"
      >
        <div className="flex w-full justify-end gap-4">
          <button
            onClick={openMenu}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-(--radius-base) bg-transparent p-1 text-left transition-[background] duration-100 hover:bg-(--state-hover) max-sm:min-h-12"
          >
            <Avatar
              src={userDoc?.avatarUrl}
              name={displayName}
              size="sm"
              status={status}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-(--text-primary)">
                {displayName}
              </p>
              {inVoice ? (
                <p className="flex items-center gap-1 truncate text-xs font-medium text-(--accent)">
                  <WifiHigh size={12} className="shrink-0" />
                  Sprachverbunden
                </p>
              ) : (
                <p className="truncate text-xs text-(--text-muted)">
                  {STATUS_LABELS[status] ?? "Online"}
                </p>
              )}
            </div>
          </button>
          <div className="flex items-center shrink-0 max-sm:gap-2">
            <IconBtn
              icon={muted ? MicrophoneSlash : Microphone}
              onClick={toggleMute}
              title={muted ? "Stummschaltung aufheben" : "Stummschalten"}
              variant={muted ? "danger" : "ghost"}
              className={`max-sm:rounded-full ${muted ? "!bg-(--danger) !text-white" : ""}`}
            />

            <button
              onClick={openInputMenu}
              title="Eingabegerät & Lautstärke"
              className="hidden sm:flex size-5 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-(--text-muted) hover:bg-(--state-hover) hover:text-(--text-secondary)"
            >
              <CaretUp weight="bold" className="text-sm" />
            </button>
          </div>
          <div className="hidden sm:flex items-center rounded-(--radius-base) overflow-hidden shrink-0 group">
            <IconBtn
              icon={Headphones}
              onClick={toggleDeafen}
              title={deafened ? "Hörgerät aktivieren" : "Tauben schalten"}
              variant={deafened ? "danger" : "ghost"}
            />

            <button
              onClick={openOutputMenu}
              title="Ausgabegerät & Lautstärke"
              className="flex size-5 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-(--text-muted) hover:bg-(--state-hover) hover:text-(--text-secondary) text-sm md:text-base group-hover:bg-(--state-hover)/50 h-full"
            >
              <CaretUp weight="bold" className="text-sm" />
            </button>
          </div>

          {inVoice && (
            <IconBtn
              icon={PhoneDisconnect}
              onClick={disconnect}
              title="Sprachkanal verlassen"
              variant="danger"
            />
          )}
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
