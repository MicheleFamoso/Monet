import { Card, CardTitle } from "@/components/ui/card";

export default function ResocontiPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-5 pb-32 pt-8">
      <header>
        <p className="label text-secondary">Contabilità · resoconti</p>
        <h1 className="mt-3 font-display text-display-lg leading-none tracking-tight text-display">
          Resoconti
        </h1>
      </header>

      <Card>
        <CardTitle>In arrivo</CardTitle>
        <p className="mt-4 font-sans text-body-sm leading-6 text-secondary">
          Qui appariranno i grafici e le statistiche sui tuoi movimenti: andamento mensile,
          confronto entrate/uscite, distribuzione per categoria e altro.
        </p>
      </Card>
    </main>
  );
}
