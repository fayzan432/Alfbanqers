"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/apiClient";
import type { Note } from "@/lib/types";

export function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const load = () => api.get<Note[]>("/api/notes").then(setNotes);

  useEffect(() => {
    load();
  }, []);

  const createNote = async () => {
    const note = await api.post<Note>("/api/notes", { title: "Untitled", content_markdown: "" });
    await load();
    setSelected(note);
    setDraftTitle(note.title);
    setDraftContent(note.content_markdown);
  };

  const select = (note: Note) => {
    setSelected(note);
    setDraftTitle(note.title);
    setDraftContent(note.content_markdown);
  };

  const save = async () => {
    if (!selected) return;
    await api.patch(`/api/notes/${selected.id}`, { title: draftTitle, content_markdown: draftContent });
    load();
  };

  const remove = async (id: string) => {
    await api.delete(`/api/notes/${id}`);
    if (selected?.id === id) setSelected(null);
    load();
  };

  const summarize = async () => {
    if (!selected) return;
    const updated = await api.post<Note>(`/api/notes/${selected.id}/summarize`);
    setSelected(updated);
    load();
  };

  return (
    <div className="grid h-full grid-cols-[240px_1fr] gap-4">
      <Card className="flex flex-col gap-3 overflow-y-auto">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <Button size="sm" onClick={createNote}>
          New note
        </Button>
        <div className="flex flex-col gap-1">
          {notes.map((n) => (
            <div
              key={n.id}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                selected?.id === n.id ? "bg-primary/15 text-primary" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <button onClick={() => select(n)} className="flex-1 truncate text-left">
                {n.title}
              </button>
              <button onClick={() => remove(n.id)} className="hidden text-slate-500 hover:text-danger group-hover:block">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        {selected ? (
          <>
            <div className="flex items-center gap-2">
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="flex-1 rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm font-medium focus:border-primary/50 focus:outline-none"
              />
              <Button size="sm" variant="ghost" onClick={summarize}>
                <Sparkles className="h-3.5 w-3.5" /> Summarize
              </Button>
              <Button size="sm" onClick={save}>
                Save
              </Button>
            </div>
            {selected.ai_summary && <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary/90">{selected.ai_summary}</p>}
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Write in markdown..."
              className="flex-1 resize-none rounded-lg border border-panel-border bg-white/5 p-3 text-sm text-slate-200 focus:border-primary/50 focus:outline-none"
            />
            <div className="max-h-40 overflow-y-auto rounded-lg border border-panel-border bg-white/[0.02] p-3 text-sm text-slate-300">
              <ReactMarkdown>{draftContent || "*Preview*"}</ReactMarkdown>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Select or create a note.</p>
        )}
      </Card>
    </div>
  );
}
