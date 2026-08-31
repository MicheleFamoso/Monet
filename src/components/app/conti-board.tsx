"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getContiConSaldo } from "@/lib/queries";
import { formatEuro } from "@/lib/money";
import { Card, CardTitle } from "@/components/ui/card";
import { FullScreenSheet } from "@/components/ui/full-screen-sheet";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconEye, IconEyeOff, IconStarDot } from "@/components/ui/icons";
import { MovimentiContoPeriodo } from "./movimenti-conto-periodo";
import { ContoForm, ContoIcona } from "./conto-form";

export function ContiBoard() {
  const conti = useLiveQuery(() => getContiConSaldo(), []);
  const [dettaglioId, setDettaglioId] = useState<number | null>(null);
  const [showModifica, setShowModifica] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null);
  const [nascosto, setNascosto] = useState(false);

  if (conti === undefined) {
    return <span className="font-mono text-caption text-disabled">[LOADING...]</span>;
  }

  async function eliminaConto(id: number) {
    await db.transaction("rw", db.movimento, db.conti, async () => {
      await db.movimento.where("contoId").equals(id).delete();
      await db.conti.delete(id);
    });
  }

  const dettaglioConto = conti.find((c) => c.conto.id === dettaglioId);
  const totale = conti.reduce((acc, c) => acc + c.saldo, 0);
  const negativo = totale < 0;

  return (
    <>
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="label text-secondary">Saldo totale</p>
            <button
              type="button"
              onClick={() => setNascosto((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:text-primary"
              aria-label={nascosto ? "Mostra saldi" : "Nascondi saldi"}
            >
              {nascosto ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
            </button>
          </div>
          <p
            className={`font-display text-display-xl leading-none tracking-tight ${
              nascosto ? "text-display" : negativo ? "text-accent" : "text-display"
            }`}
          >
            {nascosto ? "xx,xx €" : formatEuro(totale)}
          </p>
        </section>

        {conti.map(({ conto, saldo, nMovimenti, entrateMese, usciteMese }) => (
          <button
            key={conto.id}
            type="button"
            onClick={() => setDettaglioId(conto.id!)}
            className="text-left transition-transform duration-200 ease-out-technical active:scale-[0.99]"
          >
            <Card className="flex flex-col gap-4">
              <span className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent" aria-hidden>
                  <ContoIcona id={conto.icona} className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-sans text-body text-primary">{conto.nome}</span>
                    {conto.predefinito === true ? <IconStarDot className="h-4 w-4 shrink-0" /> : null}
                  </span>
                  {conto.descrizione ? (
                    <span className="truncate font-sans text-body-sm text-disabled">{conto.descrizione}</span>
                  ) : null}
                </span>
              </span>

              <span className="flex flex-col gap-3 border-t border-border pt-4">
                <span className="flex items-baseline justify-between gap-4">
                  <span className="label text-secondary">Saldo attuale</span>
                  <span className="font-display text-display-md leading-none tracking-tight text-display">
                    {nascosto ? "xx,xx €" : formatEuro(saldo)}
                  </span>
                </span>

                <span className="flex items-center justify-between gap-4">
                  <span className="label text-secondary">Mese corrente</span>
                  <span className="flex items-center gap-3 font-mono text-body-sm tabular-nums">
                    <span className="text-success">+{formatEuro(entrateMese)}</span>
                    <span className="text-accent">-{formatEuro(usciteMese)}</span>
                  </span>
                </span>

                <span className="flex items-center justify-between gap-4">
                  <span className="label text-disabled">{nMovimenti} movimenti</span>
                  <span className="label text-disabled">Aperto {new Date(conto.createdAt).toLocaleDateString("it-IT")}</span>
                </span>
              </span>
            </Card>
          </button>
        ))}
      </div>

      <FullScreenSheet
        open={dettaglioId !== null}
        onClose={() => setDettaglioId(null)}
        title={dettaglioConto?.conto.nome ?? "Conto"}
      >
        {dettaglioConto ? (
          <div className="flex min-h-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent" aria-hidden>
                  <ContoIcona id={dettaglioConto.conto.icona} className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>{dettaglioConto.conto.nome}</CardTitle>
                  {dettaglioConto.conto.descrizione ? (
                    <p className="mt-1 font-sans text-body-sm text-secondary">{dettaglioConto.conto.descrizione}</p>
                  ) : null}
                </div>
              </div>
              <DropdownMenu
                items={[
                  {
                    label: "Modifica",
                    onClick: () => setShowModifica(true),
                  },
                  {
                    label: "Elimina",
                    destructive: true,
                    onClick: () =>
                      setDeleteTarget({ id: dettaglioConto.conto.id!, nome: dettaglioConto.conto.nome }),
                  },
                ]}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
              <p className="font-display text-display-lg leading-none tracking-tight text-display">
                {formatEuro(dettaglioConto.saldo)}
              </p>
              <p className="label mt-2 text-disabled">Saldo corrente</p>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <CardTitle>Movimenti</CardTitle>
              <MovimentiContoPeriodo contoId={dettaglioConto.conto.id!} className="mt-4" />
            </div>
          </div>
        ) : null}
      </FullScreenSheet>

      <FullScreenSheet
        open={showModifica}
        onClose={() => setShowModifica(false)}
        title="Modifica conto"
      >
        {dettaglioConto ? (
          <ContoForm
            initial={dettaglioConto.conto}
            saldoAttualeCents={dettaglioConto.saldo}
            onSubmitted={() => setShowModifica(false)}
          />
        ) : null}
      </FullScreenSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            eliminaConto(deleteTarget.id);
            if (dettaglioId === deleteTarget.id) setDettaglioId(null);
          }
          setDeleteTarget(null);
        }}
        title="Elimina conto"
        message={deleteTarget ? `Eliminare «${deleteTarget.nome}» e tutti i suoi movimenti?` : ""}
      />
    </>
  );
}
