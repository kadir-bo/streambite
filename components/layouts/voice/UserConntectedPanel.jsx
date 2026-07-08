"use client";

import { twMerge } from "tailwind-merge";
import { useVoice } from "@/context";
import { VoiceControls } from "@/components";

export default function UserConntectedPanel() {
  const { connection, isSpeaking } = useVoice();

  return (
    <div className="px-3">
      <div className="px-2 pt-2 pb-1 rounded-2xl bg-surface-card flex justify-between">
        <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium px-1 py-1.5">
          <span
            className={twMerge(
              "inline-flex max-w-20 text-xs transition-colors duration-150",
              isSpeaking ? "text-green-400" : "text-zinc-300",
            )}
          >
            {`verbunden mit ${connection.channelName ?? "Sprachkanal"}`}
          </span>
        </div>
        <VoiceControls
          buttonClassName="size-8 p-1.5"
          items={["mute", "deafen", "disconnect"]}
        />
      </div>
    </div>
  );
}
