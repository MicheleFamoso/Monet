"use client";

import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onCheckedChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex h-11 select-none items-center gap-3",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 ease-out-technical",
          checked ? "border-transparent bg-display" : "border-border-visible",
        )}
      >
        <span
          className={cn(
            "absolute left-[3px] h-5 w-5 rounded-full transition-transform duration-200 ease-out-technical",
            checked ? "translate-x-5 bg-black" : "bg-disabled",
          )}
        />
      </span>
      {label ? <span className="font-mono text-body-sm uppercase tracking-[0.04em] text-primary">{label}</span> : null}
    </button>
  );
}