"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface DropdownItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  className?: string;
}

export function DropdownMenu({ items, className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleItemClick(item: DropdownItem) {
    setOpen(false);
    item.onClick();
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center text-secondary transition-colors hover:text-primary"
        aria-label="Azioni"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-1 min-w-[140px] rounded-xl border border-border bg-surface py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleItemClick(item)}
              className={cn(
                "block w-full px-4 py-2.5 text-left font-mono text-[12px] uppercase tracking-[0.06em] transition-colors",
                item.destructive
                  ? "text-accent hover:bg-accent-subtle"
                  : "text-primary hover:bg-surface-raised",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
