"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  etichettaMese,
  getBudgetMese,
  mesePrecedente,
  meseSuccessivo,
} from "@/lib/queries";
import { formatEuroCompact } from "@/lib/money";
import { Card, CardTitle } from "@/components/ui/card";
import { PeriodNav } from "@/components/ui/period-nav";
import { SegmentedProgress } from "@/components/ui/progress";

export function BudgetMese() {
  const ora = new Date();
  const [anno, setAnno] = useState(ora.getFullYear());
  const [mese, setMese] = useState(ora.getMonth() + 1);
  const items = useLiveQuery(() => getBudgetMese(anno, mese), [anno, mese]);

  const vaiAvanti = () => {
    const p = meseSuccessivo(anno, mese);
    setAnno(p.anno);
    setMese(p.mese);
  };
  const vaiIndietro = () => {
    const p = mesePrecedente(anno, mese);
    setAnno(p.anno);
    setMese(p.mese);
  };

  if (items === undefined) {
    return <span className="font-mono text-caption text-disabled">[LOADING...]</span>;
  }

  const visibili = items.filter((i) => i.budget > 0 || i.usato > 0);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <CardTitle>Budget per categoria</CardTitle>
        <PeriodNav label={etichettaMese(anno, mese)} onPrev={vaiIndietro} onNext={vaiAvanti} />
      </div>
      <div className="mt-8 flex flex-1 flex-col justify-center gap-7">
        {visibili.map((item) => {
          const ratio = item.budget > 0 ? item.usato / item.budget : 0;
          const status =
            ratio > 1 ? "neutral" : ratio >= 0.75 ? "warning" : ratio > 0 ? "good" : "neutral";
          return (
            <div key={item.id} className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.colore }}
                aria-hidden
              />
              <SegmentedProgress
                size="standard"
                label={item.nome}
                value={`€ ${formatEuroCompact(item.usato)}`}
                valueLabel={`di € ${formatEuroCompact(item.budget)}`}
                ratio={ratio}
                status={status}
                className="flex-1"
              />
            </div>
          );
        })}
        {visibili.length === 0 ? (
          <p className="py-8 text-center font-mono text-caption text-disabled">
            [NESSUN MOVIMENTO NEL MESE]
          </p>
        ) : null}
      </div>
    </Card>
  );
}