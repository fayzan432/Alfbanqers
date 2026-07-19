"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/apiClient";
import type { Plugin } from "@/lib/types";

export function PluginsPanel() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  const load = () => api.get<Plugin[]>("/api/plugins").then(setPlugins);

  useEffect(() => {
    load();
  }, []);

  const toggle = async (plugin: Plugin) => {
    await api.patch(`/api/plugins/${plugin.slug}/enabled?enabled=${!plugin.enabled}`);
    load();
  };

  return (
    <Card className="flex h-full flex-col gap-4">
      <CardHeader>
        <CardTitle>Plugins</CardTitle>
      </CardHeader>
      <p className="text-xs text-slate-500">
        Drop a new folder with a <code>manifest.json</code> and <code>plugin.py</code> into{" "}
        <code>backend/plugins_dir/</code> to add new skills — no core code changes required.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {plugins.map((p) => (
          <div key={p.slug} className="flex flex-col gap-2 rounded-lg border border-panel-border bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-100">{p.name}</p>
              <button
                onClick={() => toggle(p)}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  p.enabled ? "bg-primary/15 text-primary" : "bg-white/5 text-slate-500"
                }`}
              >
                {p.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
            <p className="text-xs text-slate-400">{p.description}</p>
            <div className="flex flex-wrap gap-1">
              <Badge>v{p.version}</Badge>
              {p.permissions.map((perm) => (
                <Badge key={perm} tone="warn">
                  {perm}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        {plugins.length === 0 && <p className="text-sm text-slate-500">No plugins discovered.</p>}
      </div>
    </Card>
  );
}
