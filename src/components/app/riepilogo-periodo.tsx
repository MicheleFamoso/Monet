"use client";

import { useState } from "react";
import type { Gruppo, MovimentoConCategoria } from "@/lib/queries";
import { formatEuro } from "@/lib/money";
import { FullScreenSheet } from "@/components/ui/full-screen-sheet";
import { cn } from "@/lib/cn";

export interface Settimana {
  label: string;
  range: string;
  spese: number;
  movimenti: Gruppo[];
}

interface RiepilogoPeriodoProps {
  vista: "mese" | "oggi";
  settimane: Settimana[];
  vociGiorno: MovimentoConCategoria[];
}

interface Dettaglio {
  titolo: string;
  voci: MovimentoConCategoria[];
}

export function RiepilogoPeriodo({ vista, settimane, vociGiorno }: RiepilogoPeriodoProps) {
  const [dettaglio, setDettaglio] = useState<Dettaglio | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {vista === "mese" ? (
        settimane.length === 0 ? (
          <p className="py-6 text-center font-mono text-caption text-disabled">[NESSUN MOVIMENTO]</p>
        ) : (
        <div className="flex flex-col">
          {settimane.map((s, i) => {
            const ultima = i === settimane.length - 1;
            return (
              <div
                key={i}
                className="relative border-b border-border py-4 pl-6 last:border-b-0"
              >
                <span
                  className="absolute -left-4 top-0 h-full w-4"
                  aria-hidden
                >
                  {!ultima ? (
                    <span
                      className={cn(
                        "absolute left-1/2 bottom-0 w-0 border-l border-dashed border-disabled",
                        i === 0 ? "top-[24px]" : "top-0",
                      )}
                    />
                  ) : null}
                  <span className="absolute left-1/2 top-[21px] h-[3px] w-3.5 -translate-x-1/2 rounded-full bg-accent" />
                </span>
                <p className="label text-secondary">{s.label}</p>
                <div className="mt-0.5 flex items-baseline justify-between gap-3">
                  <p className="font-mono text-caption text-disabled">{s.range}</p>
                  <p className="shrink-0 font-mono text-body tabular-nums text-accent">
                    {formatEuro(s.spese)}
                  </p>
                </div>
                <div className="mt-3 flex flex-col">
                  {s.movimenti.length === 0 ? (
                    <p className="py-4 text-center font-mono text-caption text-disabled">[NESSUN MOVIMENTO]</p>
                  ) : (
                    <>
                      <p className="label text-secondary">Movimenti</p>
                      <div className="mt-2 flex flex-col">
                        {s.movimenti.map((g) => {
                          const soloEntrate = g.voci.every((v) => v.movimento.tipo === "entrata");
                          return (
                            <button
                              key={g.nome}
                              type="button"
                              onClick={() => setDettaglio({ titolo: `${g.nome} · ${s.label}`, voci: g.voci })}
                              className="flex w-full items-center justify-between gap-4 border-b border-border py-3 text-left transition-colors last:border-b-0 hover:bg-surface-raised"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: g.colore ?? "var(--border-visible)" }}
                                  aria-hidden
                                />
                                <span className="truncate font-sans text-body text-primary">{g.nome}</span>
                              </span>
                              <span
                                className={cn(
                                  "shrink-0 font-mono text-body tabular-nums",
                                  soloEntrate ? "text-success" : "text-primary",
                                )}
                              >
                                {soloEntrate ? "+" : ""}
                                {formatEuro(g.totale)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )
      ) : (
        <div className="flex flex-col border-t border-border">
          {vociGiorno.map((v) => (
            <button
              key={v.movimento.id}
              type="button"
              onClick={() => setDettaglio({ titolo: "Movimento", voci: [v] })}
              className="flex w-full items-center justify-between gap-4 border-b border-border py-3 text-left transition-colors last:border-b-0 hover:bg-surface-raised"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-sans text-body text-primary">
                  {v.movimento.descrizione ?? "—"}
                </span>
                {v.categoriaNome ? (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: v.categoriaColore ?? "var(--border-visible)" }}
                      aria-hidden
                    />
                    <span className="truncate font-mono text-caption text-secondary">{v.categoriaNome}</span>
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono text-body tabular-nums",
                  v.movimento.tipo === "entrata" ? "text-success" : "text-primary",
                )}
              >
                {v.movimento.tipo === "entrata" ? "+" : "−"}
                {formatEuro(v.movimento.importo)}
              </span>
            </button>
          ))}
          {vociGiorno.length === 0 ? (
            <p className="py-6 text-center font-mono text-caption text-disabled">[NESSUN MOVIMENTO]</p>
          ) : null}
        </div>
      )}

      <FullScreenSheet
        open={dettaglio !== null}
        onClose={() => setDettaglio(null)}
        title={dettaglio?.titolo ?? "Movimenti"}
      >
        {dettaglio ? (
          <div className="flex flex-col">
            <p className="font-display text-display-md leading-none tracking-tight text-display">
              {formatEuro(dettaglio.voci.reduce((acc, v) => acc + v.movimento.importo, 0))}
            </p>
            <p className="label mt-2 text-disabled">Totale</p>

            <div className="mt-6 flex flex-col">
              {dettaglio.voci.map((v) => (
                <div
                  key={v.movimento.id}
                  className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="font-mono text-caption text-disabled">{v.movimento.data}</span>
                    <span className="truncate font-sans text-body text-primary">
                      {v.movimento.descrizione ?? "—"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-body tabular-nums",
                      v.movimento.tipo === "entrata" ? "text-success" : "text-primary",
                    )}
                  >
                    {v.movimento.tipo === "entrata" ? "+" : "−"}
                    {formatEuro(v.movimento.importo)}
                  </span>
                </div>
              ))}
              {dettaglio.voci.length === 0 ? (
                <p className="py-6 text-center font-mono text-caption text-disabled">[NESSUN MOVIMENTO]</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </FullScreenSheet>
    </div>
  );
}
