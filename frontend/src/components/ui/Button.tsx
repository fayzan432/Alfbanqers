import { clsx } from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
          variant === "primary" &&
            "bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 hover:shadow-[0_0_16px_rgba(0,217,255,0.35)]",
          variant === "ghost" && "border border-panel-border text-slate-300 hover:bg-white/5",
          variant === "danger" && "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
