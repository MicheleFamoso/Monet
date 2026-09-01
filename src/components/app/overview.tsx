"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getContiConSaldo } from "@/lib/queries";
import { formatEuro } from "@/lib/money";
import { FullScreenSheet } from "@/components/ui/full-screen-sheet";
import { IconCrescitaDot, IconUsciteDot, IconSwap, IconStarDot } from "@/components/ui/icons";
import { ContoIcona } from "./conto-form";

export function Overview() {
  const conti = useLiveQuery(() => getContiConSaldo(), []);
  const [contoSelezionatoId, setContoSelezionatoId] = useState<number | null>(null);
  const [sheetAperto, setSheetAperto] = useState(false);

  if (conti === undefined) {
    return (
      <section className="dot-grid-subtle mt-4 flex flex-col gap-10 py-14">
        <p className="font-mono text-caption text-disabled">[LOADING...]</p>
      </section>
    );
  }

  const riferimento =
    conti.find((c) => c.conto.id === contoSelezionatoId) ??
    conti.find((c) => c.conto.predefinito === true) ??
    conti[0] ??
    null;

  const saldo = riferimento?.saldo ?? 0;
  const negativo = saldo < 0;

  return (
    <section className="dot-grid-subtle mt-4 flex flex-col gap-10 py-14">
      <div>
        <div className="flex items-center gap-2">
          <p className="label text-secondary">
            {riferimento ? `Saldo · ${riferimento.conto.nome}` : "Saldo"}
          </p>
          {conti.length > 1 ? (
            <button
              type="button"
              onClick={() => setSheetAperto(true)}
              className="inline-flex h-6 w-6 items-center justify-center text-secondary transition-colors hover:text-primary"
              aria-label="Cambia conto"
            >
              <IconSwap className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <div
          className={`mt-4 flex items-center gap-4 ${
            negativo ? "text-accent" : "text-display"
          }`}
        >
          <IconCrescitaDot className="h-8 w-8 shrink-0" />
          <p className="font-display text-display-xl font-bold leading-none tracking-tight">
            {formatEuro(saldo)}
          </p>
        </div>

        <div className="mt-5 flex flex-col items-end justify-end gap-1 text-accent">
          <p className="label text-accent">Uscite</p>
          <div className="flex items-center gap-2">
            <IconUsciteDot className="h-5 w-5" />
            <p className="font-display text-display-md font-bold leading-none tracking-tight">
              {formatEuro(riferimento?.usciteMese ?? 0)}
            </p>
          </div>
        </div>
      </div>

      <FullScreenSheet open={sheetAperto} onClose={() => setSheetAperto(false)} title="Cambia conto">
        {conti.length === 0 ? (
          <p className="font-sans text-body-sm text-secondary">Nessun conto creato.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {conti.map(({ conto, saldo: saldoConto }) => {
              const attivo = conto.id === riferimento?.conto.id;
              return (
                <button
                  key={conto.id}
                  type="button"
                  onClick={() => {
                    setContoSelezionatoId(conto.id!);
                    setSheetAperto(false);
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors active:bg-surface-raised"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent" aria-hidden>
                    <ContoIcona id={conto.icona} className="h-5 w-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-sans text-body text-primary">{conto.nome}</span>
                      {conto.predefinito === true ? <IconStarDot className="h-4 w-4 shrink-0" /> : null}
                    </span>
                    <span className="font-display text-display-md leading-none tracking-tight text-display">
                      {formatEuro(saldoConto)}
                    </span>
                  </span>
                  {attivo ? (
                    <span className="label text-accent">Attivo</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </FullScreenSheet>
    </section>
  );
}
