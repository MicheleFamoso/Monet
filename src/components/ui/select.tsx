import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full cursor-pointer border-b border-border-visible bg-transparent py-2 font-mono text-body text-primary transition-colors duration-200 ease-out-technical focus:border-display focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}