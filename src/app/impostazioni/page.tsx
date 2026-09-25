"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { db } from "@/lib/db";
import { parsingBackup, type DatiBackup } from "@/lib/import-backup";
import { useLiveQuery } from "dexie-react-hooks";

type FaseImport = "idle" | "lettura" | "pronto" | "scrittura" | "fatto" | "errore";

function initialDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function fmtData(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [a, m, g] = iso.split("-");
  return `${g}/${m}/${a}`;
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

  const fileRef = useRef<HTMLInputElement>(null);
  const [fase, setFase] = useState<FaseImport>("idle");
  const [dati, setDati] = useState<DatiBackup | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  function cambiaTema(checked: boolean) {
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    try {
      localStorage.setItem("moneta-theme", checked ? "dark" : "light");
    } catch {
      /* noop */
    }
  }

  function resetImport() {
    setFase("idle");
    setDati(null);
    setErrore(null);
  }

  function scegliFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void leggiFile(file);
  }

  async function leggiFile(file: File) {
    setErrore(null);
    setDati(null);
    setFase("lettura");
    try {
      const buffer = await file.arrayBuffer();
      setDati(await parsingBackup(buffer));
      setFase("pronto");
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "File non leggibile");
      setFase("errore");
    }
  }

  async function confermaImporta() {
    if (!dati) return;
    setFase("scrittura");
    try {
      await db.transaction("rw", db.movimento, db.categoria, db.conti, async () => {
        await db.movimento.clear();
        await db.categoria.clear();
        await db.conti.clear();
        const ora = Date.now();
        const contoIds = await db.conti.bulkAdd(
          dati.conti.map((c) => ({
            nome: c.nome,
            icona: c.icona,
            predefinito: c.predefinito || undefined,
            createdAt: ora,
          })),
          { allKeys: true },
        );
        const catIds = await db.categoria.bulkAdd(
          dati.categorie.map((c) => ({
            nome: c.nome,
            colore: c.colore,
            budgetMensile: c.budgetMensile,
          })),
          { allKeys: true },
        );
        const uidContoId = new Map(dati.conti.map((c, i) => [c.uid, contoIds[i]]));
        const uidCatId = new Map(dati.categorie.map((c, i) => [c.uid, catIds[i]]));
        await db.movimento.bulkAdd(
          dati.movimenti.map((m) => ({
            contoId: uidContoId.get(m.contoUid)!,
            categoriaId: m.categoriaUid ? uidCatId.get(m.categoriaUid) : undefined,
            data: m.data,
            importo: m.importo,
            descrizione: m.descrizione ?? undefined,
            tipo: m.tipo,
          })),
        );
      });
      setFase("fatto");
    } catch {
      setErrore("Importazione non riuscita. I dati precedenti non sono stati modificati.");
      setFase("errore");
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

        <div className="mt-5 border-t border-border pt-5">
          <p className="font-sans text-body text-primary">Importa backup</p>
          <p className="label mt-1 text-disabled">Dal vecchio formato .mmbackup</p>

          {fase === "idle" && (
            <Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => fileRef.current?.click()}>
              Carica file
            </Button>
          )}

          {fase === "lettura" && (
            <p className="label mt-4 text-secondary">Lettura del file in corso…</p>
          )}

          {fase === "pronto" && dati && (
            <div className="mt-4">
              <div className="rounded-xl border border-border bg-surface-raised px-4 py-3">
                <p className="font-mono text-body tabular-nums text-primary">
                  {dati.riepilogo.nConti} conti · {dati.riepilogo.nCategorie} categorie · {dati.riepilogo.nMovimenti} movimenti
                </p>
                <p className="label mt-1 text-secondary">
                  {fmtData(dati.riepilogo.dal)} – {fmtData(dati.riepilogo.al)}
                  {dati.riepilogo.saltati > 0 ? ` · ${dati.riepilogo.saltati} saltati` : ""}
                </p>
              </div>
              <p className="label mt-3 text-accent">
                Sostituirà tutti i dati attuali ({nConti} conti, {nCategorie} categorie, {nMovimenti} movimenti).
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={resetImport}>
                  Annulla
                </Button>
                <Button type="button" variant="primary" className="flex-1" onClick={() => void confermaImporta()}>
                  Sostituisci e importa
                </Button>
              </div>
            </div>
          )}

          {fase === "scrittura" && (
            <p className="label mt-4 text-secondary">Importazione in corso…</p>
          )}

          {fase === "fatto" && dati && (
            <div className="mt-4">
              <p className="label text-success">
                Backup importato: {dati.riepilogo.nMovimenti} movimenti dal {fmtData(dati.riepilogo.dal)} al {fmtData(dati.riepilogo.al)}.
              </p>
              <Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => fileRef.current?.click()}>
                Importa un altro file
              </Button>
            </div>
          )}

          {fase === "errore" && (
            <div className="mt-4">
              <p className="label text-accent">{errore}</p>
              <Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => fileRef.current?.click()}>
                Riprova
              </Button>
            </div>
          )}
        </div>

        <p className="label mt-5 text-disabled">
          Tutti i dati sono salvati solo su questo browser (IndexedDB) e non vengono inviati a nessun server.
        </p>
      </Card>

      <p className="label text-center text-disabled">Moneta · contabilità locale</p>

      <input ref={fileRef} type="file" accept=".mmbackup,.zip,application/zip" className="hidden" onChange={scegliFile} />
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
