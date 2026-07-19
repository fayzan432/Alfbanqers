"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import ReactMarkdown from "react-markdown";

export interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function MessageList({ messages }: { messages: LocalMessage[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-500">Say &ldquo;Jarvis&rdquo; or type a message to begin.</div>;
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-1">
      {messages.map((m) => (
        <div key={m.id} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
          <div
            className={clsx(
              "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              m.role === "user" ? "bg-primary/15 text-primary-glow border border-primary/30" : "glass-panel text-slate-200"
            )}
          >
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
