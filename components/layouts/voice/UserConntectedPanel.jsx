"use client";

import { twMerge } from "tailwind-merge";
import { useVoice } from "@/context";
import { VoiceControls } from "@/components";

export default function UserConntectedPanel() {
  const { connection } = useVoice();

  return (
    <div className="px-4 md:px-3 shadow-md">
      <div className="px-2 pt-2 pb-1 rounded-2xl bg-surface-card flex justify-between">
        <div className="flex flex-col items-start justify-center ml-2 px-2 py-1.5">
          <span className="text-zinc-500 text-xs">verbunden mit </span>
          <span className="text-zinc-300 text-sm">
            {connection.channelName ?? "Sprachkanal"}
          </span>
        </div>
        <VoiceControls
          buttonClassName="size-10 md:size-8 md:p-1.5"
          items={["mute", "deafen", "disconnect"]}
        />
      </div>
    </div>
  );
}
