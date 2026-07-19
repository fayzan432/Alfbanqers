"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ConfirmBanner } from "@/components/ui/ConfirmBanner";
import { VoiceProvider, useVoice } from "@/hooks/VoiceProvider";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { connected } = useVoice();
  return (
    <div className="flex h-screen gap-4 p-4">
      <Sidebar />
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <TopBar connected={connected} />
        <ConfirmBanner />
        <main className="flex-1 overflow-y-auto rounded-2xl">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <VoiceProvider>
      <ShellInner>{children}</ShellInner>
    </VoiceProvider>
  );
}
