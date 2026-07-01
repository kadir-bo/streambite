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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    () => subscribeToFriendUsers(friendUids, setFriends),
    [friendUids.join(",")],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    () => subscribeToFriendUsers(incomingUids, setIncomingRequests),
    [incomingUids.join(",")],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    () => subscribeToFriendUsers(outgoingUids, setOutgoingRequests),
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
