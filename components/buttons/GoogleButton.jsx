"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { GoogleLogo } from "@/components";

export default function GoogleButton({
  onClick,
  label = "Mit Google fortfahren",
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setLoading(true);
    try {
      await onClick();
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(`Google-Anmeldung fehlgeschlagen (${err?.code || err?.message || 'unbekannter Fehler'})`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <motion.button
        type="button"
        whileTap={{ scale: loading ? 1 : 0.97 }}
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-(--radius-base) border border-(--border-default) bg-(--surface-raised) text-(--text-primary) text-sm font-medium hover:bg-(--state-hover)"
        style={{
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? (
          <span className="inline-block size-3.5 rounded-full animate-spin border-2 border-current border-t-transparent" />
        ) : (
          <>
            <GoogleLogo />
            {label}
          </>
        )}
      </motion.button>
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
}
