"use client";

import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/apiClient";
import type { Task } from "@/lib/types";

const PRIORITY_TONE: Record<string, "neutral" | "primary" | "warn" | "danger"> = {
  low: "neutral",
  medium: "primary",
  high: "warn",
  urgent: "danger",
};

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  const load = () => api.get<Task[]>("/api/tasks").then(setTasks);

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!title.trim()) return;
    await api.post("/api/tasks", { title, priority: "medium" });
    setTitle("");
    load();
  };

  const complete = async (task: Task) => {
    await api.patch(`/api/tasks/${task.id}`, { status: "done", completed: true });
    load();
  };

  const remove = async (id: string) => {
    await api.delete(`/api/tasks/${id}`);
    load();
  };

  return (
    <Card className="flex h-full flex-col gap-4">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New task..."
          className="flex-1 rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
        />
        <Button size="sm" onClick={add}>
          Add
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "flex items-center justify-between gap-3 rounded-lg border border-panel-border bg-white/[0.02] p-3",
              t.completed && "opacity-50"
            )}
          >
            <div>
              <p className={clsx("text-sm text-slate-200", t.completed && "line-through")}>{t.title}</p>
              <div className="mt-1 flex gap-1.5">
                <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                <Badge>{t.status}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {!t.completed && (
                <button onClick={() => complete(t)} className="text-slate-500 hover:text-primary">
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => remove(t.id)} className="text-slate-500 hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-sm text-slate-500">No tasks yet.</p>}
      </div>
    </Card>
  );
}
