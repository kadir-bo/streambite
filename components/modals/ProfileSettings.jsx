"use client";

import { useState, useEffect } from "react";
import { Warning, Key } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import {
  updateUserDocument,
  setUsername,
  deleteUserAccount,
  reauthWithPasswordAndDelete,
  ReAuthRequiredError,
  logoutUser,
} from "@/lib";
import {
  Input,
  Select,
  Button,
  Avatar,
  SectionLabel,
  ConfirmModal,
} from "@/components";

const STATUS_OPTIONS = [
  { value: "online", label: "Online", color: "#22c55e" },
  { value: "busy", label: "Beschäftigt", color: "#f59e0b" },
  { value: "idle", label: "Abwesend", color: "#f59e0b" },
  { value: "offline", label: "Offline", color: "#3f3f46" },
];

export default function ProfileSettings({ open }) {
  const { userDoc, firebaseUser } = useAuth();
  const [displayName, setDisplayName] = useState(userDoc?.displayName ?? "");
  const [username, setUsernameState] = useState(userDoc?.username ?? "");
  const [status, setStatus] = useState(userDoc?.status ?? "online");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [reauthEmail, setReauthEmail] = useState(null);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthSaving, setReauthSaving] = useState(false);

  // userDoc loads after this modal's first mount (it lives in the always-on
  // sidebar), so re-sync the form fields whenever the modal is opened rather
  // than relying on the initial useState value.
  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setDisplayName(userDoc?.displayName ?? "");
      setUsernameState(userDoc?.username ?? "");
      setStatus(userDoc?.status ?? "online");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, userDoc?.displayName, userDoc?.username, userDoc?.status]);

  const hasChanges =
    displayName.trim() !== (userDoc?.displayName ?? "") ||
    username.trim() !== (userDoc?.username ?? "") ||
    status !== (userDoc?.status ?? "online");

  async function handleSave(e) {
    e.preventDefault();
    const name = displayName.trim();
    if (!name || name.length < 2) {
      setError("Name muss mindestens 2 Zeichen haben");
      return;
    }
    const uname = username.trim();
    if (uname && !/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
      setError(
        "Benutzername: 3–20 Zeichen, nur Buchstaben, Zahlen und Unterstriche",
      );
      return;
    }
    setError("");
    setSaving(true);
    try {
      const updates = { displayName: name, status };
      if (uname && uname !== userDoc?.username) {
        await setUsername(firebaseUser.uid, uname);
      }
      if (
        name !== (userDoc?.displayName ?? "") ||
        status !== (userDoc?.status ?? "online")
      ) {
        await updateUserDocument(firebaseUser.uid, updates);
      }
    } catch (err) {
      setError(err?.message || "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteUserAccount(firebaseUser.uid);
      await logoutUser();
    } catch (err) {
      if (err instanceof ReAuthRequiredError) {
        setReauthEmail(err.email);
        setDeleteOpen(false);
        setDeleting(false);
        return;
      }
      setDeleteError(err?.message || "Fehler beim Löschen des Accounts");
      setDeleting(false);
    }
  }

  async function handleReauthAndDelete() {
    if (!reauthPassword.trim()) return;
    setReauthSaving(true);
    setDeleteError("");
    try {
      await reauthWithPasswordAndDelete(reauthPassword);
      await logoutUser();
    } catch (err) {
      setDeleteError(
        err?.message === "Firebase: Error (auth/invalid-credential)." ||
          err?.message?.includes("invalid-credential")
          ? "Falsches Passwort. Versuche es erneut."
          : err?.message || "Fehler beim Löschen des Accounts",
      );
      setReauthSaving(false);
    }
  }

  const currentAvatar = avatarPreview ?? userDoc?.avatarUrl;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      {/* Avatar section */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar
            src={currentAvatar}
            name={displayName || userDoc?.displayName || "?"}
            size="xl"
            status={status}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-100 truncate">
            {displayName || userDoc?.displayName || "-"}
          </p>
          <p className="text-xs text-zinc-500 font-mono">
            {userDoc?.username
              ? `${userDoc.username}#${userDoc.tag}`
              : "Kein Benutzername"}
          </p>
          <p className="text-xs text-zinc-600 mt-0.5">
            {firebaseUser?.email}
          </p>
          {userDoc?.avatarUrl && (
            <button
              type="button"
              onClick={async () => {
                setUploadingAvatar(true);
                setError("");
                try {
                  await updateUserDocument(firebaseUser.uid, {
                    avatarUrl: null,
                  });
                  setAvatarPreview(null);
                } catch {
                  setError("Fehler beim Entfernen des Bildes");
                } finally {
                  setUploadingAvatar(false);
                }
              }}
              disabled={uploadingAvatar}
              className="text-xs text-red-500 hover:text-red-600 bg-transparent border-none cursor-pointer p-0 mt-1 transition-colors"
            >
              Bild entfernen
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Display name */}
      <div>
        <SectionLabel>Anzeigename</SectionLabel>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={32}
          minLength={2}
          placeholder="Dein Name"
        />
      </div>

      {/* Username */}
      <div>
        <SectionLabel>Benutzername</SectionLabel>
        <Input
          value={username}
          onChange={(e) => setUsernameState(e.target.value)}
          maxLength={20}
          minLength={3}
          placeholder="benutzername"
        />
        <p className="text-xs text-zinc-500 mt-1">
          3–20 Zeichen, nur Buchstaben, Zahlen und Unterstriche.
          {userDoc?.username && userDoc?.tag && (
            <span className="ml-1">
              Aktuell:{" "}
              <span className="font-mono">
                {userDoc.username}#{userDoc.tag}
              </span>
            </span>
          )}
        </p>
      </div>

      {/* Status */}
      <div>
        <SectionLabel>Status</SectionLabel>
        <div className="hidden md:grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`px-3 py-3 sm:px-1 sm:py-2.5 rounded-[8px] cursor-pointer flex flex-col items-center gap-1.5 sm:gap-1.25 transition-colors duration-120 min-h-12 sm:min-h-0 ${
                  active
                    ? "bg-white/10 border"
                    : "bg-transparent border border-white/5"
                }`}
                style={active ? { borderColor: opt.color } : {}}
              >
                <span
                  className="size-2.5 sm:size-2 rounded-full block"
                  style={{ backgroundColor: opt.color }}
                />
                <span
                  className={`text-xs sm:text-2xs text-center leading-tight ${
                    active
                      ? "text-zinc-100 font-semibold"
                      : "text-zinc-500 font-normal"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* DROP DOWN FOR MOBILE */}
      <div className="md:hidden">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="text-xs text-red-500 px-3 py-2 bg-red-500/10 rounded-[8px]">
          {error}
        </p>
      )}

      <Button
        type="submit"
        loading={saving}
        disabled={!hasChanges || !displayName.trim()}
      >
        Änderungen speichern
      </Button>

      {/* Account löschen */}
      <div className="h-px bg-white/5 mt-4" />
      <div className="rounded-[8px] border border-red-500 bg-red-500/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Warning className="text-red-500 shrink-0 text-xl md:text-lg" />
          <span className="text-sm font-semibold text-red-500">
            Account löschen
          </span>
        </div>
        <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
          Dein gesamtes Profil, alle Nachrichten und Server-Mitgliedschaften
          werden unwiderruflich gelöscht. Dies kann nicht rückgängig gemacht
          werden.
        </p>
        <Button
          type="button"
          variant="danger"
          onClick={() => setDeleteOpen(true)}
        >
          Account dauerhaft löschen
        </Button>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteError("");
        }}
        onConfirm={handleDeleteAccount}
        title="Account wirklich löschen?"
        description="Dein Account, alle Nachrichten und Server-Mitgliedschaften werden unwiderruflich gelöscht. Bist du sicher?"
        confirmLabel={deleting ? "Lösche…" : "Account löschen"}
        loading={deleting}
        error={deleteError}
      />

      {/* Re-Auth Passwort-Abfrage (nach "requires-recent-login") */}
      {reauthEmail && (
        <div className="rounded-[8px] border border-red-500 bg-red-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="text-red-500 shrink-0 text-xl md:text-lg" />
            <span className="text-sm font-semibold text-red-500">
              Passwort bestätigen
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
            Aus Sicherheitsgründen musst du dein Passwort erneut eingeben, um
            den Account zu löschen.
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              autoFocus
              placeholder="Passwort eingeben"
              value={reauthPassword}
              onChange={(e) => setReauthPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReauthAndDelete();
              }}
              className="w-full rounded-[8px] border border-white/10 bg-(--surface-deep) px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
            />
            {deleteError && (
              <p className="text-xs text-red-500">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="danger"
                onClick={handleReauthAndDelete}
                loading={reauthSaving}
              >
                Account löschen
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setReauthEmail(null);
                  setReauthPassword("");
                  setDeleteError("");
                }}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
