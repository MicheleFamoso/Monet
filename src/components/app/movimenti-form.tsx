"use client";

import { useState } from "react";
import { db, type TipoMovimento } from "@/lib/db";
import { parseCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { useLiveQuery } from "dexie-react-hooks";
import { cn } from "@/lib/cn";

interface MovimentiFormProps {
  contoId?: number;
  className?: string;
  onSubmitted?: () => void;
}

export function MovimentiForm({ contoId, className, onSubmitted }: MovimentiFormProps) {
  const conti = useLiveQuery(() => db.conti.orderBy("nome").toArray(), []);
  const categorie = useLiveQuery(() => db.categoria.orderBy("nome").toArray(), []);

  const [tipo, setTipo] = useState<TipoMovimento>("uscita");
  const [sceltoConto, setSceltoConto] = useState<number | "">("");
  const [categoria, setCategoria] = useState<number | "">("");
  const [descrizione, setDescrizione] = useState("");
  const [importo, setImporto] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [errore, setErrore] = useState("");

  if (conti === undefined || categorie === undefined) {
    return <span className="font-mono text-caption text-disabled">[LOADING...]</span>;
  }

  const contoPreselezionato = conti.find((c) => c.predefinito === true) ?? conti[0];
  const idConto = contoId ?? (sceltoConto === "" ? (contoPreselezionato?.id ?? "") : sceltoConto);

  if (conti.length === 0) {
    return (
      <p className="font-mono text-caption text-disabled">
        [CREA PRIMA UN CONTO NELLA SEZIONE CONTI]
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (idConto === "") {
      setErrore("seleziona un conto");
      return;
    }
    const cents = parseCents(importo);
    if (cents === null || cents === 0) {
      setErrore("importo non valido");
      return;
    }
    await db.movimento.add({
      contoId: idConto as number,
      categoriaId: categoria === "" ? undefined : (categoria as number),
      data,
      importo: cents,
      descrizione: descrizione.trim() || undefined,
      tipo,
    });
    setImporto("");
    setDescrizione("");
    setErrore("");
    onSubmitted?.();
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-5", className)}>
      {contoId === undefined ? (
        <Field label="Conto" error={errore.includes("conto") ? errore : undefined}>
          <Select
            value={idConto === "" ? "" : (idConto as number)}
            onChange={(e) => setSceltoConto(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">— seleziona —</option>
            {conti.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <SegmentedControl
        value={tipo}
        onChange={setTipo}
        options={[
          { value: "uscita" as const, label: "Uscita" },
          { value: "entrata" as const, label: "Entrata" },
        ]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Importo" error={errore.includes("importo") ? errore : undefined}>
          <Input
            inputMode="decimal"
            placeholder="0,00"
            value={importo}
            invalid={errore.includes("importo")}
            onChange={(e) => setImporto(e.target.value)}
          />
        </Field>
        <Field label="Data">
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </Field>
      </div>

      <Field label="Categoria" hint="facoltativa">
        <Select value={categoria} onChange={(e) => setCategoria(e.target.value === "" ? "" : Number(e.target.value))}>
          <option value="">— nessuna —</option>
          {categorie.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Descrizione" hint="facoltativa">
        <Input value={descrizione} onChange={(e) => setDescrizione(e.target.value)} placeholder="Es. Rimborso" />
      </Field>

      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary">
          Aggrega
        </Button>
        <Button type="button" variant="ghost" onClick={() => { setImporto(""); setDescrizione(""); setErrore(""); }}>
          Pulisci
        </Button>
      </div>
    </form>
  );
}