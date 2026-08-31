"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getAndamentoMesi } from "@/lib/queries";
import { formatEuro } from "@/lib/money";
import { Card, CardTitle } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Sparkline } from "@/components/ui/charts";
import { StatRow } from "@/components/ui/stat-row";

type Periodo = "mese" | "trim" | "anno";

const finestra: Record<Periodo, number> = { mese: 1, trim: 3, anno: 12 };

export function RiepilogoMese() {
  const [periodo, setPeriodo] = useState<Periodo>("mese");
  const mesi = useLiveQuery(() => getAndamentoMesi(12), []);

  if (mesi === undefined) {
    return <span className="font-mono text-caption text-disabled">[LOADING...]</span>;
  }

  const n = finestra[periodo];
  const slice = mesi.slice(-n);
  const entrate = slice.reduce((acc, m) => acc + m.entrate, 0);
  const uscite = slice.reduce((acc, m) => acc + m.uscite, 0);
  const risparmio = entrate - uscite;
  const trend = mesi.slice(-6).map((m) => m.entrate);

  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CardTitle>Riepilogo</CardTitle>
        <SegmentedControl
          value={periodo}
          onChange={setPeriodo}
          options={[
            { value: "mese" as const, label: "Mese" },
            { value: "trim" as const, label: "Trim" },
            { value: "anno" as const, label: "Anno" },
          ]}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <StatRow label="Entrate" value={formatEuro(entrate)} status="good" trend="+" />
          <StatRow
            label="Uscite"
            value={formatEuro(uscite)}
            status={risparmio < 0 ? "accent" : "neutral"}
            trend="−"
          />
          <StatRow
            label="Risparmio"
            value={formatEuro(risparmio)}
            status={risparmio >= 0 ? "good" : "accent"}
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="label text-disabled">Entrate · 6 mesi</p>
          <Sparkline data={trend} className="mt-4 w-full" width={320} height={64} />
        </div>
      </div>
    </Card>
  );
}