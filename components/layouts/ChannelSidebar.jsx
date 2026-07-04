'use client'

import { UserPanel } from "@/components"

export default function ChannelSidebar({ header, children }) {
  return (
    <aside className="w-52 bg-(--surface-deep) border-r border-white/5 flex flex-col shrink-0">
      {header && (
        <div className="h-12 border-b border-white/5 flex items-center px-4 shrink-0">
          {header}
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {children ?? (
          <p className="px-4 py-3 text-xs text-zinc-600">
            Keine Channels
          </p>
        )}
      </div>

      <UserPanel />
    </aside>
  )
}
