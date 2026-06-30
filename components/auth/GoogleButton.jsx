"use client";

import { useState } from "react";
import { motion } from "motion/react";

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.84.86-3.06.86-2.36 0-4.36-1.6-5.07-3.74H.9v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.93 10.68A5.41 5.41 0 0 1 3.64 9c0-.58.1-1.15.29-1.68V4.98H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.02l3.03-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58A8.59 8.59 0 0 0 9 0a9 9 0 0 0-8.1 4.98l3.03 2.34C4.64 5.18 6.64 3.58 9 3.58Z"
      />
    </svg>
  );
}

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
        setError("Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.");
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
