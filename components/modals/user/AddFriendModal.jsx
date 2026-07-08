"use client";

import { useState } from "react";
import {
  UserPlus,
  Check,
  Warning,
} from "@phosphor-icons/react";
import { useAuth } from "@/context";
import { getUserByTag, sendFriendRequest } from "@/lib";
import { Modal, Button, Avatar, SearchInput } from "@/components";

export default function AddFriendModal({ open, onClose }) {
  const { firebaseUser, userDoc } = useAuth();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null); // null | 'not_found' | user object
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    setQuery("");
    setResult(null);
    setSent(false);
    setError("");
    onClose();
  }

  async function handleSearch(e) {
    e?.preventDefault();
    const q = query.trim();
    if (!q || !q.includes("#")) {
      setError("Format: Nutzername#1234");
      return;
    }
    setError("");
    setResult(null);
    setSent(false);
    setSearching(true);
    try {
      const found = await getUserByTag(q);
      setResult(found ?? "not_found");
    } catch {
      setError("Suche fehlgeschlagen");
    } finally {
      setSearching(false);
    }
  }

  async function handleSend() {
    if (!result || result === "not_found") return;
    setSending(true);
    setError("");
    try {
      await sendFriendRequest(firebaseUser.uid, result.id);
      setSent(true);
    } catch (err) {
      setError(err.message ?? "Fehler beim Senden");
    } finally {
      setSending(false);
    }
  }

  const alreadyFriend =
    result && result !== "not_found" && userDoc?.friends?.includes(result.id);
  const requestPending =
    result &&
    result !== "not_found" &&
    userDoc?.outgoingRequests?.includes(result.id);
  const isSelf =
    result && result !== "not_found" && result.id === firebaseUser?.uid;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Freund hinzufügen"
      maxWidth={440}
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm text-zinc-500">
          Suche nach dem Nutzernamen mit Tag - z.B.{" "}
          <span className="font-mono text-zinc-400">Max#1234</span>
        </p>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <SearchInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResult(null);
              setSent(false);
              setError("");
            }}
            placeholder="Nutzername#1234"
            inputClassName="font-mono"
            className="flex-1"
          />
          <Button
            type="submit"
            loading={searching}
            disabled={!query.trim()}
            className="min-w-max"
          >
            Suchen
          </Button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 rounded-lg">
            <Warning size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Not found */}
        {result === "not_found" && (
          <p className="text-sm text-zinc-500 text-center py-3">
            Kein Nutzer mit diesem Tag gefunden.
          </p>
        )}

        {/* Found user */}
        {result && result !== "not_found" && (
          <div className="flex items-center gap-3 p-3.5 bg-(--surface-deep) rounded-lg border border-white/5">
            <Avatar
              src={result.avatarUrl}
              name={result.displayName}
              size="md"
              status={result.status}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-100">
                {result.displayName}
              </p>
              <p className="text-xs text-zinc-500 font-mono">
                #{result.tag ?? "????"}
              </p>
            </div>

            {sent ? (
              <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium">
                <Check size={16} weight="bold" />
                Gesendet
              </div>
            ) : alreadyFriend ? (
              <span className="text-xs text-zinc-500">Bereits befreundet</span>
            ) : requestPending ? (
              <span className="text-xs text-zinc-500">Anfrage ausstehend</span>
            ) : isSelf ? (
              <span className="text-xs text-zinc-500">Das bist du</span>
            ) : (
              <Button
                onClick={handleSend}
                loading={sending}
                className="shrink-0"
              >
                <UserPlus weight="bold" className="text-xl md:text-lg" />
                Anfrage senden
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
