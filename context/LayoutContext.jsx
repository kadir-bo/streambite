"use client";

import { createContext, useContext, useState, useCallback } from "react";

const LayoutContext = createContext();
export function useLayout() {
  return useContext(LayoutContext);
}
export function LayoutProvider({ children }) {
  // ACTIVE FRIENDS SIDEBAR RIGHT PANEL
  const [activeNowSidebar, setActiveNowSidebar] = useState(true);

  // Mobile-first nav: below the md breakpoint only one pane is visible at a
  // time - "list" (server rail + channel/DM list) or "content" (the actual
  // chat/voice/home view). Irrelevant at md+, where both show side by side.
  const [mobilePane, setMobilePane] = useState("list");
  const showContent = useCallback(() => setMobilePane("content"), []);
  const showList = useCallback(() => setMobilePane("list"), []);

  return (
    <LayoutContext.Provider
      value={{
        // STATE
        activeNowSidebar,
        setActiveNowSidebar,
        mobilePane,
        showContent,
        showList,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
