"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PeriodNav } from "@/components/ui/period-nav";
import { IconSwap, IconStarDot } from "@/components/ui/icons";
import { ContoIcona } from "./conto-form";
import { RiepilogoPeriodo, type Settimana } from "./riepilogo-periodo";

type Vista = "mese" | "oggi";
type Tipo = "uscita" | "entrata";

export function Overview() {
  const conti = useLiveQuery(() => getContiConSaldo(), []);
  const [contoSelezionatoId, setContoSelezionatoId] = useState<number | null>(null);
  const [contiAperti, setContiAperti] = useState(false);
  const [compatto, setCompatto] = useState(false);

  const now = new Date();
  const [vista, setVista] = useState<Vista>("mese");
  const [tipo, setTipo] = useState<Tipo>("uscita");
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

      const settimane = divideInSettimane(delMese, anno, mese, oggi, tipo);

      return { saldo, spese, settimane, vociGiorno: [] as typeof vociGiorno };
    }

    const saldoGiorno = movimenti
      .filter((r) => r.movimento.data <= giorno)
      .reduce((acc, r) => acc + (r.movimento.tipo === "entrata" ? r.movimento.importo : -r.movimento.importo), 0);

    const vociGiorno = movimenti.filter(
      (r) => r.movimento.data === giorno && r.movimento.tipo === tipo,
    );
    const spese = movimenti
      .filter((r) => r.movimento.data === giorno && r.movimento.tipo === "uscita")
      .reduce((acc, r) => acc + r.movimento.importo, 0);

    return { saldo: saldoGiorno, spese, settimane: [] as Settimana[], vociGiorno };
  }, [movimentiConto, vista, anno, mese, giorno, oggi, tipo]);

  const negativo = saldo < 0;

  const saldoRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const compattoRef = useRef<HTMLDivElement>(null);
  const [altezzaCard, setAltezzaCard] = useState(0);
  const [altezzaCompatto, setAltezzaCompatto] = useState(0);

  const nonMisurata = altezzaCard === 0;

  useEffect(() => {
    if (compattoRef.current) {
      setAltezzaCompatto(compattoRef.current.offsetHeight);
    }
  });

  useEffect(() => {
    if (saldoRef.current) {
      setAltezzaCard(saldoRef.current.offsetHeight);
    }
  }, [nonMisurata, saldo, spese]);

  useEffect(() => {
    const onScroll = () => {
      const node = cardRef.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top;
      setCompatto((prev) => {
        if (!prev && top <= -60) return true;
        if (prev && top > 12) return false;
        return prev;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
      <section className="flex flex-col gap-10">
        <p className="font-mono text-caption text-disabled">[LOADING...]</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-10">
      <div>
        <div ref={cardRef} className="-mx-5 sticky top-0 z-30 bg-[var(--black)] px-5 pt-5">
        <Card
          className="dot-grid-subtle transition-[min-height] duration-300 ease-out"
          style={{
            minHeight: (compatto
              ? altezzaCompatto
              : altezzaCard),
          }}
        >
          <div
            ref={saldoRef}
            className="pointer-events-none absolute left-0 right-0 opacity-0"
            aria-hidden
          >
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
          </div>
          <button
            type="button"
            onClick={() => setContiAperti((a) => !a)}
            aria-expanded={contiAperti}
            className="flex w-full items-center justify-between gap-3 rounded-xl text-left transition-colors hover:bg-surface-raised/50"
          >
            <span className="flex min-w-0 items-center justify-start gap-3">
              <ContoIcona
                id={riferimento?.conto.icona}
                className={`shrink-0 text-secondary transition-all duration-300 ${compatto ? "h-5 w-5" : "h-7 w-7"}`}
              />
              <span
                className={`min-w-0 truncate font-display font-bold leading-none tracking-tight text-display transition-all duration-300 ${
                  compatto ? "text-body" : "text-heading"
                }`}
              >
                {contiAperti ? "Scegli conto" : (riferimento?.conto.nome ?? "Moneta")}
              </span>
            </span>
            {conti.length > 1 ? (
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-secondary">
                <IconSwap
                  className={`h-5 w-5 transition-transform duration-300 ${contiAperti ? "rotate-90" : ""}`}
                />
              </span>
            ) : null}
          </button>

          {compatto && !contiAperti ? (
            <div ref={compattoRef} className="mt-0.5 flex items-end justify-end gap-4">
              <div className="flex flex-col items-end leading-none">
                <p className="label text-accent">Uscite</p>
                <p className="font-sans text-caption tabular-nums text-accent">
                  {formatEuro(spese)}
                </p>
              </div>
              <div className={`flex flex-col items-end leading-none ${negativo ? "text-accent" : "text-display"}`}>
                <p className="label text-secondary">Saldo</p>
                <p className="font-sans text-caption tabular-nums">
                  {formatEuro(saldo)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="relative">
          <div key={contiAperti ? "lista" : "saldo"} className="card-content-in">
          {contiAperti ? (
            <div className="mt-6 flex flex-col gap-2">
              {conti.map(({ conto, saldo: saldoConto }) => {
                const attivo = conto.id === riferimento?.conto.id;
                return (
                  <button
                    key={conto.id}
                    type="button"
                    onClick={() => {
                      setContoSelezionatoId(conto.id!);
                      setContiAperti(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl bg-surface-raised px-4 py-3 text-left transition-colors active:bg-surface"
                  >
                    <ContoIcona id={conto.icona} className="h-7 w-7 shrink-0 text-secondary" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-display text-body font-bold leading-none text-primary">{conto.nome}</span>
                        {conto.predefinito === true ? <IconStarDot className="h-4 w-4 shrink-0" /> : null}
                      </span>
                      {attivo ? <span className="mt-0.5 label text-accent">Attivo</span> : null}
                    </span>
                    <span className="ml-auto shrink-0 font-sans text-body-sm tabular-nums text-secondary">
                      {formatEuro(saldoConto)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : !compatto ? (
            <>
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
            </>
          ) : null}
          </div>
          </div>
        </Card>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <SegmentedControl
              value={vista}
              onChange={setVista}
              options={[
                { value: "mese" as const, label: "Mese" },
                { value: "oggi" as const, label: "Oggi" },
              ]}
            />
            <SegmentedControl
              value={tipo}
              onChange={setTipo}
              options={[
                { value: "uscita" as const, label: "Uscite" },
                { value: "entrata" as const, label: "Entrate" },
              ]}
            />
          </div>
          <div className="w-full">
            <PeriodNav label={label} onPrev={prev} onNext={next} />
          </div>
        </div>
        </div>

        <div className="mt-4">
          <RiepilogoPeriodo vista={vista} tipo={tipo} settimane={settimane} vociGiorno={vociGiorno} />
        </div>
      </div>
    </section>
  );
}

function divideInSettimane(
  movimenti: MovimentoConCategoria[],
  anno: number,
  mese: number,
  oggi: string,
  tipo: Tipo,
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
      return g >= giornoInizio && g <= giornoFine && r.movimento.tipo === tipo;
    });

    const movimentiSettimana = aggPerCategoria(voci);
    const totale = voci.reduce((acc, r) => acc + r.movimento.importo, 0);
    if (movimentiSettimana.length > 0 || inizio <= oggi) {
      prese.push({
        label: `${num}ª S.`,
        range: `${String(giornoInizio).padStart(2, "0")}–${String(giornoFine).padStart(2, "0")} ${MESI_IT_SHORT[mese - 1]}`,
        totale,
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
