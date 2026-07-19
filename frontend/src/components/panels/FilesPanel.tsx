"use client";

import { useState } from "react";
import { FileIcon, Folder, FolderPlus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/apiClient";
import type { FileEntry } from "@/lib/types";

function formatSize(bytes: number): string {
  if (bytes === 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function FilesPanel() {
  const [path, setPath] = useState("~");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [error, setError] = useState("");

  const list = async (target: string) => {
    setError("");
    try {
      const data = await api.get<FileEntry[]>(`/api/files/list?path=${encodeURIComponent(target)}`);
      setEntries(data);
      setPath(target);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to list directory");
    }
  };

  const makeFolder = async () => {
    const name = prompt("New folder name:");
    if (!name) return;
    await api.post("/api/files/folder", { path: `${path}/${name}` });
    list(path);
  };

  const deleteEntry = async (entryPath: string) => {
    if (!confirm(`Delete "${entryPath}"? This requires confirmation and cannot be undone.`)) return;
    const { token } = await api.post<{ token: string }>("/api/files/delete/request", { path: entryPath });
    await api.post(`/api/files/delete/confirm?token=${encodeURIComponent(token)}`);
    list(path);
  };

  return (
    <Card className="flex h-full flex-col gap-4">
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>

      <div className="flex gap-2">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && list(path)}
          className="flex-1 rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm font-mono focus:border-primary/50 focus:outline-none"
        />
        <Button size="sm" onClick={() => list(path)}>
          Go
        </Button>
        <Button size="sm" variant="ghost" onClick={makeFolder}>
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex-1 space-y-1 overflow-y-auto">
        {entries.map((entry) => (
          <div
            key={entry.path}
            className="flex items-center justify-between gap-3 rounded-lg border border-panel-border bg-white/[0.02] px-3 py-2 text-sm"
          >
            <button
              onClick={() => (entry.is_dir ? list(entry.path) : undefined)}
              className="flex flex-1 items-center gap-2 text-left text-slate-200"
            >
              {entry.is_dir ? <Folder className="h-4 w-4 text-primary" /> : <FileIcon className="h-4 w-4 text-slate-500" />}
              {entry.name}
            </button>
            <span className="text-xs text-slate-500">{entry.is_dir ? "" : formatSize(entry.size_bytes)}</span>
            <button onClick={() => deleteEntry(entry.path)} className="text-slate-500 hover:text-danger">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-slate-500">Enter a path and press Go.</p>}
      </div>
    </Card>
  );
}
