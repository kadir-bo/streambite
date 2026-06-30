"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard, Input, Button, GoogleButton } from "@/components";
import { loginUser, signInWithGoogle } from "@/lib";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(email, password);
      router.push("/channels");
    } catch (err) {
      setError(getAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    await signInWithGoogle();
    router.push("/channels");
  }

  return (
    <AuthCard>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-(--text-primary) tracking-tight">
            Willkommen zurück
          </h1>
          <p className="text-sm text-(--text-muted)">
            Melde dich bei Streambite an
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            autoComplete="email"
          />
          <div className="flex flex-col gap-1.5">
            <Input
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              error={error || undefined}
            />
            <Link
              href="/forgot-password"
              className="text-xs text-(--text-muted) self-end hover:text-zinc-300 transition-colors"
            >
              Passwort vergessen?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-1">
            Anmelden
          </Button>
        </form>

        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-px bg-(--border-subtle)" />
          <span className="text-2xs text-(--text-ghost) uppercase tracking-widest">
            oder
          </span>
          <div className="flex-1 h-px bg-(--border-subtle)" />
        </div>

        <GoogleButton
          onClick={handleGoogleSignIn}
          label="Mit Google anmelden"
        />

        <p className="text-xs text-(--text-muted) text-center">
          Noch kein Konto?{" "}
          <Link
            href="/register"
            className="text-(--text-secondary) hover:text-zinc-100 transition-colors"
          >
            Registrieren
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}

function getAuthError(code) {
  const map = {
    "auth/invalid-credential": "E-Mail oder Passwort falsch.",
    "auth/user-not-found": "Kein Konto mit dieser E-Mail gefunden.",
    "auth/wrong-password": "Falsches Passwort.",
    "auth/too-many-requests": "Zu viele Versuche. Bitte warte kurz.",
    "auth/user-disabled": "Dieses Konto wurde deaktiviert.",
  };
  return map[code] ?? "Ein Fehler ist aufgetreten. Bitte versuche es erneut.";
}
