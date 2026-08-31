import { db } from "./db";

const SEED_KEY = "moneta-seeded-v1";

const CATEGORIE_DEFAULT = [
  { nome: "Casa", colore: "#5F6EF0", budgetMensile: 70000, descrizione: "Affitto, utenze e spese domestiche" },
  { nome: "Spesa", colore: "#4A9E5C", budgetMensile: 40000, descrizione: "Alimentari e beni quotidiani" },
  { nome: "Mobilità", colore: "#5B9BF6", budgetMensile: 15000, descrizione: "Trasporti, carburante, biglietti" },
  { nome: "Salute", colore: "#D4A843", budgetMensile: 12000, descrizione: "Farmacia e visite" },
  { nome: "Svago", colore: "#D71921", budgetMensile: 8000, descrizione: "Tempo libero e hobby"},
  { nome: "Altro", colore: "#999999", budgetMensile: 5000, descrizione: "Spese non categorizzate" },
];

export async function ensureSeeded(): Promise<void> {
  if (seedingPromise) return seedingPromise;
  seedingPromise = doSeed().finally(() => {
    seedingPromise = null;
  });
  return seedingPromise;
}

let seedingPromise: Promise<void> | null = null;

async function doSeed(): Promise<void> {
  try {
    if (localStorage.getItem(SEED_KEY)) return;
  } catch {
    /* se storage non disponibile procede comunque */
  }

  const count = await db.categoria.count();
  if (count > 0) {
    try {
      localStorage.setItem(SEED_KEY, "1");
    } catch {
      /* noop */
    }
    return;
  }

  await db.transaction("rw", db.categoria, db.conti, db.movimento, async () => {
    if ((await db.categoria.count()) > 0) return;

    const categoriaIds: Record<string, number | undefined> = {};
    for (const c of CATEGORIE_DEFAULT) {
      categoriaIds[c.nome] = await db.categoria.add(c);
    }

    const contoId = (await db.conti.add({ nome: "Conto corrente", icona: "wallet", predefinito: true, createdAt: Date.now() }))!;
    await db.movimento.add({
      contoId,
      categoriaId: categoriaIds["Altro"],
      data: new Date().toISOString().slice(0, 10),
      importo: 12480,
      descrizione: "Saldo iniziale",
      tipo: "entrata",
    });
  });

  try {
    localStorage.setItem(SEED_KEY, "1");
  } catch {
    /* noop */
  }
}