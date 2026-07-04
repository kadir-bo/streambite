"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context";
import { subscribeToFriendUsers } from "@/lib";

export function useFriends() {
  const { userDoc } = useAuth();
  const [friends, setFriends] = useState([]);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  const friendUids = userDoc?.friends ?? [];
  const incomingUids = userDoc?.incomingRequests ?? [];
  const outgoingUids = userDoc?.outgoingRequests ?? [];

  useEffect(
    () => subscribeToFriendUsers(friendUids, setFriends),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [friendUids.join(",")],
  );
  useEffect(
    () => subscribeToFriendUsers(incomingUids, setIncomingRequests),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [incomingUids.join(",")],
  );
  useEffect(
    () => subscribeToFriendUsers(outgoingUids, setOutgoingRequests),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outgoingUids.join(",")],
  );

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    inboxOpen,
    setInboxOpen,
  };
}
