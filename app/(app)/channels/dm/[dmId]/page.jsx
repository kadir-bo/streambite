"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth, useLayout } from "@/context";
import { useDm } from "@/hooks";
import { markRead } from "@/lib";
import { DmHeader, MessageList, MessageInput } from "@/components";

export default function DmPage() {
  const { dmId } = useParams();
  const { firebaseUser } = useAuth();
  const { otherUser } = useDm(dmId);
  const { showContent } = useLayout();
  const [replyTarget, setReplyTarget] = useState(null);

  useEffect(() => {
    if (firebaseUser && dmId)
      markRead(firebaseUser.uid, dmId).catch(console.error);
  }, [firebaseUser, dmId]);

  // On mobile, opening a DM switches from the list pane to this content pane.
  useEffect(() => {
    showContent();
  }, [dmId, showContent]);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-900">
      <DmHeader user={otherUser} dmId={dmId} />

      <MessageList
        serverId={null}
        channelId={dmId}
        channel={{ name: otherUser?.displayName }}
        dmUser={otherUser}
        onReply={setReplyTarget}
      />

      <MessageInput
        serverId={null}
        channelId={dmId}
        channel={{ name: otherUser?.displayName }}
        dmUser={otherUser}
        replyTarget={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
      />
    </div>
  );
}
