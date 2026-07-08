"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Link, CopySimple, Check } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import {
  updateServer,
  leaveServer,
  deleteServer,
  uploadToCloudinary,
} from "@/lib";
import { Modal, Input, Button, ServerIcon, SectionLabel } from "@/components";
import { twMerge } from "tailwind-merge";

export default function ServerSettingsModal({ open, onClose, server }) {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [name, setName] = useState(server?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // server is passed in before it's loaded (mount happens ahead of the
  // servers list resolving), so re-sync the name field whenever the modal
  // is opened rather than relying on the initial useState value.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setName(server?.name ?? "");
  }, [open, server?.name]);

  const isOwner = server?.ownerId === firebaseUser?.uid;
  const inviteLink = server?.inviteCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${server.inviteCode}`
    : "";

  async function handleIconChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!server?.id) {
      setError("Server nicht geladen");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Bild ist zu groß (max. 4 MB)");
      return;
    }
    setIconPreview(URL.createObjectURL(file));
    setUploadingIcon(true);
    setError("");
    try {
      const url = await uploadToCloudinary(
        file,
        `streambite/servers/${server.id}`,
      );
      await updateServer(server.id, { iconUrl: url });
    } catch {
      setError("Fehler beim Speichern des Bildes");
      setIconPreview(null);
    } finally {
      setUploadingIcon(false);
      e.target.value = "";
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Servername darf nicht leer sein");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await updateServer(server.id, { name: trimmed });
      onClose();
    } catch {
      setError("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  async function handleLeave() {
    if (!firebaseUser || !server) return;
    setLeaving(true);
    try {
      await leaveServer(server.id, firebaseUser.uid);
      onClose();
      router.push("/channels");
    } catch {
      setError("Fehler beim Verlassen des Servers");
      setLeaving(false);
    }
  }

  async function handleDelete() {
    if (!firebaseUser || !server) return;
    setDeleting(true);
    try {
      await deleteServer(server.id, firebaseUser.uid);
      onClose();
      router.push("/channels");
    } catch {
      setError("Fehler beim Löschen des Servers");
      setDeleting(false);
    }
  }

  async function copyInvite() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const currentIcon = iconPreview ?? server?.iconUrl;

  return (
    <Modal open={open} onClose={onClose} title="Servereinstellungen">
      <div className="flex flex-col gap-5">
        {/* Server icon */}
        {isOwner && (
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="size-16 rounded-lg overflow-hidden border border-white/5">
                <ServerIcon
                  name={server?.name}
                  iconUrl={currentIcon}
                  size={64}
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingIcon}
                className={twMerge(
                  "absolute inset-0 rounded-lg flex items-center justify-center border-none cursor-pointer text-white transition-opacity duration-150 hover:bg-black/55 hover:opacity-100",
                  uploadingIcon
                    ? "bg-black/55 opacity-100"
                    : "bg-transparent opacity-0",
                )}
              >
                <Camera size={20} weight="bold" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleIconChange}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                {server?.name}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Klicke auf das Icon zum Ändern
              </p>
              {server?.iconUrl && (
                <button
                  type="button"
                  onClick={async () => {
                    setUploadingIcon(true);
                    setError("");
                    try {
                      await updateServer(server.id, { iconUrl: null });
                      setIconPreview(null);
                    } catch {
                      setError("Fehler beim Entfernen des Bildes");
                    } finally {
                      setUploadingIcon(false);
                    }
                  }}
                  disabled={uploadingIcon}
                  className="text-xs text-red-500 hover:text-red-600 bg-transparent border-none cursor-pointer p-0 mt-1 transition-colors"
                >
                  Bild entfernen
                </button>
              )}
            </div>
          </div>
        )}

        {/* Name */}
        {isOwner && (
          <form onSubmit={handleSave} className="flex flex-col gap-2.5">
            <SectionLabel>Servername</SectionLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Servername"
            />
            <Button
              type="submit"
              loading={saving}
              disabled={!name.trim() || name.trim() === server?.name}
            >
              Speichern
            </Button>
          </form>
        )}

        {error && (
          <p className="text-xs text-red-500 px-3 py-2 bg-red-500/10 rounded-lg">
            {error}
          </p>
        )}

        {/* Invite link */}
        <div>
          <SectionLabel>Einladungslink</SectionLabel>
          <div className="flex items-center gap-2.5 bg-(--surface-deep) rounded-lg border border-white/5 px-3.5 py-2.5">
            <Link className="text-zinc-500 shrink-0 text-sm" />
            <span className="flex-1 text-sm text-zinc-500 truncate font-mono">
              {inviteLink || "..."}
            </span>
            <button
              onClick={copyInvite}
              className={twMerge(
                "flex items-center gap-1.25 px-2.5 py-1 rounded-sm border border-white/10 text-xs font-semibold cursor-pointer shrink-0 transition-all duration-150",
                copied
                  ? "bg-white/10 text-green-500"
                  : "bg-zinc-800 text-zinc-400",
              )}
            >
              {copied ? (
                <>
                  <Check size={12} weight="bold" /> Kopiert
                </>
              ) : (
                <>
                  <CopySimple size={12} weight="bold" /> Kopieren
                </>
              )}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div>
          <div className="h-px bg-white/5 mb-3" />
          <SectionLabel danger>Gefahrenzone</SectionLabel>
          <div className="flex flex-col gap-2.5">
            <Button variant="danger" loading={leaving} onClick={handleLeave}>
              Server verlassen
            </Button>

            {isOwner && !confirmDelete && (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                Server löschen
              </Button>
            )}

            {isOwner && confirmDelete && (
              <div className="flex flex-col gap-2 p-3 rounded-lg border border-red-500 bg-red-500/10">
                <p className="text-xs text-red-500 font-semibold">
                  Wirklich löschen? Alle Kanäle, Nachrichten und Dateien werden
                  unwiderruflich gelöscht.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    loading={deleting}
                    onClick={handleDelete}
                    className="flex-1"
                  >
                    Ja, endgültig löschen
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
