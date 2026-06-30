"use client";

import { useLayout } from "@/context";
import MobileVoiceStatusBar from "@/components/voice/MobileVoiceStatusBar";

// Below md, this is the "content" half of the one-pane-at-a-time mobile
// nav — hidden while the sidebar list is showing, full width when active.
// At md+ it's always visible (the desktop 3rd column).
export default function MobileContentPane({ children }) {
  const { mobilePane } = useLayout();

  return (
    <div
      className={`min-w-0 flex-1 flex-col overflow-hidden ${
        mobilePane === "content" ? "flex" : "hidden md:flex"
      }`}
    >
      <div className="flex min-h-0 flex-1">{children}</div>
      {/* Sidebar (and its persistent voice controls) is hidden on mobile
          while this pane is active, so surface a compact equivalent here. */}
      <MobileVoiceStatusBar />
    </div>
  );
}
