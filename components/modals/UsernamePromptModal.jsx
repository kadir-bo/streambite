"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { UserCircle } from "@phosphor-icons/react";
import { modal, backdrop } from "@/lib";
import { isValidUsername, setUsername as saveUsername } from "@/lib";
import { Input, Button } from "@/components";

export default function UsernamePromptModal({ open, uid, tag, onDone }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValidUsername(username)) {
      setError(
        "Benutzername: 3-20 Zeichen, nur Buchstaben, Zahlen und Unterstriche.",
      );
      return;
    }
    setError("");
    setSaving(true);
    try {
      await saveUsername(uid, username, tag);
      onDone?.();
    } catch {
      setError("Fehler beim Speichern. Bitte versuche es erneut.");
    } finally {
      setSaving(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdrop}
          className="fixed inset-0 z-(--z-modal) bg-black/75 flex items-center justify-center p-5"
        >
          <motion.div
            key="card"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modal}
            className="bg-(--surface-raised) rounded-xl border border-(--border-subtle) w-full max-w-100 p-6"
          >
            <div className="flex flex-col items-center gap-2.5 mb-5 text-center">
              <UserCircle size={36} className="text-(--text-muted)" />
              <h2 className="text-lg font-(--weight-semibold) text-(--text-primary)">
                Wähle einen Benutzernamen
              </h2>
              <p className="text-sm text-(--text-muted)">
                Damit dich andere finden und als Freund hinzufügen können.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                placeholder="z.B. max_mustermann"
                autoFocus
                minLength={3}
                maxLength={20}
              />

              {error && (
                <p className="text-xs text-(--danger) px-3 py-2 bg-(--danger-subtle) rounded-(--radius-base)">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                loading={saving}
                disabled={!username.trim()}
                className="w-full"
              >
                Bestätigen
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
