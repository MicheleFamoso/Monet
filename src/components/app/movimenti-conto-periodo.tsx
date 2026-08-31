"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getMovimentiConto, etichettaMese, mesePrecedente, meseSuccessivo, type MovimentoConCategoria } from "@/lib/queries";
import { formatEuro } from "@/lib/money";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PeriodNav } from "@/components/ui/period-nav";
import { FullScreenSheet } from "@/components/ui/full-screen-sheet";
import { cn } from "@/lib/cn";

type Periodo = "mese" | "tutto" | "anno";

interface Gruppo {
  nome: string;
  colore?: string;
  totale: number;
  voci: MovimentoConCategoria[];
}

interface MovimentiContoPeriodoProps {
  contoId: number;
  className?: string;
}

function aggPerCategoria(voci: MovimentoConCategoria[]): Gruppo[] {
  const mappa = new Map<string, Gruppo>();
  const senzaCategoria: Gruppo = { nome: "Senza categoria", totale: 0, voci: [] };
  for (const v of voci) {
    const c = v.categoriaNome;
    if (c === undefined) {
      senzaCategoria.voci.push(v);
      senzaCategoria.totale += v.movimento.importo;
      continue;
    }
    const g = mappa.get(c) ?? { nome: c, colore: v.categoriaColore, totale: 0, voci: [] as MovimentoConCategoria[] };
    g.voci.push(v);
    g.totale += v.movimento.importo;
    mappa.set(c, g);
  }
  const gruppi = [...mappa.values()].sort((a, b) => b.totale - a.totale);
  if (senzaCategoria.voci.length > 0) gruppi.push(senzaCategoria);
  return gruppi;
}

