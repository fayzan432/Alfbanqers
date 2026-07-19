import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

const TONES = {
  neutral: "bg-white/5 text-slate-300 border-white/10",
  primary: "bg-primary/10 text-primary border-primary/30",
  warn: "bg-warn/10 text-warn border-warn/30",
  danger: "bg-danger/10 text-danger border-danger/30",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof TONES;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return <span className={clsx("rounded-full border px-2 py-0.5 text-[11px] font-medium", TONES[tone], className)} {...props} />;
}
