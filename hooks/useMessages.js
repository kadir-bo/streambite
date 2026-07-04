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
      /* eslint-disable react-hooks/set-state-in-effect */
      setMessages([]);
      setLoading(false);
      /* eslint-enable react-hooks/set-state-in-effect */
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
