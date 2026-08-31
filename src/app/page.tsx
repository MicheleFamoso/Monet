import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/app/overview";
import { RiepilogoMese } from "@/components/app/riepilogo-mese";
import { BudgetMese } from "@/components/app/budget-mese";
import { AndamentoAnnuo } from "@/components/app/andamento-annuo";
import { MovimentiRecenti } from "@/components/app/movimenti-recenti";
import { MovimentiForm } from "@/components/app/movimenti-form";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-5 pb-32 pt-8">
      <Overview />

      <RiepilogoMese />

      <BudgetMese />

      <Card>
        <CardTitle>Nuovo movimento</CardTitle>
        <MovimentiForm className="mt-5" />
      </Card>

      <AndamentoAnnuo />

      <Card>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Movimenti recenti</CardTitle>
          <Link
            href="/conti"
            className="font-mono text-label uppercase tracking-[0.08em] text-secondary transition-colors hover:text-primary"
          >
            Vai ai conti →
          </Link>
        </div>
        <div className="mt-5">
          <MovimentiRecenti limit={10} />
        </div>
      </Card>
    </main>
  );
}