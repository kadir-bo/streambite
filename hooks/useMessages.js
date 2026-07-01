"use client";

import { useState, useEffect } from "react";
import { subscribeToMessages } from "@/lib";

export function useMessages(serverId, channelId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // serverId is intentionally falsy for DM threads (see messagesCollectionPath) -
    // only channelId (the channel or dmId) is required to subscribe.
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToMessages(serverId, channelId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    return unsubscribe;
  }, [serverId, channelId]);

  return { messages, loading };
}
