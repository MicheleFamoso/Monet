import { cn } from "@/lib/cn";

interface PeriodNavProps {
  label: string;
  onPrev?: () => void;
  onNext?: () => void;
  disabled?: boolean;
  className?: string;
}

export function PeriodNav({
  label,
  onPrev,
  onNext,
  disabled,
  className,
}: PeriodNavProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between font-mono text-label uppercase tracking-[0.08em]",
        className,
      )}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={disabled}
        aria-label="Mese precedente"
        className="flex h-11 w-11 items-center justify-center text-secondary transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-40"
      >
        <span aria-hidden className="text-body">
          {"<"}
        </span>
      </button>
      <span className="text-primary">{label}</span>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        aria-label="Mese successivo"
        className="flex h-11 w-11 items-center justify-center text-secondary transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-40"
      >
        <span aria-hidden className="text-body">
          {">"}
        </span>
      </button>
    </div>
  );
}