"use client";

import { useState, useEffect, useRef } from "react";
import { Warning, Key, CaretDown, Trash, Check } from "@phosphor-icons/react";
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
  Button,
  ConfirmModal,
  ContextMenu,
  StatusDot,
  Input,
} from "@/components";

const STATUS_OPTIONS = [
  { value: "online", label: "Online", color: "#4ac263" },
  { value: "busy", label: "Beschäftigt", color: "#f5340b" },
  { value: "idle", label: "Abwesend", color: "#f5340b" },
  { value: "offline", label: "Offline", color: "#686868" },
];

// ────────────────────────────── Component ──────────────────────────────

export default function ProfileSettings({ open }) {
  const { userDoc, firebaseUser } = useAuth();

  // Profile form state
  const [displayName, setDisplayName] = useState(
    userDoc?.displayName ?? "",
  );
  const [username, setUsernameState] = useState(userDoc?.username ?? "");
  const [status, setStatus] = useState(userDoc?.status ?? "online");

  // General UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [reauthEmail, setReauthEmail] = useState(null);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthSaving, setReauthSaving] = useState(false);

  // Status dropdown
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusTriggerRef = useRef(null);

  // ── derived data ──

  const handle =
    userDoc?.username
      ? `${userDoc.username}${userDoc?.tag ? `#${userDoc.tag}` : ""}`
      : null;

  const selectedStatus = STATUS_OPTIONS.find((o) => o.value === status);

  const memberSince = firebaseUser?.metadata?.creationTime
    ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString(
        "de-DE",
        { day: "2-digit", month: "2-digit", year: "numeric" },
      )
    : null;

  const hasChanges =
    displayName.trim() !== (userDoc?.displayName ?? "") ||
    username.trim() !== (userDoc?.username ?? "") ||
    status !== (userDoc?.status ?? "online");

  // ── reset on modal open ──

  useEffect(() => {
    if (open) {
      setDisplayName(userDoc?.displayName ?? "");
      setUsernameState(userDoc?.username ?? "");
      setStatus(userDoc?.status ?? "online");
      setError("");
      setSuccess(false);
    }
  }, [open, userDoc?.displayName, userDoc?.username, userDoc?.status]);

  // ── status menu items ──

  const statusMenuItems = STATUS_OPTIONS.map((opt) => ({
    icon: <StatusDot color={opt.color} />,
    label: opt.label,
    active: status === opt.value,
    onClick: () => setStatus(opt.value),
  }));

  // ── handlers ──

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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
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

  // ── render sections ──

  function renderAvatarSection() {
    return (
      <div className="flex items-center gap-4 rounded-2xl bg-surface-deep border border-white/5 p-4">
        <Avatar
          src={userDoc?.avatarUrl}
          name={displayName || "?"}
          size="xl"
          status={status}
        />
        <div className="min-w-0">
          <p className="text-lg font-bold text-white truncate">
            {displayName || "Unbekannt"}
          </p>
          {handle && (
            <p className="text-sm text-zinc-400 truncate">{handle}</p>
          )}
          {memberSince && (
            <p className="text-xs text-zinc-500 mt-0.5">
              Mitglied seit {memberSince}
            </p>
          )}
        </div>
      </div>
    );
  }

  function renderStatusSection() {
    return (
      <section>
        <h3 className="text-base font-bold text-white mb-3">Sichtbarkeit</h3>
        <div className="relative">
          <button
            ref={statusTriggerRef}
            type="button"
            onClick={() => setStatusDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between rounded-xl bg-surface-hover border border-white/5 px-4 py-3 text-left cursor-pointer"
          >
            <span className="flex items-center gap-3 text-base text-white">
              <StatusDot color={selectedStatus?.color} />
              {selectedStatus?.label}
            </span>
            <CaretDown className="text-zinc-400 transition-transform shrink-0" />
          </button>
          <ContextMenu
            mode="inline"
            open={statusDropdownOpen}
            onClose={() => setStatusDropdownOpen(false)}
            triggerRef={statusTriggerRef}
            items={statusMenuItems}
          />
        </div>
      </section>
    );
  }

  function renderPersonalDataSection() {
    return (
      <section>
        <h3 className="text-base font-bold text-white mb-3">
          Persönliche Daten
        </h3>
        <div className="flex flex-col gap-4">
          {/* Anzeigename */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Anzeigename
            </label>
            <Input
              variant="surface"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={32}
              placeholder="Dein Name"
            />
          </div>

          {/* Handle */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              Handle
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-base pointer-events-none">
                #
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsernameState(e.target.value)}
                maxLength={20}
                minLength={3}
                placeholder="benutzername"
                className="w-full rounded-xl bg-surface-hover border border-white/5 pl-8 pr-4 py-3 text-base text-white outline-none placeholder:text-zinc-600 focus:border-accent/50"
              />
              {userDoc?.tag && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">
                  #{userDoc.tag}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 mt-1">
              Dein vollständiger Handle: {handle || "—"}
            </p>
          </div>

          {/* E-Mail */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              E-Mail Adresse
            </label>
            <Input
              variant="surface"
              type="email"
              value={firebaseUser?.email ?? ""}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
          </div>
        </div>
      </section>
    );
  }

  function renderActions() {
    return (
      <div className="flex items-center gap-3">
        <Button disabled={!hasChanges || saving || !displayName.trim()}>
          {saving ? "Speichere…" : "Änderungen speichern"}
        </Button>

        {success && (
          <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
            <Check weight="bold" className="text-sm" />
            Gespeichert
          </span>
        )}
      </div>
    );
  }

  function renderError() {
    if (!error) return null;
    return (
      <p className="text-xs text-red-500 px-3 py-2 bg-red-500/10 rounded-xl">
        {error}
      </p>
    );
  }

  function renderDangerSection() {
    return (
      <section className="border border-red-500/20 bg-red-900/5 rounded-xl p-4">
        <h3 className="text-base font-bold text-red-500 mb-2">
          Account löschen
        </h3>
        <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
          Dein Account, alle Nachrichten und Server-Mitgliedschaften werden
          unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht
          werden.
        </p>

        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <span>Account löschen</span>
          <Trash weight="regular" className="text-lg" />
        </Button>

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
      </section>
    );
  }

  function renderReauth() {
    if (!reauthEmail) return null;
    return (
      <div className="rounded-xl border border-red-500 bg-red-500/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Key className="text-red-500 shrink-0 text-lg" />
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
    );
  }

  // ── main render ──

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-lg">
      {renderAvatarSection()}
      {renderStatusSection()}
      {renderPersonalDataSection()}
      {renderError()}
      {renderActions()}
      {renderDangerSection()}
      {renderReauth()}
    </form>
  );
}
