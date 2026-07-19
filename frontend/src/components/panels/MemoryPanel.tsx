"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/apiClient";
import type { MemoryRecord } from "@/lib/types";

const KINDS = ["short_term", "long_term", "semantic", "fact", "preference", "project"];

export function MemoryPanel() {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [content, setContent] = useState("");
  const [kind, setKind] = useState("long_term");
  const [query, setQuery] = useState("");

  const load = () => api.get<MemoryRecord[]>("/api/memory").then(setMemories);

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!content.trim()) return;
    await api.post("/api/memory", { content, kind, source: "manual", importance: 2 });
    setContent("");
    load();
  };

  const remove = async (id: string) => {
    await api.delete(`/api/memory/${id}`);
    load();
  };

  const search = async () => {
    if (!query.trim()) return load();
    const { results } = await api.post<{ results: string[] }>("/api/memory/search", { query, top_k: 10 });
    setMemories(results.map((content, i) => ({ id: `search-${i}`, kind: "semantic", content, source: "search", importance: 0, created_at: "" })));
  };

  return (
    <Card className="flex h-full flex-col gap-4">
      <CardHeader>
        <CardTitle>Memory</CardTitle>
      </CardHeader>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Semantic search..."
          className="flex-1 rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
        />
        <Button size="sm" onClick={search}>
          Search
        </Button>
        <Button size="sm" variant="ghost" onClick={load}>
          Reset
        </Button>
      </div>

      <div className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Remember something..."
          className="flex-1 rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="rounded-lg border border-panel-border bg-white/5 px-2 py-2 text-sm"
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={add}>
          Add
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {memories.map((m) => (
          <div key={m.id} className="flex items-start justify-between gap-3 rounded-lg border border-panel-border bg-white/[0.02] p-3">
            <div>
              <Badge tone="primary">{m.kind}</Badge>
              <p className="mt-1.5 text-sm text-slate-200">{m.content}</p>
            </div>
            {!m.id.startsWith("search-") && (
              <button onClick={() => remove(m.id)} className="text-slate-500 hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {memories.length === 0 && <p className="text-sm text-slate-500">No memories yet.</p>}
      </div>
    </Card>
  );
}
