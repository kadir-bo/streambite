"use client";

import {
  AuthProvider,
  ServerProvider,
  VoiceProvider,
  LayoutProvider,
} from "@/context";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ServerProvider>
        <VoiceProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </VoiceProvider>
      </ServerProvider>
    </AuthProvider>
  );
}
