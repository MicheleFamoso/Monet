import { db, type Conto, type Movimento } from "./db";

export interface ContoConSaldo {
  conto: Conto;
  saldo: number;
  nMovimenti: number;
  entrateMese: number;
  usciteMese: number;
}

export function saldoDi(conti: Conto[], movimenti: Movimento[], contoId: number): number {
  let saldo = 0;
  for (const m of movimenti) {
    if (m.contoId !== contoId) continue;
    saldo += m.tipo === "entrata" ? m.importo : -m.importo;
  }
  return saldo;
}

export async function getContiConSaldo(): Promise<ContoConSaldo[]> {
  const [conti, movimenti] = await Promise.all([db.conti.toArray(), db.movimento.toArray()]);
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return conti.map((conto) => {
    const delConto = movimenti.filter((m) => m.contoId === conto.id);
    let entrateMese = 0;
    let usciteMese = 0;
    for (const m of delConto) {
      if (!m.data.startsWith(prefix)) continue;
      if (m.tipo === "entrata") entrateMese += m.importo;
      else usciteMese += m.importo;
    }
    return {
      conto,
      saldo: saldoDi(conti, movimenti, conto.id!),
      nMovimenti: delConto.length,
      entrateMese,
      usciteMese,
    };
  });
}

export async function getContoRiferimento(): Promise<ContoConSaldo | null> {
  const conti = await getContiConSaldo();
  if (conti.length === 0) return null;
  return conti.find((c) => c.conto.predefinito === true) ?? conti[0];
}

export async function getSaldoTotale(): Promise<number> {
  const [conti, movimenti] = await Promise.all([db.conti.toArray(), db.movimento.toArray()]);
  return conti.reduce((acc, c) => acc + saldoDi(conti, movimenti, c.id!), 0);
}

export interface RiepilogoMese {
  entrate: number;
  uscite: number;
  risparmio: number;
}

export async function getRiepilogoMese(anno: number, mese: number): Promise<RiepilogoMese> {
  const prefix = `${anno}-${String(mese).padStart(2, "0")}`;
  const rows = await db.movimento.where("data").startsWith(prefix).toArray();
  let entrate = 0;
  let uscite = 0;
  for (const m of rows) {
    if (m.tipo === "entrata") entrate += m.importo;
    else uscite += m.importo;
  }
  return { entrate, uscite, risparmio: entrate - uscite };
}

export interface BudgetItem {
  id: number;
  nome: string;
  colore: string;
  budget: number;
  usato: number;
}

export async function getBudgetMese(anno: number, mese: number): Promise<BudgetItem[]> {
  const prefix = `${anno}-${String(mese).padStart(2, "0")}`;
  const [categorie, movimenti] = await Promise.all([
    db.categoria.toArray(),
    db.movimento.where("data").startsWith(prefix).toArray(),
  ]);
  const usati = new Map<number, number>();
  for (const m of movimenti) {
    if (m.tipo !== "uscita" || m.categoriaId == null) continue;
    usati.set(m.categoriaId, (usati.get(m.categoriaId) ?? 0) + m.importo);
  }
  return categorie.map((c) => ({
    id: c.id!,
    nome: c.nome,
    colore: c.colore,
    budget: c.budgetMensile,
    usato: usati.get(c.id!) ?? 0,
  }));
}

export interface MovimentoConCategoria {
  movimento: Movimento;
  contoNome: string;
  categoriaNome?: string;
  categoriaColore?: string;
}

async function joinMovimenti(rows: Movimento[]): Promise<MovimentoConCategoria[]> {
  const [conti, categorie] = await Promise.all([db.conti.toArray(), db.categoria.toArray()]);
  const contoNome = new Map(conti.map((c) => [c.id!, c.nome]));
  const catMap = new Map(categorie.map((c) => [c.id!, c]));
  return rows.map((m) => ({
    movimento: m,
    contoNome: contoNome.get(m.contoId) ?? "—",
    categoriaNome: m.categoriaId != null ? catMap.get(m.categoriaId)?.nome : undefined,
    categoriaColore: m.categoriaId != null ? catMap.get(m.categoriaId)?.colore : undefined,
  }));
}

