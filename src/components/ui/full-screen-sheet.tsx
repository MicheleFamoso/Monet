"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FullScreenSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function FullScreenSheet({
  open,
  onClose,
  title,
  children,
  className,
}: FullScreenSheetProps) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="mx-auto flex w-full max-w-md min-h-0 flex-1 flex-col px-5 pt-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:text-primary"
            aria-label="Indietro"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </button>
          <h2 className="font-mono text-[13px] uppercase tracking-[0.06em] text-primary">
            {title}
          </h2>
        </div>

        <div className={cn("min-h-0 flex-1 overflow-y-auto py-6", className)}>{children}</div>
      </div>
    </div>
  );
}