export function MovimentiContoPeriodo({ contoId, className }: MovimentiContoPeriodoProps) {
  const rows = useLiveQuery(() => getMovimentiConto(contoId), [contoId]);
  const now = new Date();
  const [periodo, setPeriodo] = useState<Periodo>("mese");
  const [anno, setAnno] = useState(now.getFullYear());
  const [mese, setMese] = useState(now.getMonth() + 1);
  const [dettaglio, setDettaglio] = useState<Gruppo | null>(null);

  const { uscite, entrate, saldoInizio, speseTotali, saldoFine } = useMemo(() => {
    if (!rows) {
      return { uscite: [], entrate: [], saldoInizio: 0, speseTotali: 0, saldoFine: 0 };
    }

    let inizio: string | null;
    let fine: string | null;
    if (periodo === "mese") {
      inizio = `${anno}-${String(mese).padStart(2, "0")}-01`;
      const p = meseSuccessivo(anno, mese);
      fine = `${p.anno}-${String(p.mese).padStart(2, "0")}-01`;
    } else if (periodo === "anno") {
      inizio = `${anno}-01-01`;
      fine = `${anno + 1}-01-01`;
    } else {
      inizio = null;
      fine = null;
    }

    const nelPeriodo = rows.filter((r) => {
      if (inizio === null) return true;
      return r.movimento.data >= inizio && r.movimento.data < fine!;
    });

    const saldoInizio = inizio === null
      ? rows
          .filter((r) => r.movimento.descrizione === "Saldo iniziale")
          .reduce((acc, r) => acc + (r.movimento.tipo === "entrata" ? r.movimento.importo : -r.movimento.importo), 0)
      : rows
          .filter((r) => r.movimento.data < inizio)
          .reduce((acc, r) => acc + (r.movimento.tipo === "entrata" ? r.movimento.importo : -r.movimento.importo), 0);

    const saldoFine = fine === null
      ? rows.reduce((acc, r) => acc + (r.movimento.tipo === "entrata" ? r.movimento.importo : -r.movimento.importo), 0)
      : rows
          .filter((r) => r.movimento.data < fine)
          .reduce((acc, r) => acc + (r.movimento.tipo === "entrata" ? r.movimento.importo : -r.movimento.importo), 0);

    const speseTotali = nelPeriodo
      .filter((r) => r.movimento.tipo === "uscita")
      .reduce((acc, r) => acc + r.movimento.importo, 0);

    return {
      uscite: aggPerCategoria(nelPeriodo.filter((r) => r.movimento.tipo === "uscita")),
      entrate: aggPerCategoria(nelPeriodo.filter((r) => r.movimento.tipo === "entrata")),
      saldoInizio,
      speseTotali,
      saldoFine,
    };
  }, [rows, periodo, anno, mese]);

  if (rows === undefined) {
    return <span className="font-mono text-caption text-disabled">[LOADING...]</span>;
  }

  let label: string | null;
  if (periodo === "mese") label = etichettaMese(anno, mese);
  else if (periodo === "anno") label = String(anno);
  else label = null;

  function onChangePeriodo(p: Periodo) {
    if (p === "tutto") {
      setPeriodo(p);
      return;
    }
    if (periodo === "tutto" && p === "mese") {
      setAnno(now.getFullYear());
      setMese(now.getMonth() + 1);
    }
    setPeriodo(p);
  }

  function prev() {
    if (periodo === "mese") {
      const p = mesePrecedente(anno, mese);
      setAnno(p.anno);
      setMese(p.mese);
    } else if (periodo === "anno") {
      setAnno((a) => a - 1);
    }
  }

  function next() {
    if (periodo === "mese") {
      const p = meseSuccessivo(anno, mese);
      setAnno(p.anno);
      setMese(p.mese);
    } else if (periodo === "anno") {
      setAnno((a) => a + 1);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col items-start gap-4">
        <SegmentedControl
          value={periodo}
          onChange={onChangePeriodo}
          options={[
            { value: "mese" as const, label: "Mese" },
            { value: "tutto" as const, label: "Tutto" },
            { value: "anno" as const, label: "Anno" },
          ]}
        />
        {label !== null ? (
          <div className="flex w-full items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <PeriodNav label={label} onPrev={prev} onNext={next} />
            </div>
            <span className="shrink-0 font-mono text-caption tabular-nums text-secondary">
              {formatEuro(saldoInizio)}
            </span>
          </div>
        ) : null}
      </div>

      <GruppoSezione
        titolo="Uscite"
        gruppi={uscite}
        onApri={setDettaglio}
        speseTotali={speseTotali}
        saldoFine={saldoFine}
        withBorder={false}
      />
      {entrate.length > 0 ? <GruppoSezione titolo="Entrate" gruppi={entrate} onApri={setDettaglio} /> : null}

      <FullScreenSheet
        open={dettaglio !== null}
        onClose={() => setDettaglio(null)}
        title={dettaglio?.nome ?? "Movimenti"}
      >
        {dettaglio ? (
          <div className="flex flex-col">
            <p className="font-display text-display-md leading-none tracking-tight text-display">
              {formatEuro(dettaglio.totale)}
            </p>
            <p className="label mt-2 text-disabled">Totale nel periodo</p>

            <div className="mt-6 flex flex-col">
              {dettaglio.voci.map((v) => (
                <div key={v.movimento.id} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
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

function GruppoSezione({
  titolo,
  gruppi,
  onApri,
  speseTotali,
  saldoFine,
  withBorder = true,
}: {
  titolo: string;
  gruppi: Gruppo[];
  onApri: (g: Gruppo) => void;
  speseTotali?: number;
  saldoFine?: number;
  withBorder?: boolean;
}) {
  const isUscite = speseTotali !== undefined && saldoFine !== undefined;
  return (
    <div className={cn("flex flex-col pt-5", withBorder ? "border-t border-border" : "")}>
      <p className="label text-secondary">{titolo}</p>
      <div className="mt-2 flex flex-col">
        {gruppi.map((g) => (
          <button
            key={g.nome}
            type="button"
            onClick={() => onApri(g)}
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
            <span className="shrink-0 font-mono text-body tabular-nums text-primary">
              {formatEuro(g.totale)}
            </span>
          </button>
        ))}

        {gruppi.length === 0 && !isUscite ? (
          <p className="py-6 text-center font-mono text-caption text-disabled">[NESSUN MOVIMENTO]</p>
        ) : null}

        {isUscite ? (
          <>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-sans text-body font-medium text-primary">Spese totali</span>
              <span className="shrink-0 font-mono text-body tabular-nums text-primary">
                −{formatEuro(speseTotali)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-sans text-body font-medium text-primary">Saldo resto</span>
              <span className="shrink-0 font-mono text-body tabular-nums text-secondary">
                {formatEuro(saldoFine)}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
