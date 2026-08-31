"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { parseCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { FullScreenSheet } from "@/components/ui/full-screen-sheet";
import { cn } from "@/lib/cn";
import { MovimentiForm } from "./movimenti-form";
import { ContoForm } from "./conto-form";

const PALETTE = ["#D71921", "#4A9E5C", "#D4A843", "#5B9BF6", "#5F6EF0", "#999999", "#E8E8E8", "#111111"];

export type Azione = "movimento" | "conto" | "categoria";

interface AggiungiSheetProps {
  open: boolean;
  onClose: () => void;
  azione: Azione;
}

export function AggiungiSheet({ open, onClose, azione }: AggiungiSheetProps) {
  return (
    <FullScreenSheet
      open={open}
      onClose={onClose}
      title={azione === "movimento" ? "Nuovo movimento" : azione === "conto" ? "Nuovo conto" : "Nuova categoria"}
    >
      {azione === "movimento" ? <MovimentiForm className="flex flex-col gap-5" onSubmitted={onClose} /> : null}
      {azione === "conto" ? <ContoForm onSubmitted={onClose} /> : null}
      {azione === "categoria" ? <CategoriaForm onSubmitted={onClose} /> : null}
    </FullScreenSheet>
  );
}

function CategoriaForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [nome, setNome] = useState("");
  const [colore, setColore] = useState(PALETTE[5]);
  const [budgetCents, setBudgetCents] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [errore, setErrore] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cents = parseCents(budgetCents);
    if (!nome.trim() || cents === null) {
      setErrore("nome e budget mensile obbligatori");
      return;
    }
    await db.categoria.add({
      nome: nome.trim(),
      colore,
      budgetMensile: cents,
      descrizione: descrizione.trim() || undefined,
    });
    onSubmitted();
  }

  return (
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
      <Button type="submit" variant="primary" className="self-start">
        Aggiungi
      </Button>
    </form>
  );
}