export async function getMovimentiRecenti(limit = 8): Promise<MovimentoConCategoria[]> {
  const rows = await db.movimento.orderBy("data").reverse().limit(limit).toArray();
  return joinMovimenti(rows);
}

export async function getMovimentiConto(contoId: number): Promise<MovimentoConCategoria[]> {
  const rows = await db.movimento.where("contoId").equals(contoId).toArray();
  rows.sort((a, b) => (a.data < b.data ? 1 : -1));
  return joinMovimenti(rows);
}

export interface FormatoMese {
  key: string;
  entrate: number;
  uscite: number;
}

export async function getAndamentoMesi(mesiTotali: number): Promise<FormatoMese[]> {
  const rows = await db.movimento.toArray();
  const aggregati = new Map<string, { entrate: number; uscite: number }>();
  for (const m of rows) {
    const key = m.data.slice(0, 7);
    const agg = aggregati.get(key) ?? { entrate: 0, uscite: 0 };
    if (m.tipo === "entrata") agg.entrate += m.importo;
    else agg.uscite += m.importo;
    aggregati.set(key, agg);
  }

  const out: FormatoMese[] = [];
  const now = new Date();
  for (let i = mesiTotali - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const agg = aggregati.get(key) ?? { entrate: 0, uscite: 0 };
    out.push({ key, entrate: agg.entrate, uscite: agg.uscite });
  }
  return out;
}

export const MESI_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export function meseKey(anno: number, mese: number): string {
  return `${anno}-${String(mese).padStart(2, "0")}`;
}

export function etichettaMese(anno: number, mese: number): string {
  return `${MESI_IT[mese - 1].toUpperCase()} ${anno}`;
}

export function mesePrecedente(anno: number, mese: number): { anno: number; mese: number } {
  return mese - 1 === 0 ? { anno: anno - 1, mese: 12 } : { anno, mese: mese - 1 };
}

export function meseSuccessivo(anno: number, mese: number): { anno: number; mese: number } {
  return mese + 1 > 12 ? { anno: anno + 1, mese: 1 } : { anno, mese: mese + 1 };
}

export interface Gruppo {
  nome: string;
  colore?: string;
  totale: number;
  voci: MovimentoConCategoria[];
}

export function aggPerCategoria(voci: MovimentoConCategoria[]): Gruppo[] {
  const mappa = new Map<string, Gruppo>();
  const senzaCategoria: Gruppo = { nome: "Senza categoria", totale: 0, voci: [] };
  for (const v of voci) {
    const c = v.categoriaNome;
    if (c === undefined) {
      senzaCategoria.voci.push(v);
      senzaCategoria.totale += v.movimento.importo;
      continue;
    }
    const g =
      mappa.get(c) ??
      ({ nome: c, colore: v.categoriaColore, totale: 0, voci: [] as MovimentoConCategoria[] } as Gruppo);
    g.voci.push(v);
    g.totale += v.movimento.importo;
    mappa.set(c, g);
  }
  const gruppi = [...mappa.values()].sort((a, b) => b.totale - a.totale);
  if (senzaCategoria.voci.length > 0) gruppi.push(senzaCategoria);
  return gruppi;
}

const GIORNI_IT = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

export function etichettaGiorno(data: string): string {
  const d = new Date(`${data}T00:00:00`);
  return `${GIORNI_IT[d.getDay()]} ${d.getDate()} ${MESI_IT[d.getMonth()].toUpperCase()}`;
}

export function giornoPrecedente(data: string): string {
  const d = new Date(`${data}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function giornoSuccessivo(data: string): string {
  const d = new Date(`${data}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}