import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
}

export function Tag({ active = false, className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-mono text-caption uppercase tracking-[0.06em]",
        active
          ? "border-display text-display"
          : "border-border-visible text-disabled",
        className,
      )}
      {...props}
    />
  );
}