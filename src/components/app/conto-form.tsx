"use client";

import { useState } from "react";
import { db, type Conto } from "@/lib/db";
import { parseCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/cn";
import { ICONE_CONTO, ICONA_BY_ID, ICONA_DEFAULT } from "@/lib/icona-conto";

interface ContoFormProps {
  initial?: Conto;
  saldoAttualeCents?: number;
  onSubmitted: () => void;
  onClose?: () => void;
}

export function ContoForm({ initial, saldoAttualeCents, onSubmitted, onClose }: ContoFormProps) {
  const isEdit = Boolean(initial);
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [icona, setIcona] = useState(initial?.icona ?? ICONA_DEFAULT);
  const [descrizione, setDescrizione] = useState(initial?.descrizione ?? "");
  const [predefinito, setPredefinito] = useState(initial?.predefinito === true);
  const [saldoIniziale, setSaldoIniziale] = useState("");
  const [saldo, setSaldo] = useState(() =>
    saldoAttualeCents != null ? (saldoAttualeCents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [errore, setErrore] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErrore("nome obbligatorio");
      return;
    }
    const payload = {
      nome: nome.trim(),
      icona,
      descrizione: descrizione.trim() || undefined,
      predefinito,
    };

    if (isEdit && initial!.id != null) {
      const saldoDesiderato = parseCents(saldo);
      if (saldoDesiderato === null) {
        setErrore("saldo non valido");
        return;
      }
      const contoId = initial!.id;
      try {
        await db.transaction("rw", db.conti, db.movimento, db.categoria, async () => {
        if (predefinito) {
          await db.conti.filter((c) => c.predefinito === true).modify({ predefinito: false });
        }
        await db.conti.update(contoId, payload);

        const movimenti = await db.movimento.where("contoId").equals(contoId).toArray();
        const saldoReale = movimenti.reduce(
          (acc, m) => acc + (m.tipo === "entrata" ? m.importo : -m.importo),
          0,
        );
        if (saldoReale !== saldoDesiderato) {
          await db.movimento.where("contoId").equals(contoId).filter((m) => m.descrizione === "Rettifica saldo").delete();
          const delta = saldoDesiderato - saldoReale;
          const categoriaAltro = await db.categoria.where("nome").equals("Altro").first();
          await db.movimento.add({
            contoId,
            categoriaId: categoriaAltro?.id,
            data: new Date().toISOString().slice(0, 10),
            importo: Math.abs(delta),
            descrizione: "Rettifica saldo",
            tipo: delta > 0 ? "entrata" : "uscita",
          });
        }
      });
      onSubmitted();
      } catch (err) {
        console.error(err);
        setErrore("salvataggio non riuscito");
      }
      return;
    }

    const cents = parseCents(saldoIniziale);
    if (cents === null) {
      setErrore("saldo iniziale non valido");
      return;
    }
    const categoriaAltro = await db.categoria.where("nome").equals("Altro").first();
    await db.transaction("rw", db.conti, db.movimento, async () => {
      if (predefinito) {
        await db.conti.filter((c) => c.predefinito === true).modify({ predefinito: false });
      }
      const id = (await db.conti.add({ ...payload, createdAt: Date.now() }))!;
      if (cents > 0) {
        await db.movimento.add({
          contoId: id,
          categoriaId: categoriaAltro?.id,
          data: new Date().toISOString().slice(0, 10),
          importo: cents,
          descrizione: "Saldo iniziale",
          tipo: "entrata",
        });
      }
    });
    onSubmitted();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Nome" error={errore.includes("nome") ? errore : undefined}>
        <Input value={nome} invalid={errore.includes("nome")} onChange={(e) => setNome(e.target.value)} placeholder="Es. Carta di credito" />
      </Field>

      {isEdit ? (
        <Field label="Saldo" hint="correzione manuale" error={errore.includes("saldo") ? errore : undefined}>
          <Input inputMode="decimal" value={saldo} invalid={errore.includes("saldo")} onChange={(e) => setSaldo(e.target.value)} placeholder="0,00" />
        </Field>
      ) : (
        <Field label="Saldo iniziale" error={errore.includes("saldo") ? errore : undefined}>
          <Input inputMode="decimal" value={saldoIniziale} invalid={errore.includes("saldo")} onChange={(e) => setSaldoIniziale(e.target.value)} placeholder="0,00" />
        </Field>
      )}

      <Field label="Icona">
        <div className="flex flex-wrap gap-2 pt-1">
          {ICONE_CONTO.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={`Icona ${label}`}
              onClick={() => setIcona(id)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                icona === id
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border-visible text-secondary hover:border-display hover:text-display",
              )}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </Field>

      <Field label="Descrizione" hint="facoltativa">
        <Input value={descrizione} onChange={(e) => setDescrizione(e.target.value)} placeholder="Es. Conto dello stipendio" />
      </Field>

      <Toggle
        checked={predefinito}
        onCheckedChange={setPredefinito}
        label="Conto predefinito"
      />

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary">
          {isEdit ? "Salva" : "Aggiungi conto"}
        </Button>
        {onClose ? (
          <Button type="button" variant="ghost" onClick={onClose}>
            Annulla
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function ContoIcona({ id, className }: { id?: string; className?: string }) {
  const Icon = ICONA_BY_ID[id ?? ICONA_DEFAULT] ?? ICONE_CONTO[0].Icon;
  return <Icon className={className} />;
}
