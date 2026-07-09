"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, animate } from "motion/react";
import {
  Camera,
  Link,
  CopySimple,
  Copy,
  Check,
  Gear,
  Users,
  TagSimple,
} from "@phosphor-icons/react";
import { useAuth, useServer } from "@/context";
import {
  updateServer,
  leaveServer,
  deleteServer,
  uploadToCloudinary,
} from "@/lib";
import { Modal, Input, Button, ServerIcon, SectionLabel } from "@/components";
import { useMediaQuery, useTabDragScroll, useCopyToClipboard } from "@/hooks";
import { twMerge } from "tailwind-merge";

const TABS = [
  { id: "general", label: "Allgemein", icon: Gear },
  { id: "members", label: "Mitglieder", icon: Users },
  { id: "roles", label: "Rollen", icon: TagSimple },
];

export default function ServerSettingsModal({ open, onClose, server }) {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const { userRoles } = useServer();
  const [tab, setTab] = useState("general");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { x, contentRef, maskRef, dragCons } = useTabDragScroll(open);
  const [name, setName] = useState(server?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconPreview, setIconPreview] = useState(null);
  const [error, setError] = useState("");
  const [copiedCode, copyCode] = useCopyToClipboard();
  const [copiedLink, copyLink] = useCopyToClipboard();
  const fileInputRef = useRef(null);

  // server is passed in before it's loaded (mount happens ahead of the
  // servers list resolving), so re-sync the name field whenever the modal
  // is opened rather than relying on the initial useState value.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setName(server?.name ?? "");
  }, [open, server?.name]);

  const isOwner = server?.ownerId === firebaseUser?.uid;
  const canManage = isOwner || userRoles?.includes("admin");
  const inviteLink = server?.inviteCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${server.inviteCode}`
    : "";

  /* Programmgesteuerter Sprung zum aktiven Tab */
  useEffect(() => {
    if (!contentRef.current || !maskRef.current) return;
    const btn = contentRef.current.querySelector("[data-active-tab=true]");
    if (btn) {
      const cw = maskRef.current.offsetWidth;
      const offset = btn.offsetLeft;
      const bw = btn.offsetWidth;
      const target = Math.max(
        dragCons.left,
        Math.min(dragCons.right, -(offset - cw / 2 + bw / 2)),
      );
      const controls = animate(x, target, {
        type: "spring",
        stiffness: 350,
        damping: 20,
      });
      return () => controls.stop();
    }
  }, [tab, dragCons, x, contentRef, maskRef]);

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

  async function handleCopy(string, type) {
    if (!string) return;
    if (type === "code") {
      await copyCode(string);
    } else {
      await copyLink(string);
    }
  }

  const currentIcon = iconPreview ?? server?.iconUrl;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Servereinstellungen"
      mobileFullScreen
      maxWidth={840}
      bodyClassName="p-3 md:p-5"
    >
      <div className="flex h-full flex-col md:flex-row md:h-160 md:overflow-y-scroll">
        {/* Tab Navigation — mobile drag, desktop column */}
        <div
          ref={maskRef}
          className="relative overflow-hidden md:overflow-visible md:flex-col border-b md:border-none border-white/5 px-4 md:pt-4 md:px-0"
        >
          <motion.div
            ref={contentRef}
            drag={isMobile ? "x" : false}
            style={{ x }}
            dragConstraints={dragCons}
            dragElastic={0.2}
            className="flex items-center gap-1 md:flex-col md:min-w-max"
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  data-active-tab={active ? "true" : "false"}
                  onClick={() => setTab(t.id)}
                  className={twMerge(
                    "relative whitespace-nowrap border-none bg-transparent px-4 py-3 text-base font-medium cursor-pointer transition-colors duration-150 md:w-full md:text-left md:rounded-md",
                    active ? "md:bg-surface-border" : "md:hover:bg-white/5",
                  )}
                >
                  {t.label}
                  {active && (
                    <motion.div
                      layoutId="server-settings-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full md:hidden"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto py-6 sm:px-8 pb-20 md:pb-0">
          {tab === "general" && (
            <div className="flex flex-col gap-5">
              {/* Server icon */}
              {canManage && (
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="size-16 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center">
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
                    <button
                      className="text-zinc-500 text-sm flex items-center gap-1 mt-2"
                      onClick={() =>
                        handleCopy(server?.inviteCode, "code")
                      }
                    >
                      <motion.div
                        animate={{ scale: copiedCode ? [1, 1.3, 1] : 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {copiedCode ? (
                          <Check className="text-sm text-green-500" />
                        ) : (
                          <Copy className="text-sm" />
                        )}
                      </motion.div>
                      {server?.inviteCode}
                    </button>
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
              {canManage && (
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
                  <motion.button
                    onClick={() => handleCopy(inviteLink, "link")}
                    className={twMerge(
                      "flex items-center justify-center size-8 rounded-sm border-none text-xs font-semibold cursor-pointer shrink-0 transition-colors duration-150",
                      copiedLink
                        ? "bg-white/10 text-green-500"
                        : "bg-surface-card text-zinc-400",
                    )}
                    animate={
                      copiedLink
                        ? { scale: [1, 1.2, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {copiedLink ? (
                      <Check weight="regular" className="text-lg" />
                    ) : (
                      <CopySimple weight="regular" className="text-lg" />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="h-px bg-white/5 my-5" />
              <SectionLabel danger>Gefahrenzone</SectionLabel>
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
          )}

          {tab === "members" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Users size={48} className="text-zinc-600 mb-4" />
              <p className="text-lg font-semibold text-zinc-400">Mitglieder</p>
              <p className="text-sm text-zinc-500 mt-1">
                Mitgliederverwaltung folgt bald
              </p>
            </div>
          )}

          {tab === "roles" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <TagSimple size={48} className="text-zinc-600 mb-4" />
              <p className="text-lg font-semibold text-zinc-400">Rollen</p>
              <p className="text-sm text-zinc-500 mt-1">
                Rollenverwaltung folgt bald
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
