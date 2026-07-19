"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { MessageList, type LocalMessage } from "@/components/chat/MessageList";
import { api } from "@/lib/apiClient";
import type { Conversation, ConversationDetail } from "@/lib/types";

export function HistoryPanel() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Conversation[]>("/api/chat/conversations")
      .then(setConversations)
      .finally(() => setLoading(false));
  }, []);

  const openConversation = async (id: string) => {
    const detail = await api.get<ConversationDetail>(`/api/chat/conversations/${id}`);
    setSelected(detail);
  };

  const localMessages: LocalMessage[] =
    selected?.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })) ?? [];

  return (
    <div className="grid h-full grid-cols-[280px_1fr] gap-4">
      <Card className="overflow-y-auto">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && conversations.length === 0 && <p className="text-sm text-slate-500">No conversations yet.</p>}
        <div className="flex flex-col gap-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selected?.id === c.id ? "bg-primary/15 text-primary" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <p className="truncate">{c.title}</p>
              <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}</p>
            </button>
          ))}
        </div>
      </Card>
      <Card className="overflow-y-auto">
        {selected ? <MessageList messages={localMessages} /> : <p className="text-sm text-slate-500">Select a conversation.</p>}
      </Card>
    </div>
  );
}
