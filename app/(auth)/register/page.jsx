"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react";
import { AuthCard, Input, Button, GoogleButton } from "@/components";
import {
  registerUser,
  createUserDocument,
  getInitials,
  isValidUsername,
  signInWithGoogle,
} from "@/lib";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValidUsername(username)) {
      setError(
        "Benutzername: 3-20 Zeichen, nur Buchstaben, Zahlen und Unterstriche.",
      );
      return;
    }

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    setLoading(true);
    try {
      const user = await registerUser(email, password, displayName);
      await createUserDocument(user.uid, {
        displayName,
        username,
        email,
        avatarUrl: null,
        initials: getInitials(displayName),
      });
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
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-(--accent) transition-colors inline-flex items-center gap-1 self-start"
        >
          <CaretLeft className="size-3.5" weight="bold" /> Zurück zur Startseite
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight text-balance">
            Konto erstellen
          </h1>
          <p className="text-sm text-zinc-500 text-balance">
            Streambite beitreten
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Anzeigename"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Dein Name"
            required
            autoComplete="name"
            minLength={2}
            maxLength={32}
          />
          <Input
            label="Benutzername"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
            placeholder="z.B. max_mustermann"
            required
            autoComplete="username"
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            title="Nur Buchstaben, Zahlen und Unterstriche"
          />
          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mindestens 8 Zeichen"
            required
            minLength={8}
            autoComplete="new-password"
          />

          {error && (
            <p className="text-xs text-red-500 px-3 py-2 bg-red-500/10 rounded-lg">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full mt-1">
            Registrieren
          </Button>
        </form>

        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-2xs text-zinc-600 uppercase tracking-widest">
            oder
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <GoogleButton
          onClick={handleGoogleSignIn}
          label="Mit Google registrieren"
        />

        <p className="text-xs text-zinc-500 text-center">
          Bereits registriert?{" "}
          <Link
            href="/login"
            className="text-zinc-400 hover:text-(--accent) transition-colors"
          >
            Anmelden
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}

function getAuthError(code) {
  const map = {
    "auth/email-already-in-use": "Diese E-Mail wird bereits verwendet.",
    "auth/invalid-email": "Ungültige E-Mail-Adresse.",
    "auth/weak-password": "Passwort zu schwach.",
  };
  return map[code] ?? "Ein Fehler ist aufgetreten. Bitte versuche es erneut.";
}
