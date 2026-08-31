import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="label text-secondary">{label}</label>
      {children}
      {error ? (
        <span className="font-mono text-caption text-accent" role="alert">
          [ERROR: {error}]
        </span>
      ) : hint ? (
        <span className="font-mono text-caption text-disabled">[{hint}]</span>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full bg-transparent py-2 font-mono text-body text-primary transition-colors duration-200 ease-out-technical focus:outline-none",
        invalid ? "border-b border-accent" : "border-b border-border-visible focus:border-display",
        className,
      )}
      {...props}
    />
  );
}