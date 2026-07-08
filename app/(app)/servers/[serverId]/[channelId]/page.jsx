"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth, useServer } from "@/context";
import { markRead } from "@/lib";
import { ChannelHeader, MessageList, MessageInput, VoiceChannelView } from "@/components";

export default function ChannelPage() {
  const { serverId, channelId } = useParams();
  const { firebaseUser } = useAuth();
  const { channels, servers, showMembers, toggleMembers, userRoles } = useServer();
  const [replyTarget, setReplyTarget] = useState(null);

  const channel = channels.find((ch) => ch.id === channelId);
  const isVoice = channel?.type === "voice";
  const server = servers.find((s) => s.id === serverId);
  const isOwner = server?.ownerId === firebaseUser?.uid;
  const canManage = isOwner || userRoles?.includes("admin");

  useEffect(() => {
    if (firebaseUser && channelId && !isVoice)
      markRead(firebaseUser.uid, channelId).catch(console.error);
  }, [firebaseUser, channelId, isVoice]);

  // On mobile: the sidebar stays open when tapping a channel, so the user
  // can browse freely. Tapping the channel again (or the ▶ arrow on the
  // active channel in the sidebar) calls showContent() explicitly.
  // (Desktop is unaffected - both panes are always visible at md+.)

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface-app">
      <ChannelHeader
        channel={channel}
        showMembers={showMembers}
        onToggleMembers={toggleMembers}
      />

      {isVoice ? (
        channel && (
          <VoiceChannelView
            serverId={serverId}
            channel={channel}
            isOwner={canManage}
          />
        )
      ) : (
        <>
          <MessageList
            serverId={serverId}
            channelId={channelId}
            channel={channel}
            onReply={setReplyTarget}
          />

          <MessageInput
            serverId={serverId}
            channelId={channelId}
            channel={channel}
            replyTarget={replyTarget}
            onCancelReply={() => setReplyTarget(null)}
          />
        </>
      )}
    </div>
  );
}
