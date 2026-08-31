"use client";

import { useEffect, useState } from "react";
import { ensureSeeded } from "@/lib/seed";

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    ensureSeeded().then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="font-mono text-caption text-disabled">[LOADING...]</span>
      </div>
    );
  }

  return <>{children}</>;
}