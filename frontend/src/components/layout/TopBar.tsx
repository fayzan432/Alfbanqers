"use client";

import { LogOut, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/Badge";

export function TopBar({ connected }: { connected: boolean }) {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel flex items-center justify-between rounded-2xl px-5 py-3">
      <div className="flex items-center gap-2">
        {connected ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-slate-500" />}
        <Badge tone={connected ? "primary" : "neutral"}>{connected ? "Voice link online" : "Voice link offline"}</Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">{user?.full_name || user?.email}</span>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-danger">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
