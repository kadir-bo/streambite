"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/context";
import { useServer } from "@/context";
import { getInviteInfo } from "@/lib";
import { Avatar, Button, ServerIcon } from "@/components";
import { pageTransition } from "@/lib";

export default function InvitePage() {
  const { code } = useParams();
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();
  const { joinServer } = useServer();
  const [info, setInfo] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setFetching(true);
      const data = await getInviteInfo(code);
      setInfo(data);
      setFetching(false);
    }
    if (code) load();
  }, [code]);

  async function handleJoin() {
    if (!firebaseUser) {
      router.push(`/login?redirect=/invite/${code}`);
      return;
    }
    setJoining(true);
    setError("");
    try {
      const serverId = await joinServer(code);
      router.push(`/servers/${serverId}`);
    } catch (err) {
      setError(err.message ?? "Fehler beim Beitreten");
      setJoining(false);
    }
  }

  if (authLoading || fetching) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-(--surface-deepest)">
        <div className="size-8 rounded-full border-2 border-(--border-default) border-t-(--text-muted) animate-spin" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-(--surface-deepest) p-5">
        <div className="text-center max-w-90">
          <p className="text-xl font-semibold text-(--text-primary) mb-2">
            Ungültige Einladung
          </p>
          <p className="text-sm text-(--text-muted) mb-6">
            Dieser Einladungslink ist abgelaufen oder ungültig.
          </p>
          <Button onClick={() => router.push("/channels")} variant="ghost">
            Zurück zur App
          </Button>
        </div>
      </div>
    );
  }

  const { server } = info;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageTransition}
      className="min-h-dvh flex items-center justify-center bg-(--surface-deepest) p-5"
    >
      <div className="bg-(--surface-raised) rounded-xl border border-(--border-subtle) p-8 w-full max-w-100 text-center flex flex-col items-center gap-5">
        {/* Server Icon */}
        <div className="size-20 rounded-xl bg-(--surface-overlay) border border-(--border-subtle) flex items-center justify-center overflow-hidden">
          <ServerIcon name={server.name} iconUrl={server.iconUrl} size={80} />
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-(--text-muted) mb-1.5">
            Du wurdest eingeladen
          </p>
          <h1 className="text-2xl font-bold text-(--text-primary) mb-1">
            {server.name}
          </h1>
          <p className="text-sm text-(--text-muted)">
            {server.memberCount ?? 0} Mitglied
            {server.memberCount !== 1 ? "er" : ""}
          </p>
        </div>

        {/* CTA */}
        <div className="w-full">
          <Button onClick={handleJoin} loading={joining} className="w-full">
            {firebaseUser ? "Server beitreten" : "Anmelden & beitreten"}
          </Button>

          {error && (
            <p className="mt-2 text-xs text-(--danger) text-center">{error}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
