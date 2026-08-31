"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { getBudgetMese } from "@/lib/queries";
import { formatEuro, parseCents } from "@/lib/money";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { SegmentedProgress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FullScreenSheet } from "@/components/ui/full-screen-sheet";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/cn";

const PALETTE = ["#D71921", "#4A9E5C", "#D4A843", "#5B9BF6", "#5F6EF0", "#999999", "#E8E8E8", "#111111"];

export function CategorieBoard() {
  const categorie = useLiveQuery(() => db.categoria.orderBy("nome").toArray(), []);
  const ora = new Date();
  const budget = useLiveQuery(() => getBudgetMese(ora.getFullYear(), ora.getMonth() + 1), []);

  const [nome, setNome] = useState("");
  const [colore, setColore] = useState(PALETTE[5]);
  const [budgetCents, setBudgetCents] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [errore, setErrore] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null);

  if (categorie === undefined || budget === undefined) {
    return <span className="font-mono text-caption text-disabled">[LOADING...]</span>;
  }

  const usatoByCat = new Map(budget.map((b) => [b.id, b.usato]));
  const ordinate = [...categorie].sort(
    (a, b) => (usatoByCat.get(b.id!) ?? 0) - (usatoByCat.get(a.id!) ?? 0),
  );

  function resetForm() {
    setEditing(null);
    setNome("");
    setColore(PALETTE[5]);
    setBudgetCents("");
    setDescrizione("");
    setErrore("");
  }

  function iniziaModifica(id: number) {
    const c = categorie?.find((x) => x.id === id);
    if (!c) return;
    setEditing(id);
    setNome(c.nome);
    setColore(c.colore);
    setBudgetCents((c.budgetMensile / 100).toLocaleString("it-IT", { minimumFractionDigits: 2 }));
    setDescrizione(c.descrizione ?? "");
    setErrore("");
    setShowModal(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cents = parseCents(budgetCents);
    if (!nome.trim() || cents === null) {
      setErrore("nome e budget mensile obbligatori");
      return;
    }
    const payload = {
      nome: nome.trim(),
      colore,
      budgetMensile: cents,
      descrizione: descrizione.trim() || undefined,
    };
    if (editing !== null) {
      await db.categoria.update(editing, payload);
    } else {
      await db.categoria.add(payload);
    }
    resetForm();
    setShowModal(false);
  }

  async function elimina(id: number) {
    await db.transaction("rw", db.movimento, db.categoria, async () => {
      const movs = await db.movimento.where("categoriaId").equals(id).toArray();
      for (const m of movs) await db.movimento.update(m.id!, { categoriaId: undefined });
      await db.categoria.delete(id);
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {ordinate.map((c) => {
          const usato = usatoByCat.get(c.id!) ?? 0;
          const ratio = c.budgetMensile > 0 ? usato / c.budgetMensile : 0;
          const status =
            ratio > 1 ? "neutral" : ratio >= 0.75 ? "warning" : ratio > 0 ? "good" : "neutral";

          return (
            <Card key={c.id}>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.colore }} aria-hidden />
                  <CardTitle>{c.nome}</CardTitle>
                </span>
                <DropdownMenu
                  items={[
                    { label: "Modifica", onClick: () => iniziaModifica(c.id!) },
                    { label: "Elimina", destructive: true, onClick: () => setDeleteTarget({ id: c.id!, nome: c.nome }) },
                  ]}
                />
              </div>
              {c.descrizione ? (
                <p className="mt-3 font-sans text-body-sm leading-6 text-secondary">{c.descrizione}</p>
              ) : null}
              <SegmentedProgress
                size="standard"
                label="Mese corrente"
                value={formatEuro(usato)}
                valueLabel={`di ${formatEuro(c.budgetMensile)}`}
                ratio={ratio}
                status={status}
                className="mt-6"
              />
            </Card>
          );
        })}
      </div>

      <FullScreenSheet
        open={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title="Modifica categoria"
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Nome" error={errore.includes("nome") ? errore : undefined}>
              <Input value={nome} invalid={errore.includes("nome")} onChange={(e) => setNome(e.target.value)} placeholder="Es. Bar e ristoranti" />
            </Field>
            <Field label="Budget mensile" hint="€" error={errore.includes("budget") ? errore : undefined}>
              <Input inputMode="decimal" value={budgetCents} invalid={errore.includes("budget")} onChange={(e) => setBudgetCents(e.target.value)} placeholder="0,00" />
            </Field>
          </div>
          <Field label="Colore">
            <div className="flex flex-wrap gap-2 pt-1">
              {PALETTE.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-label={`Colore ${p}`}
                  onClick={() => setColore(p)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-transform",
                    colore === p ? "scale-110 ring-2 ring-accent ring-offset-2 ring-offset-surface" : "opacity-80 hover:opacity-100",
                  )}
                  style={{ backgroundColor: p }}
                />
              ))}
            </div>
          </Field>
          <Field label="Descrizione" hint="facoltativa">
            <Input value={descrizione} onChange={(e) => setDescrizione(e.target.value)} placeholder="A cosa serve" />
          </Field>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary">
              {editing !== null ? "Salva" : "Aggiungi"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setShowModal(false); resetForm(); }}>
              Annulla
            </Button>
          </div>
        </form>
      </FullScreenSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) elimina(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Elimina categoria"
        message={deleteTarget ? `Eliminare «${deleteTarget.nome}»? I movimenti resteranno senza categoria.` : ""}
      />
    </>
  );
}
