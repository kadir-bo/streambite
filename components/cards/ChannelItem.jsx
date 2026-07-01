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
import { useUnread, useIsDesktop } from "@/hooks";
import { markRead, deleteChannel } from "@/lib";
import { ContextMenu, DotMenu, ConfirmModal, RenameChannelModal, Avatar } from "@/components";

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

  // Single click:
  // - Mobile: sidebar schließen → Content anzeigen for Text + Voice
  // - Desktop: Voice sofort joinen (kein extra Tap)
  // - Mobile Voice: nur navigieren, JOIN-Button im Channel-Screen
  function handleClick() {
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
          { divider: true },
        ]
      : []),
    ...(isOwner
      ? [
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
        className={`group flex select-none items-center gap-1.5 pl-4 pr-2 py-1.5 mx-2 my-px rounded-(--radius-base) transition-colors duration-100 max-sm:py-2.5 max-sm:min-h-11 max-sm:pl-3 ${
          isActive
            ? "bg-(--state-active)"
            : "bg-transparent hover:bg-(--state-hover)"
        }`}
      >
        <Link
          href={`/servers/${serverId}/${channel.id}`}
          onClick={handleClick}
          className="flex select-none items-center gap-1.5 flex-1 min-w-0 no-underline"
        >
          <Icon
            weight={isActive ? "fill" : "regular"}
            className={`shrink-0 text-base transition-colors duration-100 ${
              isActive || unread
                ? "text-(--text-primary)"
                : "text-(--text-muted) group-hover:text-(--text-secondary)"
            }`}
          />
          <span
            className={`text-sm truncate flex-1 transition-colors duration-100 ${
              isActive || unread
                ? "text-(--text-primary) font-semibold"
                : "text-(--text-muted) font-medium group-hover:text-(--text-secondary)"
            }`}
          >
            {channel.name}
          </span>
          {unread && (
            <span className="size-2 rounded-full bg-(--text-primary) shrink-0" />
          )}
        </Link>

        {menuItems.length > 0 && (
          <DotMenu onClick={openMenu} />
        )}
      </div>

      {channel.type === "voice" && voiceMembers.length > 0 && (
        <div className="flex flex-col gap-4 pl-5 pr-2">
          {voiceMembers.map((m) => (
            <div key={m.uid} className="flex items-center gap-1.5 min-w-0">
              <Avatar src={m.avatarUrl} name={m.name} size="xs" />
              <span className="truncate text-xs text-(--text-muted)">
                {m.name}
              </span>
            </div>
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
