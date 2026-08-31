"use client";

import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Array<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-full border border-border-visible p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "h-9 rounded-full px-4 font-mono text-label uppercase tracking-[0.08em] transition-colors duration-200 ease-out-technical",
              active
                ? "bg-display text-black"
                : "text-secondary hover:text-primary",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}