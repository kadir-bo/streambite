"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Hash,
  SpeakerHigh,
  PencilSimple,
  Trash,
  CheckCircle,
} from "@phosphor-icons/react";
import { useAuth, useServer, useVoice, useLayout } from "@/context";
import { useUnread, useIsDesktop, useLongPress } from "@/hooks";
import { markRead, deleteChannel } from "@/lib";
import {
  ContextMenu,
  DotMenu,
  ConfirmModal,
  RenameChannelModal,
  VoiceMemberRow,
} from "@/components";
import { twMerge } from "tailwind-merge";

const TYPE_ICON = {
  text: Hash,
  voice: SpeakerHigh,
};

export default function ChannelItem({ channel, serverId, isActive, isOwner }) {
  const { firebaseUser } = useAuth();
  const { voicePresence, channels } = useServer();
  const { participants: liveParticipants, connection, connect } = useVoice();
  const { showContent } = useLayout();
  const isDesktop = useIsDesktop();
  const isLastOfType =
    channels.filter((ch) => ch.type === channel.type).length <= 1;

  const longPress = useLongPress(openMenu, 500);

  // Single click:
  // - Mobile: sidebar schließen → Content anzeigen for Text + Voice
  // - Desktop: Voice sofort joinen (kein extra Tap)
  // - Mobile Voice: nur navigieren, JOIN-Button im Channel-Screen
  function handleClick(e) {
    if (longPress.wasActive.current) {
      longPress.clear();
      e.preventDefault();
      return;
    }
    if (!isDesktop) showContent(); // Mobile: Sidebar schließen
    if (isDesktop && channel.type === "voice") {
      connect(serverId, channel.id, channel.name); // Desktop: Auto-Join
    }
  }
  const Icon = TYPE_ICON[channel.type] ?? Hash;
  const { isUnread } = useUnread();
  const unread = !isActive && isUnread(channel.id, channel.lastMessageAt);

  // Firestore presence covers everyone else; for our own connected channel,
  // the live LiveKit participant list is more instant (no round-trip), so
  // prefer that one when it's this exact channel.
  const isMyVoiceChannel =
    channel.type === "voice" &&
    connection.serverId === serverId &&
    connection.channelId === channel.id &&
    connection.status === "connected";
  const voiceMembers = isMyVoiceChannel
    ? liveParticipants.map((p) => ({ uid: p.identity, name: p.name }))
    : (voicePresence[channel.id] ?? []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [menuWidth, setMenuWidth] = useState(0);
  const [showRename, setShowRename] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Anchor to the whole channel column (not just the small "..." button) so
  // the dropdown spans its full measured width, like the other sidebar menus.
  function openMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    const pane = e.currentTarget.closest("[data-channel-pane]");
    const rect = (pane ?? e.currentTarget).getBoundingClientRect();
    const btnRect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ x: rect.left, y: btnRect.bottom + 4 });
    setMenuWidth(rect.width);
    setMenuOpen(true);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteChannel(serverId, channel.id);
      setConfirmDelete(false);
    } catch (err) {
      setDeleteError(err.message || "Fehler beim Löschen des Kanals.");
    } finally {
      setDeleting(false);
    }
  }

  const menuItems = [
    ...(channel.type === "text"
      ? [
          {
            icon: <CheckCircle />,
            label: "Als gelesen markieren",
            onClick: () =>
              firebaseUser && markRead(firebaseUser.uid, channel.id),
          },
        ]
      : []),
    ...(isOwner
      ? [
          { divider: true },
          {
            icon: <PencilSimple />,
            label: "Kanal umbenennen",
            onClick: () => setShowRename(true),
          },
          {
            icon: <Trash />,
            label: "Kanal löschen",
            danger: true,
            disabled: isLastOfType,
            title: isLastOfType
              ? `Der letzte ${channel.type === "voice" ? "Sprachkanal" : "Textkanal"} kann nicht gelöscht werden`
              : undefined,
            onClick: () => setConfirmDelete(true),
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        {...longPress.handlers}
        className={twMerge(
          "group flex select-none items-center gap-2 mx-2 my-px rounded-xl transition-colors duration-100",
          isActive
            ? "bg-surface-hover"
            : "bg-transparent hover:bg-surface-hover/50",
        )}
      >
        <Link
          href={`/servers/${serverId}/${channel.id}`}
          onClick={handleClick}
          className="flex select-none items-center gap-2 flex-1 min-w-0 no-underline h-full py-2.5 pl-4"
        >
          <Icon
            weight={isActive ? "fill" : "regular"}
            className={twMerge(
              "shrink-0 text-lg transition-colors duration-100",
              isActive || unread
                ? "text-white"
                : "text-zinc-500 group-hover:text-zinc-400",
            )}
          />
          <span
            className={twMerge(
              "text-base truncate flex-1 transition-colors duration-100",
              isActive || unread
                ? "text-white font-medium"
                : "text-zinc-400 font-medium group-hover:text-zinc-300",
            )}
          >
            {channel.name}
          </span>
          {unread && <span className="size-2 rounded-full bg-white shrink-0" />}
        </Link>

        {menuItems.length > 0 && (
          <DotMenu className={"size-10!"} onClick={openMenu} />
        )}
      </div>

      {channel.type === "voice" && voiceMembers.length > 0 && (
        <div className="flex flex-col gap-1 px-3 pb-2 pt-1.5">
          {voiceMembers.map((m) => (
            <VoiceMemberRow
              key={m.uid}
              member={m}
              serverId={serverId}
              channelId={channel.id}
              channelName={channel.name}
            />
          ))}
        </div>
      )}

      {menuItems.length > 0 && (
        <>
          <ContextMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            position={menuPos}
            width={menuWidth}
            items={menuItems}
          />
          <RenameChannelModal
            open={showRename}
            onClose={() => setShowRename(false)}
            serverId={serverId}
            channel={channel}
          />
          <ConfirmModal
            open={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
            title="Kanal löschen"
            description={`Möchtest du #${channel.name} wirklich löschen? Dies kann nicht rückgängig gemacht werden.`}
            confirmLabel="Löschen"
            loading={deleting}
            error={deleteError}
          />
        </>
      )}
    </motion.div>
  );
}
