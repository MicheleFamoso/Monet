"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  getContiConSaldo,
  getMovimentiConto,
  aggPerCategoria,
  etichettaMese,
  etichettaGiorno,
  mesePrecedente,
  meseSuccessivo,
  giornoPrecedente,
  giornoSuccessivo,
  type MovimentoConCategoria,
} from "@/lib/queries";
import { formatEuro } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { FullScreenSheet } from "@/components/ui/full-screen-sheet";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PeriodNav } from "@/components/ui/period-nav";
import { IconSwap, IconStarDot } from "@/components/ui/icons";
import { ContoIcona } from "./conto-form";
import { RiepilogoPeriodo, type Settimana } from "./riepilogo-periodo";

type Vista = "mese" | "oggi";

export function Overview() {
  const conti = useLiveQuery(() => getContiConSaldo(), []);
  const [contoSelezionatoId, setContoSelezionatoId] = useState<number | null>(null);
  const [sheetConti, setSheetConti] = useState(false);

  const now = new Date();
  const [vista, setVista] = useState<Vista>("mese");
  const [anno, setAnno] = useState(now.getFullYear());
  const [mese, setMese] = useState(now.getMonth() + 1);
  const [giorno, setGiorno] = useState(now.toISOString().slice(0, 10));

  const riferimento =
    conti?.find((c) => c.conto.id === contoSelezionatoId) ??
    conti?.find((c) => c.conto.predefinito === true) ??
    conti?.[0] ??
    null;

  const movimentiConto = useLiveQuery(
    () => (riferimento ? getMovimentiConto(riferimento.conto.id!) : Promise.resolve(null)),
    [riferimento?.conto.id],
  );

  const oggi = now.toISOString().slice(0, 10);

  const { saldo, spese, settimane, vociGiorno } = useMemo(() => {
    const movimenti = movimentiConto ?? [];
    if (vista === "mese") {
      const inizioMese = `${anno}-${String(mese).padStart(2, "0")}-01`;
      const p = meseSuccessivo(anno, mese);
      const inizioMeseSucc = `${p.anno}-${String(p.mese).padStart(2, "0")}-01`;

      const saldo = movimenti
        .filter((r) => r.movimento.data < inizioMeseSucc)
        .reduce((acc, r) => acc + (r.movimento.tipo === "entrata" ? r.movimento.importo : -r.movimento.importo), 0);

      const delMese = movimenti.filter(
        (r) => r.movimento.data >= inizioMese && r.movimento.data < inizioMeseSucc,
      );

      const spese = delMese
        .filter((r) => r.movimento.tipo === "uscita")
        .reduce((acc, r) => acc + r.movimento.importo, 0);

      const settimane = divideInSettimane(delMese, anno, mese, oggi);

      return { saldo, spese, settimane, vociGiorno: [] as typeof vociGiorno };
    }

    const saldoGiorno = movimenti
      .filter((r) => r.movimento.data <= giorno)
      .reduce((acc, r) => acc + (r.movimento.tipo === "entrata" ? r.movimento.importo : -r.movimento.importo), 0);

    const vociGiorno = movimenti.filter((r) => r.movimento.data === giorno);
    const spese = vociGiorno
      .filter((r) => r.movimento.tipo === "uscita")
      .reduce((acc, r) => acc + r.movimento.importo, 0);

    return { saldo: saldoGiorno, spese, settimane: [] as Settimana[], vociGiorno };
  }, [movimentiConto, vista, anno, mese, giorno, oggi]);

  const negativo = saldo < 0;

  const label = vista === "mese" ? etichettaMese(anno, mese) : etichettaGiorno(giorno);

  function prev() {
    if (vista === "mese") {
      const p = mesePrecedente(anno, mese);
      setAnno(p.anno);
      setMese(p.mese);
    } else {
      setGiorno((g) => giornoPrecedente(g));
    }
  }

  function next() {
    if (vista === "mese") {
      const p = meseSuccessivo(anno, mese);
      setAnno(p.anno);
      setMese(p.mese);
    } else {
      setGiorno((g) => giornoSuccessivo(g));
    }
  }

  if (conti === undefined) {
    return (
      <section className="mt-4 flex flex-col gap-10 py-14">
        <p className="font-mono text-caption text-disabled">[LOADING...]</p>
      </section>
    );
  }

  return (
    <section className="mt-4 flex flex-col gap-10 py-14">
      <div>
        <Card className="dot-grid-subtle">
          <div className="flex w-full items-center justify-between gap-3">
            <h2 className="min-w-0 truncate font-display text-heading font-bold leading-none tracking-tight text-display">
              {riferimento?.conto.nome ?? "Moneta"}
            </h2>
            {conti.length > 1 ? (
              <button
                type="button"
                onClick={() => setSheetConti(true)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-secondary transition-colors hover:text-primary"
                aria-label="Cambia conto"
              >
                <IconSwap className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          <div className="mt-6">
            <p className="label text-secondary">Saldo</p>
            <p
              className={`mt-1 font-sans text-display-md font-bold leading-none tabular-nums tracking-tight ${
                negativo ? "text-accent" : "text-display"
              }`}
            >
              {formatEuro(saldo)}
            </p>
          </div>

          <div className="mt-6 flex flex-col items-end justify-end gap-1 text-accent">
            <p className="label text-accent">Uscite</p>
            <p className="font-sans text-heading font-bold leading-none tabular-nums tracking-tight">
              {formatEuro(spese)}
            </p>
          </div>
        </Card>

        <div className="mt-8 flex flex-col items-start gap-4">
          <SegmentedControl
            value={vista}
            onChange={setVista}
            options={[
              { value: "mese" as const, label: "Mese" },
              { value: "oggi" as const, label: "Oggi" },
            ]}
          />
          <div className="w-full">
            <PeriodNav label={label} onPrev={prev} onNext={next} />
          </div>
        </div>

        <div className="mt-4">
          <RiepilogoPeriodo vista={vista} settimane={settimane} vociGiorno={vociGiorno} />
        </div>
      </div>

      <FullScreenSheet open={sheetConti} onClose={() => setSheetConti(false)} title="Cambia conto">
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
                    setSheetConti(false);
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
                  {attivo ? <span className="label text-accent">Attivo</span> : null}
                </button>
              );
            })}
          </div>
        )}
      </FullScreenSheet>
    </section>
  );
}

