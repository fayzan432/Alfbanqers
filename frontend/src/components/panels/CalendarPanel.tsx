"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/apiClient";
import type { CalendarEvent } from "@/lib/types";

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CalendarPanel() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState(toLocalInput(new Date()));
  const [end, setEnd] = useState(toLocalInput(new Date(Date.now() + 30 * 60 * 1000)));

  const load = () => api.get<CalendarEvent[]>("/api/calendar").then(setEvents);

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!title.trim()) return;
    await api.post("/api/calendar", {
      title,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
    });
    setTitle("");
    load();
  };

  const remove = async (id: string) => {
    await api.delete(`/api/calendar/${id}`);
    load();
  };

  return (
    <Card className="flex h-full flex-col gap-4">
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title..."
          className="rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
        />
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
        />
        <Button size="sm" onClick={add}>
          Add
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {events.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-panel-border bg-white/[0.02] p-3">
            <div>
              <p className="text-sm text-slate-200">{e.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {format(new Date(e.start_time), "PPp")} &rarr; {format(new Date(e.end_time), "p")}
              </p>
              <Badge tone="primary" className="mt-1.5">
                {e.event_type}
              </Badge>
            </div>
            <button onClick={() => remove(e.id)} className="text-slate-500 hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-slate-500">No events scheduled.</p>}
      </div>
    </Card>
  );
}
