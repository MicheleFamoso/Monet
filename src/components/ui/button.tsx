import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

const base =
  "inline-flex h-11 select-none items-center justify-center gap-2 font-mono text-[13px] uppercase tracking-[0.06em] transition-colors duration-200 ease-out-technical disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "rounded-full bg-display px-6 text-black hover:brightness-110",
  secondary:
    "rounded-full border border-border-visible px-6 text-primary hover:border-display",
  ghost: "rounded-none text-secondary hover:text-primary",
  destructive:
    "rounded-full border border-accent px-6 text-accent hover:bg-accent-subtle",
};

export function buttonClasses(
  variant: ButtonVariant = "secondary",
  className?: string,
) {
  return cn(base, variants[variant], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "secondary", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
}

export function ButtonLink({
  variant = "secondary",
  className,
  ...props
}: ButtonLinkProps) {
  return <a className={buttonClasses(variant, className)} {...props} />;
}