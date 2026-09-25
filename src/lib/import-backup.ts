import { unzipSync } from "fflate";
import initSqlJs from "sql.js";
import type { Database } from "sql.js";

export interface ContoImportato {
  uid: string;
  nome: string;
  icona: string;
  predefinito: boolean;
}

export interface CategoriaImportata {
  uid: string;
  nome: string;
  colore: string;
  budgetMensile: number;
}

export interface MovimentoImportato {
  contoUid: string;
  categoriaUid: string | null;
  data: string;
  importo: number;
  descrizione: string | null;
  tipo: "entrata" | "uscita";
}

export interface RiepilogoBackup {
  nConti: number;
  nCategorie: number;
  nMovimenti: number;
  dal: string;
  al: string;
  saltati: number;
}

export interface DatiBackup {
  conti: ContoImportato[];
  categorie: CategoriaImportata[];
  movimenti: MovimentoImportato[];
  riepilogo: RiepilogoBackup;
}

const ICONA_CONTO: Record<string, string> = {
  cash: "cash",
  card: "card",
  cards: "card",
  wallet: "wallet",
  bank: "bank",
  piggy: "piggy",
  home: "home",
  car: "car",
  phone: "phone",
  store: "store",
  tag: "tag",
};

const NOMI_CATEGORIA: Record<string, string> = {
  DefaultHealth: "Salute",
  DefaultLeisure: "Svago",
  DefaultHome: "Casa",
  DefaultCafe: "Caffè",
  DefaultEducation: "Istruzione",
  DefaultPresents: "Regali",
  DefaultProducts: "Prodotti",
  DefaultFamily: "Famiglia",
  DefaultSport: "Sport",
  DefaultTransport: "Trasporti",
  DefaultSalary: "Stipendio",
  DefaultPresent: "Regali",
  DefaultPercents: "Interessi",
  other_expense: "Altro",
  other_income: "Altro",
};

function trovaZip(bytes: Uint8Array): Uint8Array {
  if (bytes.length > 1 && bytes[0] === 0x50 && bytes[1] === 0x4b) return bytes;
  const limite = Math.min(bytes.length - 4, 64);
  for (let i = 0; i <= limite; i++) {
    if (
      bytes[i] === 0x50 &&
      bytes[i + 1] === 0x4b &&
      bytes[i + 2] === 0x03 &&
      bytes[i + 3] === 0x04
    ) {
      return bytes.subarray(i);
    }
  }
  throw new Error("Formato backup non riconosciuto");
}

function righe(db: Database, sql: string): Record<string, string | number | null>[] {
  const res = db.exec(sql);
  if (res.length === 0) return [];
  const { columns, values } = res[0];
  return values.map((v) =>
    Object.fromEntries(columns.map((c, i) => [c, v[i] as string | number | null])),
  );
}

function coloreHex(c: number): string {
  return "#" + (c & 0xffffff).toString(16).padStart(6, "0").toUpperCase();
}

