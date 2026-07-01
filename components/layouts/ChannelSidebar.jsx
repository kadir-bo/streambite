'use client'

import { UserPanel } from "@/components"

export default function ChannelSidebar({ header, children }) {
  return (
    <aside className="w-(--sidebar-channel) bg-(--surface-deep) border-r border-(--border-subtle) flex flex-col shrink-0">
      {header && (
        <div className="h-(--header-channel) border-b border-(--border-subtle) flex items-center px-4 shrink-0">
          {header}
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {children ?? (
          <p className="px-4 py-3 text-xs text-(--text-ghost)">
            Keine Channels
          </p>
        )}
      </div>

      <UserPanel />
    </aside>
  )
}
