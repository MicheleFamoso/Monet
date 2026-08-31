import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Status } from "./stat-row";

const fillColor: Record<Status, string> = {
  neutral: "bg-display",
  good: "bg-success",
  warning: "bg-warning",
  accent: "bg-accent",
};

interface SegmentedProgressProps {
  label?: ReactNode;
  value: string;
  valueLabel?: string;
  className?: string;
  size?: "compact" | "standard" | "hero";
  status?: "neutral" | "good" | "warning";
  ratio?: number;
}

export function SegmentedProgress({
  label,
  value,
  valueLabel,
  className,
  size = "standard",
  status = "neutral",
  ratio = 0,
}: SegmentedProgressProps) {
  const segments = 24;
  const capped = Math.max(0, Math.min(ratio, 1));
  const filled = Math.round(segments * capped);
  const over = Math.max(0, Math.round(segments * (ratio - 1)));
  const height = size === "hero" ? 20 : size === "standard" ? 8 : 5;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label ? (
        <div className="flex items-baseline justify-between gap-4">
          <span className="label text-secondary">{label}</span>
          <span className="font-mono text-body-sm text-primary">
            {value}
            {valueLabel ? (
              <span className="ml-1.5 text-label uppercase text-disabled">{valueLabel}</span>
            ) : null}
          </span>
        </div>
      ) : null}
      <div className="flex gap-[2px]" role="img" aria-label={valueLabel ? `${value} ${valueLabel}` : value}>
        {Array.from({ length: Math.max(segments, filled + over) }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "flex-1",
              index < filled
                ? fillColor[status]
                : index >= segments
                  ? fillColor.accent
                  : "bg-border",
            )}
            style={{ height }}
          />
        ))}
      </div>
    </div>
  );
}