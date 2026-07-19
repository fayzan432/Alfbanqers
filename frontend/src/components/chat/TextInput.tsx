"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";

export function TextInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Message JARVIS..."
        className="flex-1 rounded-xl border border-panel-border bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary/50 focus:outline-none"
      />
      <Button type="submit" size="md">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