export async function parsingBackup(buffer: ArrayBuffer): Promise<DatiBackup> {
  const SQL = await initSqlJs(
    typeof window === "undefined" ? undefined : { locateFile: () => "/wasm/sql-wasm.wasm" },
  );

  const zip = trovaZip(new Uint8Array(buffer));

  let archivio: Record<string, Uint8Array>;
  try {
    archivio = unzipSync(zip);
  } catch {
    throw new Error("Impossibile leggere il backup: archivio non valido");
  }
  const nomeDb = Object.keys(archivio).find((n) => n.toLowerCase().endsWith(".db"));
  if (!nomeDb) throw new Error("Impossibile leggere il backup: database non trovato nel file");

  let db: Database;
  try {
    db = new SQL.Database(archivio[nomeDb]);
  } catch {
    throw new Error("Impossibile aprire il database del backup");
  }

  try {
    const contiVecchi = righe(
      db,
      "SELECT uid, title, icon FROM account WHERE isRemoved = 0 AND isArchived = 0 AND isActive = 1 ORDER BY position",
    );
    const categorieVecchie = righe(
      db,
      "SELECT uid, title, color, limitAmount FROM category WHERE isRemoved = 0",
    );
    const movimentiVecchi = righe(
      db,
      'SELECT uid, type, date, amountInDefaultCurrency, comment FROM "transaction" WHERE isRemoved = 0',
    );
    const link = righe(
      db,
      "SELECT entityType, entityUid, otherType, otherUid FROM sync_link WHERE isRemoved = 0",
    );

    if (contiVecchi.length === 0) throw new Error("Nessun conto trovato nel backup");

    const contoDi = new Map<string, string>();
    const categoriaDi = new Map<string, string>();
    const nMovPerConto = new Map<string, number>();
    for (const l of link) {
      const tipoMov =
        l.entityType === "Transaction" ? l.entityUid : l.otherType === "Transaction" ? l.otherUid : null;
      if (tipoMov === null) continue;
      const altroTipo = l.entityType === "Transaction" ? l.otherType : l.entityType;
      const altroUid = l.entityType === "Transaction" ? l.otherUid : l.entityUid;
      if (altroTipo === "Account") {
        contoDi.set(String(tipoMov), String(altroUid));
        nMovPerConto.set(String(altroUid), (nMovPerConto.get(String(altroUid)) ?? 0) + 1);
      } else if (altroTipo === "Category") {
        categoriaDi.set(String(tipoMov), String(altroUid));
      }
    }

    const catUsate = new Set<string>();
    for (const m of movimentiVecchi) {
      const c = categoriaDi.get(String(m.uid));
      if (c) catUsate.add(c);
    }

    const uidsConti = contiVecchi.map((c) => String(c.uid));
    const contoPredefinito = [...uidsConti].sort(
      (a, b) => (nMovPerConto.get(b) ?? 0) - (nMovPerConto.get(a) ?? 0),
    )[0];

    const conti: ContoImportato[] = contiVecchi.map((c) => {
      const uid = String(c.uid);
      return {
        uid,
        nome: (c.title ?? "").toString().trim() || (uid === "main" ? "Principale" : "Conto"),
        icona: ICONA_CONTO[String(c.icon ?? "")] ?? "wallet",
        predefinito: uid === contoPredefinito,
      };
    });

    const nomiUsati = new Set<string>();
    const categorie: CategoriaImportata[] = [];
    for (const c of categorieVecchie) {
      const uid = String(c.uid);
      if (!catUsate.has(uid)) continue;
      let nome = (c.title ?? "").toString().trim() || NOMI_CATEGORIA[uid] || "Categoria";
      if (nomiUsati.has(nome)) {
        let n = 2;
        while (nomiUsati.has(`${nome} (${n})`)) n++;
        nome = `${nome} (${n})`;
      }
      nomiUsati.add(nome);
      categorie.push({
        uid,
        nome,
        colore: coloreHex(Number(c.color) || 0),
        budgetMensile: Number(c.limitAmount) || 0,
      });
    }

    const uidsCategorie = new Set(categorieVecchie.map((c) => String(c.uid)).filter((u) => catUsate.has(u)));
    const movimenti: MovimentoImportato[] = [];
    const date: string[] = [];
    let saltati = 0;

    for (const m of movimentiVecchi) {
      const tipo = String(m.type);
      if (tipo !== "Expense" && tipo !== "Income") {
        saltati++;
        continue;
      }
      const contoUid = contoDi.get(String(m.uid));
      if (!contoUid || !uidsConti.includes(contoUid)) {
        saltati++;
        continue;
      }
      const data = String(m.date ?? "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        saltati++;
        continue;
      }
      const comment = (m.comment ?? "").toString().trim();
      const catUid = categoriaDi.get(String(m.uid)) ?? null;
      movimenti.push({
        contoUid,
        categoriaUid: catUid && uidsCategorie.has(catUid) ? catUid : null,
        data,
        importo: Number(m.amountInDefaultCurrency) || 0,
        descrizione: comment || null,
        tipo: tipo === "Income" ? "entrata" : "uscita",
      });
      date.push(data);
    }

    date.sort();

    return {
      conti,
      categorie,
      movimenti,
      riepilogo: {
        nConti: conti.length,
        nCategorie: categorie.length,
        nMovimenti: movimenti.length,
        dal: date[0] ?? "",
        al: date[date.length - 1] ?? "",
        saltati,
      },
    };
  } finally {
    db.close();
  }
}
