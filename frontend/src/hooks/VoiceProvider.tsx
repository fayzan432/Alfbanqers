"use client";

import { createContext, useContext } from "react";
import { useJarvisVoice } from "./useJarvisVoice";

type VoiceContextValue = ReturnType<typeof useJarvisVoice>;

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const voice = useJarvisVoice();
  return <VoiceContext.Provider value={voice}>{children}</VoiceContext.Provider>;
}

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within a VoiceProvider");
  return ctx;
}
