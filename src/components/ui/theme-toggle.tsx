"use client";

import { Button } from "./button";

export function ThemeToggle() {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        const isDark = document.documentElement.classList.toggle("dark");
        try {
          localStorage.setItem("moneta-theme", isDark ? "dark" : "light");
        } catch {
          /* noop */
        }
      }}
      aria-label="Cambia tema"
      className="px-4"
    >
      <span className="dark:hidden">[ LIGHT ]</span>
      <span className="hidden dark:inline">[ DARK ]</span>
    </Button>
  );
}