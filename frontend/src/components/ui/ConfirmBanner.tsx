"use client";

import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/apiClient";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "./Button";

export function ConfirmBanner() {
  const pending = useAppStore((s) => s.pendingConfirmation);
  const setPending = useAppStore((s) => s.setPendingConfirmation);

  if (!pending) return null;

  const respond = async (approve: boolean) => {
    try {
      await api.post("/api/chat/confirm", { token: pending.token, approve });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="glass-panel animate-fade-in mx-auto flex max-w-xl items-center gap-3 rounded-xl border-warn/40 p-4">
      <AlertTriangle className="h-5 w-5 shrink-0 text-warn" />
      <p className="flex-1 text-sm text-slate-200">{pending.text}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="danger" onClick={() => respond(false)}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" onClick={() => respond(true)}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
