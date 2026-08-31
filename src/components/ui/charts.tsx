import { cn } from "@/lib/cn";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ data, width = 200, height = 36, className }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 3;
  const points = data
    .map((value, index) => {
      const x = pad + (index / (data.length - 1 || 1)) * (width - pad * 2);
      const y = pad + (1 - (value - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-secondary", className)}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

interface BarsProps {
  data: number[];
  height?: number;
  className?: string;
}

export function Bars({ data, height = 96, className }: BarsProps) {
  const max = Math.max(...data) || 1;
  return (
    <div
      className={cn("flex w-full items-end gap-[6px]", className)}
      style={{ height }}
      aria-hidden
    >
      {data.map((value, index) => (
        <div key={index} className="relative flex-1 bg-border">
          <div
            className="absolute inset-x-0 bottom-0 bg-display"
            style={{ height: `${(value / max) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}