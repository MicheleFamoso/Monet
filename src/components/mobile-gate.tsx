"use client";

import { useEffect, useState } from "react";

const MOBILE_TEST_PARAM = "mobile";
const MOBILE_TEST_KEY = "moneta-force-mobile";

function isForceMobile(): boolean {
  try {
    if (localStorage.getItem(MOBILE_TEST_KEY) === "1") return true;
  } catch {
    /* noop */
  }
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(MOBILE_TEST_PARAM) === "1";
  } catch {
    return false;
  }
}

export function MobileGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => {
      if (!alive) return;
      const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      const narrow = window.innerWidth < 768;
      const mobile = (touch && narrow) || isForceMobile();
      setIsMobile(mobile);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (isMobile === null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="font-mono text-caption text-disabled">[LOADING...]</span>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="dot-grid flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-mono text-[13px] uppercase tracking-[0.06em] text-primary">
            Moneta · contabilità locale
          </p>
          <p className="mt-6 font-sans text-body leading-6 text-primary">
            Moneta è disponibile solo su mobile.
          </p>
          <p className="label mt-2 text-disabled">
            Aprila dal browser del tuo telefono
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
