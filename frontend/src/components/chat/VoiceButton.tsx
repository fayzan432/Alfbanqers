"use client";

import { clsx } from "clsx";
import { Mic, MicOff } from "lucide-react";
import { useVoice } from "@/hooks/VoiceProvider";
import { useAppStore } from "@/store/useAppStore";

export function VoiceButton() {
  const { startPushToTalk, stopPushToTalk, wakeWordEnabled, setWakeWordEnabled } = useVoice();
  const orbState = useAppStore((s) => s.orbState);
  const isListening = orbState === "listening";

  return (
    <div className="flex items-center gap-3">
      <button
        onMouseDown={startPushToTalk}
        onMouseUp={stopPushToTalk}
        onTouchStart={startPushToTalk}
        onTouchEnd={stopPushToTalk}
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-full border transition-all",
          isListening
            ? "border-primary bg-primary/25 shadow-[0_0_20px_rgba(0,217,255,0.5)]"
            : "border-panel-border bg-white/5 hover:bg-white/10"
        )}
        title="Hold to talk"
      >
        <Mic className={clsx("h-5 w-5", isListening ? "text-primary" : "text-slate-300")} />
      </button>

      <button
        onClick={() => setWakeWordEnabled(!wakeWordEnabled)}
        className={clsx(
          "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
          wakeWordEnabled ? "border-primary/40 bg-primary/10 text-primary" : "border-panel-border text-slate-400 hover:bg-white/5"
        )}
        title="Toggle wake-word listening"
      >
        {wakeWordEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
        {wakeWordEnabled ? "Listening for “Jarvis”" : "Wake word off"}
      </button>
    </div>
  );
}
