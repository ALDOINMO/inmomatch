import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-slate-950 hover:bg-teal-300",
        variant === "secondary" && "border border-border bg-card text-foreground hover:bg-white/10",
        variant === "ghost" && "text-muted hover:bg-white/10 hover:text-foreground",
        variant === "danger" && "bg-danger text-white hover:bg-rose-400",
        className,
      )}
      {...props}
    />
  );
}
