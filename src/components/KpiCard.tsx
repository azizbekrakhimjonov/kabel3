import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  delay = 0,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "accent" | "success" | "warning";
  delay?: number;
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning",
  }[tone];

  return (
    <div
      className="panel animate-rise group relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-lg", toneClass)}>
          <Icon className="size-5" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );
}
