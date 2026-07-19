import { create } from "zustand";
import type { OrbState, User } from "@/lib/types";

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  orbState: OrbState;
  setOrbState: (state: OrbState) => void;

  amplitude: number;
  setAmplitude: (amplitude: number) => void;

  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;

  pendingConfirmation: { token: string; text: string } | null;
  setPendingConfirmation: (value: { token: string; text: string } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  orbState: "idle",
  setOrbState: (orbState) => set({ orbState }),

  amplitude: 0,
  setAmplitude: (amplitude) => set({ amplitude }),

  currentConversationId: null,
  setCurrentConversationId: (currentConversationId) => set({ currentConversationId }),

  pendingConfirmation: null,
  setPendingConfirmation: (pendingConfirmation) => set({ pendingConfirmation }),
}));
