"use client";

import { Orb } from "@/components/orb/Orb";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";

const STATE_LABEL: Record<string, string> = {
  idle: "Standing by",
  listening: "Listening...",
  thinking: "Processing...",
  speaking: "Speaking...",
};

export function HomePanel() {
  const orbState = useAppStore((s) => s.orbState);
  const amplitude = useAppStore((s) => s.amplitude);
  const { user } = useAuth();
  const orbColor = user?.settings?.orb_color || "#00d9ff";
  const speed = user?.settings?.animation_speed || 1;

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
      <Card className="flex flex-col items-center justify-center gap-4">
        <Orb state={orbState} amplitude={amplitude} color={orbColor} speed={speed} size={340} />
        <div className="text-center">
          <p className="glow-text text-sm font-medium uppercase tracking-[0.3em] text-primary">{STATE_LABEL[orbState]}</p>
          <p className="mt-1 text-xs text-slate-500">Say &ldquo;Jarvis&rdquo; to wake me, or use the mic / text below.</p>
        </div>
      </Card>
      <Card className="flex flex-col">
        <ChatPanel />
      </Card>
    </div>
  );
}
