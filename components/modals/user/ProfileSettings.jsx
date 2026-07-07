"use client";

import { useState, useEffect } from "react";
import { Warning, Key, CaretDown } from "@phosphor-icons/react";
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
  Avatar,
  ConfirmModal,
} from "@/components";

const STATUS_OPTIONS = [
  { value: "online", label: "Online", color: "#4ac263" },
  { value: "busy", label: "Beschäftigt", color: "#f59e0b" },
  { value: "idle", label: "Abwesend", color: "#f59e0b" },
  { value: "offline", label: "Offline", color: "#686868" },
];

export default function ProfileSettings({ open }) {
  const { userDoc, firebaseUser } = useAuth();
  const [displayName, setDisplayName] = useState(userDoc?.displayName ?? "");
  const [username, setUsernameState] = useState(userDoc?.username ?? "");
  const [status, setStatus] = useState(userDoc?.status ?? "online");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [reauthEmail, setReauthEmail] = useState(null);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthSaving, setReauthSaving] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(userDoc?.displayName ?? "");
      setUsernameState(userDoc?.username ?? "");
      setStatus(userDoc?.status ?? "online");
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
      setError("Benutzername: 3–20 Zeichen, nur Buchstaben, Zahlen und Unterstriche");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const updates = { displayName: name, status };
      if (uname && uname !== userDoc?.username) {
        await setUsername(firebaseUser.uid, uname);
      }
      if (name !== (userDoc?.displayName ?? "") || status !== (userDoc?.status ?? "online")) {
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
        err?.message?.includes("invalid-credential")
          ? "Falsches Passwort. Versuche es erneut."
          : err?.message || "Fehler beim Löschen des Accounts",
      );
      setReauthSaving(false);
    }
  }

  const selectedStatus = STATUS_OPTIONS.find((o) => o.value === status);
  const memberSince = firebaseUser?.metadata?.creationTime
    ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-lg">
      {/* Sichtbarkeit */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Sichtbarkeit</h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between rounded-xl bg-surface-hover border border-white/5 px-4 py-3 text-left cursor-pointer"
          >
            <span className="text-[15px] text-white">{selectedStatus?.label}</span>
            <CaretDown className="text-zinc-400 transition-transform" />
          </button>
          {statusDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-surface-hover border border-white/5 overflow-hidden z-10">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setStatus(opt.value);
                    setStatusDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer border-none"
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: opt.color }} />
                  <span className="text-[15px]">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Persönliche Daten */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Persönliche Daten</h3>
        <div className="flex flex-col gap-4">
          {/* Benutzername */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Benutzername</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsernameState(e.target.value)}
              maxLength={20}
              minLength={3}
              placeholder="benutzername"
              className="w-full rounded-xl bg-surface-hover border border-white/5 px-4 py-3 text-[15px] text-white outline-none placeholder:text-zinc-600 focus:border-[#8a38f5]/50"
            />
          </div>

          {/* E-Mail */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">E-Mail Adresse</label>
            <input
              type="email"
              value={firebaseUser?.email ?? ""}
              disabled
              className="w-full rounded-xl bg-surface-hover border border-white/5 px-4 py-3 text-[15px] text-white outline-none opacity-60 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Mitglied seit */}
      {memberSince && (
        <p className="text-sm text-zinc-500">
          Mitglied seit {memberSince}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 px-3 py-2 bg-red-500/10 rounded-xl">
          {error}
        </p>
      )}

      {/* Save button */}
      {hasChanges && (
        <button
          type="submit"
          disabled={saving || !displayName.trim()}
          className="w-full rounded-xl bg-accent px-4 py-3 text-[15px] font-semibold text-white border-none cursor-pointer hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Speichern…" : "Änderungen speichern"}
        </button>
      )}

      {/* Account löschen */}
      <div className="mt-4">
        <h3 className="text-base font-bold text-white mb-2">Account Löschen</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Um Ihren Account unwiderruflich zu löschen können Sie auf den nachfolgenden Button klicken.
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="w-full flex items-center justify-between rounded-xl bg-red px-4 py-3 text-[15px] font-semibold text-white border-none cursor-pointer hover:bg-red-hover"
        >
          <span>Account Löschen</span>
          <Trash weight="regular" className="text-lg" />
        </button>
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

      {reauthEmail && (
        <div className="rounded-xl border border-red-500 bg-red-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="text-red-500 shrink-0 text-lg" />
            <span className="text-sm font-semibold text-red-500">Passwort bestätigen</span>
          </div>
          <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
            Aus Sicherheitsgründen musst du dein Passwort erneut eingeben, um den Account zu löschen.
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
              className="w-full rounded-xl border border-white/10 bg-surface-deep px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
            />
            {deleteError && (
              <p className="text-xs text-red-500">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReauthAndDelete}
                disabled={reauthSaving}
                className="rounded-xl bg-red px-4 py-2 text-sm font-medium text-white border-none cursor-pointer hover:bg-red-hover disabled:opacity-50"
              >
                {reauthSaving ? "Lösche…" : "Account löschen"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReauthEmail(null);
                  setReauthPassword("");
                  setDeleteError("");
                }}
                className="rounded-xl bg-transparent px-4 py-2 text-sm font-medium text-zinc-400 border border-white/10 cursor-pointer hover:bg-white/5"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
