"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CopySimple,
  Check,
  MagnifyingGlass,
  PaperPlaneTilt,
  UsersThree,
} from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { useFriends } from "@/hooks";
import {
  ensureDm,
  sendMessage,
  touchDmLastMessage,
  inviteToServer,
} from "@/lib";
import { ServerIcon, Avatar, Modal } from "@/components";

export default function InviteModal({ open, onClose, server }) {
  const { firebaseUser, userDoc } = useAuth();
  const { friends } = useFriends();
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [sentTo, setSentTo] = useState(new Set());
  const [sendingTo, setSendingTo] = useState(null);

  const inviteLink = server?.inviteCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${server.inviteCode}`
    : "";

  async function handleCopy() {
    if (!inviteLink || copied) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) =>
      (f.displayName ?? "").toLowerCase().includes(q),
    );
  }, [friends, search]);

  async function handleSendToFriend(friend) {
    if (!firebaseUser || !inviteLink || sendingTo) return;
    setSendingTo(friend.id);
    try {
      const dmId = await ensureDm(firebaseUser.uid, friend.id);
      const content = `Komm in meinen Server "${server?.name}" 🎉 ${inviteLink}`;
      await sendMessage(null, dmId, {
        content,
        authorId: firebaseUser.uid,
        authorName:
          userDoc?.displayName ?? firebaseUser.displayName ?? "Nutzer",
        authorAvatar: userDoc?.avatarUrl ?? null,
        type: "default",
        replyTo: null,
        attachments: [],
        reactions: {},
      });
      await touchDmLastMessage(dmId, { content, authorId: firebaseUser.uid });
      await inviteToServer(
        firebaseUser.uid,
        userDoc?.displayName ?? firebaseUser.displayName ?? "Nutzer",
        friend.id,
        server,
      );
      setSentTo((prev) => new Set(prev).add(friend.id));
    } catch (err) {
      console.error("[dm] sendToFriend failed:", err.code, err.message);
    } finally {
      setSendingTo(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Freunde einladen"
      maxWidth={440}
    >
      <div className="flex flex-col gap-5">
        {/* Server info + invite code */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <ServerIcon
              name={server?.name}
              iconUrl={server?.iconUrl}
              size={44}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-(--text-primary) truncate">
                {server?.name ?? "..."}
              </p>
              <p className="text-xs text-(--text-muted)">
                Einladungslink teilen
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            title={inviteLink}
            className={`flex items-center gap-1.5 px-3 py-1.75 rounded-(--radius-base) border text-sm font-semibold shrink-0 transition-[background,color,border-color] duration-150 ${
              copied
                ? "bg-(--state-active) text-(--status-online) border-(--status-online) cursor-default"
                : "bg-(--surface-deep) text-(--text-primary) border-(--border-subtle) hover:bg-(--surface-raised) cursor-pointer"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center gap-1.5"
                >
                  <Check size={14} weight="bold" />
                  Kopiert
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center gap-1.5"
                >
                  {server?.inviteCode ?? "-"}
                  <CopySimple size={14} weight="bold" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="h-px bg-(--border-subtle)" />

        {/* Friends search */}
        <div>
          <p className="text-2xs font-semibold tracking-widest uppercase text-(--text-secondary) mb-2.5">
            An Freund senden
          </p>

          <div className="flex items-center gap-2 bg-(--surface-deep) border border-(--border-subtle) rounded-(--radius-base) px-3 mb-2.5">
            <MagnifyingGlass
              size={14}
              className="text-(--text-muted) shrink-0"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Freund suchen..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-(--text-primary) py-2.5"
            />
          </div>

          <div className="max-h-55 overflow-y-auto flex flex-col gap-0.5">
            {friends.length === 0 ? (
              <div className="px-1 py-4 text-center">
                <UsersThree size={24} className="text-(--text-ghost) mb-1.5" />
                <p className="text-xs text-(--text-ghost)">
                  Du hast noch keine Freunde
                </p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <p className="text-xs text-(--text-ghost) text-center py-3">
                Niemand gefunden
              </p>
            ) : (
              filteredFriends.map((friend) => {
                const sent = sentTo.has(friend.id);
                return (
                  <div
                    key={friend.id}
                    className="flex items-center gap-2.5 px-1 py-1.5 rounded-(--radius-base)"
                  >
                    <Avatar
                      src={friend.avatarUrl}
                      name={friend.displayName}
                      size="sm"
                      status={friend.status}
                    />
                    <span className="flex-1 text-sm font-medium text-(--text-primary) truncate">
                      {friend.displayName}
                    </span>
                    <button
                      onClick={() => handleSendToFriend(friend)}
                      disabled={sent || sendingTo === friend.id}
                      className={`flex items-center gap-1 px-2.5 py-1.25 rounded-sm border text-xs font-semibold shrink-0 ${
                        sent
                          ? "bg-(--state-active) text-(--status-online) border-(--border-default) cursor-default"
                          : "bg-(--surface-raised) text-(--text-secondary) border-(--border-default) cursor-pointer"
                      } ${sendingTo === friend.id ? "opacity-60" : "opacity-100"}`}
                    >
                      {sent ? (
                        <>
                          <Check size={12} weight="bold" /> Gesendet
                        </>
                      ) : (
                        <>
                          <PaperPlaneTilt size={12} weight="bold" /> Senden
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <p className="text-xs text-(--text-ghost) text-center">
          Jeder mit diesem Link kann dem Server beitreten.
        </p>
      </div>
    </Modal>
  );
}
