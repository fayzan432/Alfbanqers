"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Activity,
  BrainCircuit,
  CalendarDays,
  FolderOpen,
  Home,
  ListTodo,
  MessageSquare,
  Notebook,
  Puzzle,
  Settings as SettingsIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/history", label: "History", icon: MessageSquare },
  { href: "/dashboard/memory", label: "Memory", icon: BrainCircuit },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/notes", label: "Notes", icon: Notebook },
  { href: "/dashboard/files", label: "Files", icon: FolderOpen },
  { href: "/dashboard/plugins", label: "Plugins", icon: Puzzle },
  { href: "/dashboard/system", label: "System", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel flex w-56 shrink-0 flex-col gap-1 rounded-2xl p-3">
      <div className="mb-4 flex items-center gap-2 px-2 pt-2">
        <div className="h-2.5 w-2.5 animate-pulse-slow rounded-full bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
        <span className="glow-text text-lg font-semibold tracking-widest text-primary">JARVIS</span>
      </div>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-primary/15 text-primary" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
