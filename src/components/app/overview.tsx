"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getContoRiferimento } from "@/lib/queries";
import { formatEuro } from "@/lib/money";
import { Tag } from "@/components/ui/tag";

export function Overview() {
  const riferimento = useLiveQuery(() => getContoRiferimento(), []);

  if (riferimento === undefined) {
    return (
      <section className="dot-grid-subtle mt-14 flex flex-col justify-between gap-10 py-14 md:mt-20 md:flex-row md:py-20">
        <p className="font-mono text-caption text-disabled">[LOADING...]</p>
      </section>
    );
  }

  const saldo = riferimento?.saldo ?? 0;
  const negativo = saldo < 0;

  return (
    <section className="dot-grid-subtle mt-14 flex flex-col justify-between gap-10 py-14 md:mt-20 md:flex-row md:py-20">
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
        <p className="mt-6 max-w-sm font-sans text-body-sm leading-6 text-secondary">
          {riferimento
            ? `Saldo del conto «${riferimento.conto.nome}»: saldo iniziale più ogni entrata meno ogni uscita.`
            : "Nessun conto creato: aggiungi un conto nella sezione Conti."}
        </p>
      </div>
      <div className="flex flex-col items-start gap-3 md:items-end md:text-right">
        <Tag active={!negativo}>{riferimento ? (negativo ? "NEGATIVO" : "BUDGET OK") : "—"}</Tag>
        <span className="label text-disabled">Contabilità locale · IndexedDB</span>
      </div>
    </section>
  );
}