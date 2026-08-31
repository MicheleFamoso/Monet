"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getMovimentiRecenti } from "@/lib/queries";
import { MovimentiTable } from "./movimenti-table";

export function MovimentiRecenti({ limit = 8 }: { limit?: number }) {
  const rows = useLiveQuery(() => getMovimentiRecenti(limit), [limit]);

  if (rows === undefined) {
    return <span className="font-mono text-caption text-disabled">[LOADING...]</span>;
  }
  return <MovimentiTable rows={rows} />;
}