function divideInSettimane(
  movimenti: MovimentoConCategoria[],
  anno: number,
  mese: number,
  oggi: string,
): Settimana[] {
  const primoDelMese = new Date(anno, mese - 1, 1);
  let lunedi = (primoDelMese.getDay() + 6) % 7;
  const giorniMese = new Date(anno, mese, 0).getDate();

  const prese: Settimana[] = [];
  let num = 1;
  let giornoInizio = 1;
  while (giornoInizio <= giorniMese) {
    const giornoFine = Math.min(giornoInizio + (6 - lunedi), giorniMese);
    const inizio = `${anno}-${String(mese).padStart(2, "0")}-${String(giornoInizio).padStart(2, "0")}`;

    const voci = movimenti.filter((r) => {
      const g = Number(r.movimento.data.slice(8, 10));
      return g >= giornoInizio && g <= giornoFine;
    });

    const movimentiSettimana = aggPerCategoria(voci);
    const spese = voci
      .filter((r) => r.movimento.tipo === "uscita")
      .reduce((acc, r) => acc + r.movimento.importo, 0);
    if (movimentiSettimana.length > 0 || inizio <= oggi) {
      prese.push({
        label: `${num}ª settimana`,
        range: `${String(giornoInizio).padStart(2, "0")}–${String(giornoFine).padStart(2, "0")} ${MESI_IT_SHORT[mese - 1]} ${anno}`,
        spese,
        movimenti: movimentiSettimana,
      });
    }

    num++;
    giornoInizio = giornoFine + 1;
    lunedi = 0;
  }
  return prese.reverse();
}

const MESI_IT_SHORT = [
  "GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC",
];
