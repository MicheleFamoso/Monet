"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getAndamentoMesi } from "@/lib/queries";
import { Card, CardTitle } from "@/components/ui/card";
import { Bars } from "@/components/ui/charts";

export function AndamentoAnnuo() {
  const mesi = useLiveQuery(() => getAndamentoMesi(12), []);
  const anni = new Set((mesi ?? []).map((m) => m.key.slice(0, 4)));
  const anniLabel = [...anni].join(" / ");

  if (mesi === undefined) {
    return <span className="font-mono text-caption text-disabled">[LOADING...]</span>;
  }

  const entrate = mesi.map((m) => m.entrate);

  return (
    <Card>
      <CardTitle>Entrate · 12 mesi{anniLabel ? ` · ${anniLabel}` : ""}</CardTitle>
      <Bars data={entrate} height={140} className="mt-8" />
      <div className="mt-3 flex justify-between font-mono text-caption text-disabled">
        <span>{mesi[0]?.key.slice(2)}</span>
        <span>{mesi[Math.floor(mesi.length / 2)]?.key.slice(2)}</span>
        <span>{mesi[mesi.length - 1]?.key.slice(2)}</span>
      </div>
    </Card>
  );
}