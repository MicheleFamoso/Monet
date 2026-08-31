"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { IconConti, IconResoconti, IconHome, IconCategorie, IconImpostazioni, IconPlus } from "@/components/ui/icons";
import { AggiungiSheet, type Azione } from "@/components/app/aggiungi-modal";

interface Tab {
  href: string;
  label: string;
  azione: Azione;
  Icon: (props: { className?: string }) => React.ReactNode;
}

const TABS: Tab[] = [
  { href: "/conti", label: "Conti", azione: "conto", Icon: IconConti },
  { href: "/resoconti", label: "Resoconti", azione: "movimento", Icon: IconResoconti },
  { href: "/", label: "Home", azione: "movimento", Icon: IconHome },
  { href: "/categorie", label: "Categorie", azione: "categoria", Icon: IconCategorie },
  { href: "/impostazioni", label: "Impostazioni", azione: "movimento", Icon: IconImpostazioni },
];

function useActiveTab(pathname: string): Tab {
  const match = TABS.find((t) => (t.href === "/" ? pathname === "/" : pathname === t.href));
  return match ?? TABS[1];
}

export function BottomTabBar() {
  const pathname = usePathname();
  const active = useActiveTab(pathname);
  const [openAzione, setOpenAzione] = useState<Azione | null>(null);

  return (
    <>
      <nav
        aria-label="Navigazione principale"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center gap-3 px-4">
          {/* Pillola con le tab */}
          <div className="flex items-center gap-1 rounded-full border border-border-visible bg-surface px-2 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            {TABS.map((tab) => {
              const isActive = tab.href === active.href;
              const { Icon } = tab;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-label={tab.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 w-10 select-none items-center justify-center rounded-full transition-colors duration-200 ease-out-technical",
                    isActive ? "bg-accent text-white" : "text-secondary hover:text-display",
                  )}
                >
                  <Icon className={cn(isActive && "stroke-[2.2]")} />
                </Link>
              );
            })}
          </div>

          {/* Tasto + tondo staccato */}
          <button
            type="button"
            onClick={() => setOpenAzione(active.azione)}
            aria-label="Aggiungi"
            className="inline-flex h-[52px] w-[52px] shrink-0 select-none items-center justify-center rounded-full bg-display text-black shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-out-technical hover:brightness-110 active:scale-95"
          >
            <IconPlus />
          </button>
        </div>
      </nav>

      <AggiungiSheet
        open={openAzione !== null}
        onClose={() => setOpenAzione(null)}
        azione={openAzione ?? "movimento"}
      />
    </>
  );
}
