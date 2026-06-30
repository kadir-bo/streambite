"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Link, CopySimple, Check } from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { updateServer, leaveServer, deleteServer, uploadToCloudinary } from "@/lib";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ServerIcon from "@/components/server/ServerIcon";
import SectionLabel from "@/components/ui/SectionLabel";

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
              <div className="size-16 rounded-lg overflow-hidden border border-(--border-subtle)">
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
                className={`absolute inset-0 rounded-lg flex items-center justify-center border-none cursor-pointer text-white transition-opacity duration-150 ${
                  uploadingIcon
                    ? "bg-black/55 opacity-100"
                    : "bg-transparent opacity-0"
                } hover:bg-black/55 hover:opacity-100`}
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
              <p className="text-sm font-(--weight-semibold) text-(--text-primary)">
                {server?.name}
              </p>
              <p className="text-xs text-(--text-muted) mt-0.5">
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
                  className="text-xs text-(--danger) hover:text-(--danger-hover) bg-transparent border-none cursor-pointer p-0 mt-1 transition-colors"
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
          <p className="text-xs text-(--danger) px-3 py-2 bg-(--danger-subtle) rounded-(--radius-base)">
            {error}
          </p>
        )}

        {/* Invite link */}
        <div>
          <SectionLabel>Einladungslink</SectionLabel>
          <div className="flex items-center gap-2.5 bg-(--surface-deep) rounded-(--radius-base) border border-(--border-subtle) px-3.5 py-2.5">
            <Link size={14} className="text-(--text-muted) shrink-0" />
            <span className="flex-1 text-sm text-(--text-muted) truncate font-(--font-mono)">
              {inviteLink || "..."}
            </span>
            <button
              onClick={copyInvite}
              className={`flex items-center gap-1.25 px-2.5 py-1 rounded-sm border border-(--border-default) text-xs font-(--weight-semibold) cursor-pointer shrink-0 transition-all duration-150 ${
                copied
                  ? "bg-(--state-active) text-(--status-online)"
                  : "bg-(--surface-raised) text-(--text-secondary)"
              }`}
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
          <div className="h-px bg-(--border-subtle) mb-3" />
          <SectionLabel danger>Gefahrenzone</SectionLabel>
          <div className="flex flex-col gap-2.5">
            <Button variant="danger" loading={leaving} onClick={handleLeave}>
              Server verlassen
            </Button>

            {isOwner && !confirmDelete && (
              <Button
                variant="danger"
                onClick={() => setConfirmDelete(true)}
              >
                Server löschen
              </Button>
            )}

            {isOwner && confirmDelete && (
              <div className="flex flex-col gap-2 p-3 rounded-(--radius-base) border border-(--danger) bg-(--danger-subtle)">
                <p className="text-xs text-(--danger) font-semibold">
                  Wirklich löschen? Alle Kanäle, Nachrichten und Dateien
                  werden unwiderruflich gelöscht.
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
