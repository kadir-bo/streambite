"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useServer } from "@/context";
import { useAuth } from "@/context";
import ServerHeader from "@/components/layout/ServerHeader";
import ChannelList from "@/components/channel/ChannelList";
import DmSidebar from "@/components/layout/DmSidebar";
import ServerSettingsModal from "@/components/server/ServerSettingsModal";
import InviteModal from "@/components/modals/InviteModal";
import CreateChannelModal from "@/components/channel/CreateChannelModal";

export default function ChannelPane() {
  const params = useParams();
  const serverId = params?.serverId;
  const channelId = params?.channelId;
  const { servers, channels, categories } = useServer();
  const { firebaseUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [addChannelCategory, setAddChannelCategory] = useState(null);

  const server = servers.find((s) => s.id === serverId);
  const isOwner = server?.ownerId === firebaseUser?.uid;

  return (
    <>
      <div data-channel-pane className="flex flex-1 shrink-0 flex-col overflow-hidden bg-(--surface-deep)">
        <div className="h-(--header-channel) shrink-0 border-b border-(--border-subtle)">
          {serverId ? (
            <ServerHeader
              server={server}
              isOwner={isOwner}
              onOpenSettings={() => setShowSettings(true)}
              onOpenInvite={() => setShowInvite(true)}
            />
          ) : (
            <div className="flex h-full items-center px-3.5">
              <span className="text-sm font-semibold text-(--text-primary)">
                Direktnachrichten
              </span>
            </div>
          )}
        </div>

        <div
          className={`flex-1 overflow-y-auto ${serverId ? "py-1.5" : "p-0"}`}
        >
          {serverId ? (
            <ChannelList
              channels={channels}
              categories={categories}
              activeChannelId={channelId}
              isOwner={isOwner}
              serverId={serverId}
              onAddChannel={(cat) => {
                setAddChannelCategory(cat);
              }}
            />
          ) : (
            <DmSidebar />
          )}
        </div>
      </div>

      <ServerSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        server={server}
      />
      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        server={server}
      />
      <CreateChannelModal
        open={!!addChannelCategory}
        onClose={() => setAddChannelCategory(null)}
        category={addChannelCategory}
      />
    </>
  );
}
