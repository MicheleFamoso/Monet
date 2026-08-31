import Dexie, { type EntityTable } from "dexie";

export type TipoMovimento = "entrata" | "uscita";

export interface Conto {
  id?: number;
  nome: string;
  icona: string;
  descrizione?: string;
  predefinito?: boolean;
  createdAt: number;
}

export interface Categoria {
  id?: number;
  nome: string;
  colore: string;
  budgetMensile: number;
  descrizione?: string;
}

export interface Movimento {
  id?: number;
  contoId: number;
  categoriaId?: number;
  data: string;
  importo: number;
  descrizione?: string;
  tipo: TipoMovimento;
}

export class MonetaDB extends Dexie {
  conti!: EntityTable<Conto, "id">;
  categoria!: EntityTable<Categoria, "id">;
  movimento!: EntityTable<Movimento, "id">;

  constructor() {
    super("moneta");
    this.version(1).stores({
      conti: "++id, nome",
      categoria: "++id, nome",
      movimento: "++id, contoId, categoriaId, data, tipo, [contoId+data]",
    });
  }
}

export const db = new MonetaDB();

export const TIPO_LABEL: Record<TipoMovimento, string> = {
  entrata: "Entrata",
  uscita: "Uscita",
};