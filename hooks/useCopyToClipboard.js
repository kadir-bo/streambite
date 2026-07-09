"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib";

/**
 * Kapselt den "Kopieren → copied-Status → Auto-Reset"-Flow.
 *
 * @param {number} resetDelay Verzögerung in ms (default 2500)
 * @returns {[boolean, (value: string) => Promise<void>]}
 *
 * @example
 *   const [copied, copy] = useCopyToClipboard();
 *   <button onClick={() => copy(inviteLink)}>
 *     {copied ? "Kopiert!" : "Kopieren"}
 *   </button>
 */
export function useCopyToClipboard(resetDelay = 2500) {
  const [copied, setCopied] = useState(false);

  async function copy(value) {
    if (!value || copied) return;
    await copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), resetDelay);
  }

  return [copied, copy];
}
