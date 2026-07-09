"use client";
import { useState } from "react";
import { Gear, SignOut, WifiHigh, CaretUp, BellSimple, CaretDownIcon, UserPlus } from "@phosphor-icons/react";
import { useAuth, useVoice } from "@/context";
import { useFriends } from "@/hooks";
import {
  updateUserDocument,
  logoutUser,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib";
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
  const { incomingRequests } = useFriends();
  const {
    connection,
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
    loadAudioInputs,
    selectAudioInput,
    loadAudioOutputs,
    selectAudioOutput,
    isSpeaking,
  } = useVoice();
  const inVoice = connection.status === "connected";
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [menuWidth, setMenuWidth] = useState(200);
  const longPress = useLongPress(openMenu);
  const [inputMenuOpen, setInputMenuOpen] = useState(false);
  const [inputMenuPos, setInputMenuPos] = useState({ x: 0, y: 0 });
  const [outputMenuOpen, setOutputMenuOpen] = useState(false);
  const [outputMenuPos, setOutputMenuPos] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [bellPos, setBellPos] = useState({ x: 0, y: 0 });
  const [bellWidth, setBellWidth] = useState(200);
  const displayName =
    userDoc?.displayName ?? firebaseUser?.displayName ?? "Nutzer";
  const status = userDoc?.status ?? "online";

  function openMenu(e) {
    const panel = e.currentTarget.closest("[data-user-panel]");
    const rect = (panel ?? e.currentTarget).getBoundingClientRect();
    setMenuPos({ x: rect.left + 12, y: rect.top - 4 });
    // Volle Panel-Breite minus 12px links + 12px rechts Padding
    setMenuWidth(rect.width - 24);
    setMenuOpen(true);
  }

  async function setStatus(newStatus) {
    if (!firebaseUser) return;
    await updateUserDocument(firebaseUser.uid, { status: newStatus });
  }

  const menuItems = [
    ...STATUS_OPTIONS.map((opt) => ({
      icon: <StatusDot relative color={STATUS_COLORS[opt.value]} />,
      label: opt.label,
      active: status === opt.value,
      onClick: () => setStatus(opt.value),
    })),
    { divider: true },
    {
      icon: <Gear className="text-lg" />,
      label: "Profileinstellungen",
      onClick: () => setShowSettings(true),
    },
    { divider: true },
    {
      icon: <SignOut className="text-lg" />,
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

  const pendingInvites = userDoc?.pendingInvites ?? [];
  const totalNotifications = incomingRequests.length + pendingInvites.length;

  function openBellMenu(e) {
    const panel = e.currentTarget.closest("[data-user-panel]");
    const rect = (panel ?? e.currentTarget).getBoundingClientRect();
    setBellPos({ x: rect.left + 12, y: rect.top - 4 });
    setBellWidth(rect.width - 24);
    setBellOpen(true);
  }

  const bellMenuItems = totalNotifications > 0
    ? [
        ...(incomingRequests.length > 0
          ? [{ icon: <UserPlus className="text-lg" />, label: `${incomingRequests.length} Freundschaftsanfrage${incomingRequests.length > 1 ? "n" : ""}`, onClick: () => { setBellOpen(false); } }]
          : []),
        ...(pendingInvites.length > 0
          ? [{ icon: <CaretUp className="text-lg" />, label: `${pendingInvites.length} Servereinladung${pendingInvites.length > 1 ? "en" : ""}`, onClick: () => { setBellOpen(false); } }]
          : []),
      ]
    : [{ label: "Keine Benachrichtigungen", disabled: true }];

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
        className="shrink-0 px-3 pt-1 max-sm:px-4 max-sm:pb-8 pb-4"
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
                size="md"
                status={status}
                isSpeaking={isSpeaking}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-base font-bold text-white">
                  {displayName}
                </p>
                <CaretDownIcon weight="regular" />
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
          <IconBtn
            icon={BellSimple}
            title="Benachrichtigungen"
            variant="surface"
            rounded="full"
            size="xl"
            mobileOnly
            onClick={openBellMenu}
          />
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

      <ContextMenu
        open={bellOpen}
        onClose={() => setBellOpen(false)}
        position={bellPos}
        anchor="bottom"
        width={bellWidth}
        items={bellMenuItems}
      />

      <UserSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
