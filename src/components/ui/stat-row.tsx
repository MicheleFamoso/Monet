import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Status = "neutral" | "good" | "warning" | "accent";

const valueColor: Record<Status, string> = {
  neutral: "text-primary",
  good: "text-success",
  warning: "text-warning",
  accent: "text-accent",
};

interface StatRowProps {
  label: string;
  value: ReactNode;
  unit?: string;
  status?: Status;
  trend?: string;
  className?: string;
}

export function StatRow({
  label,
  value,
  unit,
  status = "neutral",
  trend,
  className,
}: StatRowProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0 last:pb-0 first:pt-0",
        className,
      )}
    >
      <span className="label text-secondary">{label}</span>
      <span className={cn("flex items-baseline gap-1.5 font-mono", valueColor[status])}>
        {trend ? (
          <span className="text-caption" aria-hidden>
            {trend}
          </span>
        ) : null}
        <span className="text-body">{value}</span>
        {unit ? <span className="text-label uppercase opacity-70">{unit}</span> : null}
      </span>
    </div>
  );
}