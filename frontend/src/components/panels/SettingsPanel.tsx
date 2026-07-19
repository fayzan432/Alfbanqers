"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/apiClient";
import { useAppStore } from "@/store/useAppStore";
import type { User, UserSettings } from "@/lib/types";

const VOICES = ["en-US-GuyNeural", "en-US-JennyNeural", "en-GB-RyanNeural", "en-AU-WilliamNeural"];
const AI_PROVIDERS = ["default", "local", "openai", "anthropic"];

export function SettingsPanel() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [form, setForm] = useState<UserSettings>(user?.settings ?? {});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setForm(user.settings);
  }, [user]);

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    const updated = await api.patch<User>("/api/settings", form);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const [emailForm, setEmailForm] = useState({
    email_address: "",
    app_password: "",
    imap_host: "imap.gmail.com",
    imap_port: 993,
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
  });
  const [emailStatus, setEmailStatus] = useState("");

  const linkEmail = async () => {
    setEmailStatus("");
    try {
      await api.post("/api/email/accounts", emailForm);
      setEmailStatus("Linked.");
    } catch (err) {
      setEmailStatus(err instanceof ApiError ? err.message : "Failed to link account");
    }
  };

  return (
    <Card className="mx-auto flex h-full max-w-2xl flex-col gap-6 overflow-y-auto">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Appearance</h3>
        <label className="flex items-center justify-between text-sm">
          Theme
          <span className="rounded-lg border border-panel-border bg-white/5 px-3 py-1.5 text-slate-400">Dark (only)</span>
        </label>
        <label className="flex items-center justify-between text-sm">
          Orb color
          <input
            type="color"
            value={form.orb_color || "#00d9ff"}
            onChange={(e) => update("orb_color", e.target.value)}
            className="h-8 w-16 cursor-pointer rounded border border-panel-border bg-transparent"
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          Animation speed
          <input
            type="range"
            min={0.3}
            max={2}
            step={0.1}
            value={form.animation_speed ?? 1}
            onChange={(e) => update("animation_speed", parseFloat(e.target.value))}
            className="w-40"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Voice</h3>
        <label className="flex items-center justify-between text-sm">
          TTS voice
          <select
            value={form.voice || VOICES[0]}
            onChange={(e) => update("voice", e.target.value)}
            className="rounded-lg border border-panel-border bg-white/5 px-3 py-1.5"
          >
            {VOICES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center justify-between text-sm">
          Wake word
          <input
            value={form.wake_word || "jarvis"}
            onChange={(e) => update("wake_word", e.target.value)}
            className="rounded-lg border border-panel-border bg-white/5 px-3 py-1.5"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Intelligence</h3>
        <label className="flex items-center justify-between text-sm">
          AI provider
          <select
            value={form.ai_provider || "default"}
            onChange={(e) => update("ai_provider", e.target.value)}
            className="rounded-lg border border-panel-border bg-white/5 px-3 py-1.5"
          >
            {AI_PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-slate-500">
          &ldquo;default&rdquo; uses the server&rsquo;s configured backend (free local model by default). Set
          AI_PROVIDER / API keys in the backend .env to enable OpenAI or Anthropic.
        </p>
        <label className="flex items-center justify-between text-sm">
          Memory enabled
          <input
            type="checkbox"
            checked={form.memory_enabled ?? true}
            onChange={(e) => update("memory_enabled", e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Automation permissions</h3>
        <p className="text-xs text-slate-500">
          Computer/browser control is disabled server-side by default (AUTOMATION_ENABLED in the backend .env). Destructive
          actions (deleting files, sending email, running commands, logging into sites) always require in-chat confirmation
          regardless of this setting.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Link email account</h3>
        <p className="text-xs text-slate-500">
          Use an app password, not your main account password. Credentials are encrypted at rest.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Email address"
            value={emailForm.email_address}
            onChange={(e) => setEmailForm((f) => ({ ...f, email_address: e.target.value }))}
            className="col-span-2 rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
          />
          <input
            type="password"
            placeholder="App password"
            value={emailForm.app_password}
            onChange={(e) => setEmailForm((f) => ({ ...f, app_password: e.target.value }))}
            className="col-span-2 rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
          />
          <input
            placeholder="IMAP host"
            value={emailForm.imap_host}
            onChange={(e) => setEmailForm((f) => ({ ...f, imap_host: e.target.value }))}
            className="rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
          />
          <input
            placeholder="SMTP host"
            value={emailForm.smtp_host}
            onChange={(e) => setEmailForm((f) => ({ ...f, smtp_host: e.target.value }))}
            className="rounded-lg border border-panel-border bg-white/5 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={linkEmail}>
            Link account
          </Button>
          {emailStatus && <span className="text-xs text-slate-400">{emailStatus}</span>}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={save}>Save settings</Button>
        {saved && <span className="text-xs text-primary">Saved.</span>}
      </div>
    </Card>
  );
}
