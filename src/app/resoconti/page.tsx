"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { RiepilogoMese } from "@/components/app/riepilogo-mese";
import { BudgetMese } from "@/components/app/budget-mese";
import { AndamentoAnnuo } from "@/components/app/andamento-annuo";
import { MovimentiRecenti } from "@/components/app/movimenti-recenti";

export default function ResocontiPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-5 pb-32 pt-8">
      <header>
        <p className="label text-secondary">Contabilità · resoconti</p>
        <h1 className="mt-3 font-display text-display-lg leading-none tracking-tight text-display">
          Resoconti
        </h1>
      </header>

      <RiepilogoMese />

      <BudgetMese />

      <AndamentoAnnuo />

      <Card>
        <CardTitle>Movimenti recenti</CardTitle>
        <div className="mt-5">
          <MovimentiRecenti limit={10} />
        </div>
      </Card>
    </main>
  );
}
