"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

function initialDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export default function ImpostazioniPage() {
  const [dark, setDark] = useState<boolean>(initialDark);

  const [nConti, nCategorie, nMovimenti] = useLiveQuery(
    async () => {
      const [c, cat, m] = await Promise.all([
        db.conti.count(),
        db.categoria.count(),
        db.movimento.count(),
      ]);
      return [c, cat, m];
    },
    [],
    [0, 0, 0],
  );

  function cambiaTema(checked: boolean) {
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    try {
      localStorage.setItem("moneta-theme", checked ? "dark" : "light");
    } catch {
      /* noop */
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-5 pb-32 pt-8">
      <header>
        <p className="label text-secondary">Contabilità · impostazioni</p>
        <h1 className="mt-3 font-display text-display-lg leading-none tracking-tight text-display">
          Impostazioni
        </h1>
      </header>

      <Card>
        <CardTitle>Aspetto</CardTitle>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-sans text-body text-primary">Tema scuro</p>
            <p className="label mt-1 text-disabled">Interfaccia in modalità notte</p>
          </div>
          <Toggle checked={dark} onCheckedChange={cambiaTema} />
        </div>
      </Card>

      <Card>
        <CardTitle>Dati</CardTitle>
        <div className="mt-4 flex flex-col divide-y divide-border">
          <Row label="Conti" value={String(nConti)} />
          <Row label="Categorie" value={String(nCategorie)} />
          <Row label="Movimenti" value={String(nMovimenti)} />
        </div>
        <p className="label mt-5 text-disabled">
          Tutti i dati sono salvati solo su questo browser (IndexedDB) e non vengono inviati a nessun server.
        </p>
      </Card>

      <p className="label text-center text-disabled">Moneta · contabilità locale</p>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="label text-secondary">{label}</span>
      <span className="font-mono text-body tabular-nums text-primary">{value}</span>
    </div>
  );
}
