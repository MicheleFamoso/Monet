"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getContoRiferimento } from "@/lib/queries";
import { formatEuro } from "@/lib/money";

export function Overview() {
  const riferimento = useLiveQuery(() => getContoRiferimento(), []);

  if (riferimento === undefined) {
    return (
      <section className="dot-grid-subtle mt-4 flex flex-col gap-10 py-14">
        <p className="font-mono text-caption text-disabled">[LOADING...]</p>
      </section>
    );
  }

  const saldo = riferimento?.saldo ?? 0;
  const negativo = saldo < 0;

  return (
    <section className="dot-grid-subtle mt-4 flex flex-col gap-10 py-14">
      <div>
        <p className="label text-secondary">
          {riferimento ? `Saldo · ${riferimento.conto.nome}` : "Saldo"}
        </p>
        <p
          className={`mt-4 font-display text-display-xl leading-none tracking-tight ${
            negativo ? "text-accent" : "text-display"
          }`}
        >
          {formatEuro(saldo)}
        </p>
        <p className="mt-4 font-display font-bold text-display-md leading-none tracking-tight text-accent">
          Spese · {formatEuro(riferimento?.usciteMese ?? 0)}
        </p>
      </div>
    </section>
  );
}