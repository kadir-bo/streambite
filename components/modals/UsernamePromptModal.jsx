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
          className="fixed inset-0 z-[200] bg-black/75 flex items-center justify-center p-5"
        >
          <motion.div
            key="card"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modal}
            className="bg-zinc-800 rounded-xl border border-white/5 w-full max-w-100 p-6"
          >
            <div className="flex flex-col items-center gap-2.5 mb-5 text-center">
              <UserCircle size={36} className="text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-100">
                Wähle einen Benutzernamen
              </h2>
              <p className="text-sm text-zinc-500">
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
                <p className="text-xs text-red-500 px-3 py-2 bg-red-500/10 rounded-[8px]">
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
