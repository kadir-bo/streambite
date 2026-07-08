"use client";

import { useMemo, useState } from "react";
import { Hash } from "@phosphor-icons/react";
import { useAuth, useServer } from "@/context";
import { Avatar, Button } from "@/components";
import { removeFriend, blockUser } from "@/lib";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export default function ChannelWelcome({ channel, dmUser }) {
  const { userDoc, firebaseUser } = useAuth();
  const { servers } = useServer();
  const [loadingAction, setLoadingAction] = useState(null);
  const maxSharedServerLength = 5;
  // Gemeinsame Server = Schnittmenge von userDoc.servers und dmUser.servers
  const sharedServers = useMemo(() => {
    if (!dmUser || !userDoc) return [];
    const myServers = userDoc.servers ?? [];
    const theirServers = dmUser.servers ?? [];
    const sharedIds = myServers.filter((id) => theirServers.includes(id));
    return (servers ?? []).filter((s) => sharedIds.includes(s.id));
  }, [dmUser, userDoc, servers]);

  const handleRemoveFriend = async () => {
    if (!firebaseUser || !dmUser) return;
    setLoadingAction("remove");
    try {
      await removeFriend(firebaseUser.uid, dmUser.id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBlock = async () => {
    if (!firebaseUser || !dmUser) return;
    setLoadingAction("block");
    try {
      await blockUser(firebaseUser.uid, dmUser.id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  if (dmUser) {
    return (
      <div className="px-6 pt-8 pb-6 mt-auto border-b border-white/5 flex flex-col">
        <div className="flex items-center gap-4">
          <Avatar src={dmUser.avatarUrl} name={dmUser.displayName} size="xl" />
          <div>
            <span className="text-xl font-bold text-zinc-100">
              {dmUser.displayName ?? "…"}
            </span>
            <p className="text-sm text-zinc-400 max-w-120">
              Das ist der Anfang deiner Unterhaltung mit{" "}
              <strong className="text-zinc-100 font-medium">
                {dmUser.displayName}
              </strong>
              .
            </p>
          </div>
        </div>

        {sharedServers.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-6 w-max">
            {/* Zähler */}
            <div className="flex items-center gap-1.5 mr-2 text-sm">
              <span className="font-semibold text-zinc-100">
                {sharedServers.length}
              </span>
              <span className="text-zinc-400">
                {sharedServers.length !== 1 ? "gemeinsame" : "gemeinsamer"}{" "}
                Server
              </span>
            </div>

            {/* Avatare (max 5, Rest als +N) */}
            <div className="flex -space-x-1.5 items-center gap-3">
              {sharedServers.slice(0, maxSharedServerLength).map((s) => (
                <Avatar key={s.id} src={s.iconUrl} name={s.name} size="xs" />
              ))}
              {sharedServers.length > maxSharedServerLength && (
                <span className="text-sm text-zinc-500">
                  +{sharedServers.length - maxSharedServerLength}
                </span>
              )}
            </div>

            {/* Aktionen */}
            <div className="flex items-center gap-2 ml-auto max-sm:ml-0 max-sm:mt-2">
              <Button
                variant="ghost"
                size="sm"
                loading={loadingAction === "remove"}
                onClick={handleRemoveFriend}
              >
                Freund entfernen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                loading={loadingAction === "block"}
                onClick={handleBlock}
              >
                Blockieren
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-6 mt-auto border-b border-white/5">
      <div className="size-18 rounded-full bg-surface-card border border-white/5 flex items-center justify-center mb-4">
        <Hash size={36} weight="bold" className="text-zinc-500" />
      </div>
      <p className="text-2xl font-bold text-zinc-100 mb-2">
        Willkommen in #{channel?.name ?? "…"}
      </p>
      <p className="text-base text-zinc-400 max-w-120">
        Das ist der Anfang des{" "}
        <strong className="text-zinc-100">#{channel?.name}</strong> Kanals.
        {channel?.topic && (
          <span className="ml-1 text-zinc-500">- {channel.topic}</span>
        )}
      </p>
    </div>
  );
}
