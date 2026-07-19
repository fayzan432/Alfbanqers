"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { getToken, WS_URL } from "@/lib/apiClient";
import type { SystemStats } from "@/lib/types";

function Gauge({ label, percent, detail }: { label: string; percent: number; detail?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{detail ?? `${percent.toFixed(0)}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

export function SystemMonitorPanel() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const ws = new WebSocket(`${WS_URL}/api/system/ws?token=${token}`);
    ws.onmessage = (event) => setStats(JSON.parse(event.data));
    return () => ws.close();
  }, []);

  if (!stats) {
    return (
      <Card className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-500">Connecting to system monitor...</p>
      </Card>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto lg:grid-cols-2">
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <Gauge label="CPU" percent={stats.cpu_percent} />
        <Gauge label="RAM" percent={stats.ram_percent} detail={`${stats.ram_used_gb} / ${stats.ram_total_gb} GB`} />
        <Gauge label="Disk" percent={stats.disk_percent} detail={`${stats.disk_used_gb} / ${stats.disk_total_gb} GB`} />
        <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-400">
          <div>Net &darr; {stats.net_recv_mb} MB/s</div>
          <div>Net &uarr; {stats.net_sent_mb} MB/s</div>
        </div>
        {stats.gpu.length > 0 && (
          <div className="space-y-3 pt-2">
            {stats.gpu.map((g, i) => (
              <Gauge key={i} label={g.name} percent={g.utilization_percent} detail={`${g.memory_used_gb}/${g.memory_total_gb} GB`} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CPU Cores</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-4 gap-2">
          {stats.cpu_per_core.map((core, i) => (
            <div key={i} className="rounded-lg border border-panel-border bg-white/[0.02] p-2 text-center">
              <p className="text-[10px] text-slate-500">C{i}</p>
              <p className="text-sm font-medium text-primary">{core.toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Processes</CardTitle>
        </CardHeader>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="pb-2">PID</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">CPU %</th>
              <th className="pb-2">Mem %</th>
            </tr>
          </thead>
          <tbody>
            {stats.top_processes.map((p) => (
              <tr key={p.pid} className="border-t border-panel-border/60 text-slate-300">
                <td className="py-1.5">{p.pid}</td>
                <td className="py-1.5">{p.name}</td>
                <td className="py-1.5">{p.cpu_percent}%</td>
                <td className="py-1.5">{p.memory_percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
