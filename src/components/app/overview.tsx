"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getContoRiferimento } from "@/lib/queries";
import { formatEuro } from "@/lib/money";
import { IconCrescitaDot, IconUsciteDot } from "@/components/ui/icons";

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
        <div
          className={`mt-4 flex items-center gap-4 ${
            negativo ? "text-accent" : "text-display"
          }`}
        >
          <IconCrescitaDot className="h-8 w-8 shrink-0" />
          <p className="font-display text-display-xl leading-none tracking-tight">
            {formatEuro(saldo)}
          </p>
        </div>

        <div className="mt-5 flex flex-col items-end justify-end gap-1 text-accent">
          <p className="label text-accent">Uscite</p>
          <div className="flex items-center gap-2">
            <IconUsciteDot className="h-5 w-5" />
            <p className="font-display text-display-md font-bold leading-none tracking-tight">
              {formatEuro(riferimento?.usciteMese ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}