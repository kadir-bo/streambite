"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createChannel } from "@/lib";
import { Modal, Input, Button } from "@/components";
import { Hash, SpeakerHigh, CheckCircle } from "@phosphor-icons/react";

const TYPES = [
  {
    value: "text",
    label: "Textkanal",
    description: "Nachrichten, Bilder, GIFs und Links teilen",
    icon: <Hash size={20} />,
  },
  {
    value: "voice",
    label: "Sprachkanal",
    description: "Mit Sprache und Video gemeinsam abhängen",
    icon: <SpeakerHigh size={20} />,
  },
];

export default function CreateChannelModal({ open, onClose, category }) {
  const { serverId } = useParams();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Wenn die Kategorie einen festen Typ hat (text/voice), wird der Type-Picker
  // ausgeblendet und nur dieser Kanaltyp ist erlaubt.
  const categoryType = category?.type === "voice" ? "voice" : "text";
  const isTypeLocked = category?.type === "text" || category?.type === "voice";

  // Lock the type if category has one (the effect below handles changes).
  const [type, setType] = useState(categoryType);

  // Reset channel type when modal opens (user may have selected a different
  // category with a different type between opens).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setType(categoryType);
  }, [open, categoryType]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) {
      setError("Bitte gib einen Kanalnamen ein");
      return;
    }
    if (!category?.id) {
      setError("Keine Kategorie ausgewählt");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createChannel(serverId, trimmed, type, category.id);
      setName("");
      setType("text");
      onClose();
    } catch {
      setError("Fehler beim Erstellen des Kanals");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Kanal erstellen${category ? ` in ${category.name}` : ""}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Type selection – ausgeblendet wenn die Kategorie einen festen Typ hat */}
        {!isTypeLocked ? (
          <div className="flex flex-col gap-2">
            <p className="text-2xs font-semibold tracking-widest uppercase text-zinc-400">
              Kanaltyp
            </p>
            {TYPES.map((t) => {
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-3 p-3 rounded-[8px] border cursor-pointer text-left transition-colors duration-150 ${
                    active
                      ? "bg-white/10 border-white/20"
                      : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  <span
                    className={`flex shrink-0 size-9 items-center justify-center rounded-[8px] ${
                      active
                        ? "bg-zinc-700 text-zinc-100"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {t.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold ${active ? "text-zinc-100" : "text-zinc-400"}`}
                    >
                      {t.label}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {t.description}
                    </p>
                  </div>
                  <CheckCircle
                    size={20}
                    weight="fill"
                    className={`shrink-0 transition-opacity duration-150 ${active ? "text-zinc-100 opacity-100" : "opacity-0"}`}
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-[8px] border border-white/5 bg-zinc-800">
            {type === "text" ? <Hash size={20} /> : <SpeakerHigh size={20} />}
            <span className="text-sm text-zinc-400">
              {type === "text" ? "Textkanal" : "Sprachkanal"}
            </span>
          </div>
        )}

        {/* Channel name */}
        <Input
          label="Kanalname"
          placeholder={type === "text" ? "neuer-kanal" : "Allgemein"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          autoFocus
          error={error}
        />

        <Button type="submit" loading={loading} disabled={!name.trim()}>
          Kanal erstellen
        </Button>
      </form>
    </Modal>
  );
}
