import type { MovimentoConCategoria } from "@/lib/queries";
import { formatEuro } from "@/lib/money";

interface MovimentiTableProps {
  rows: MovimentoConCategoria[];
  showConto?: boolean;
}

export function MovimentiTable({ rows, showConto = false }: MovimentiTableProps) {
  return (
    <table className="w-full border-t border-border-visible">
      <thead>
        <tr className="label text-disabled">
          <th className="py-2 pr-4 text-left font-normal">Data</th>
          <th className="py-2 pr-4 text-left font-normal">Descrizione</th>
          {showConto ? <th className="py-2 pr-4 text-left font-normal">Conto</th> : null}
          <th className="py-2 pr-4 text-left font-normal">Categoria</th>
          <th className="py-2 text-right font-normal">Importo</th>
        </tr>
      </thead>
      <tbody className="font-mono text-body-sm">
        {rows.map(({ movimento, contoNome, categoriaNome, categoriaColore }) => (
          <tr key={movimento.id} className="border-b border-border last:border-b-0">
            <td className="py-3 pr-4 whitespace-nowrap text-disabled">{movimento.data}</td>
            <td className="py-3 pr-4 font-sans text-primary">
              {movimento.descrizione ?? "—"}
            </td>
            {showConto ? <td className="py-3 pr-4 text-secondary">{contoNome}</td> : null}
            <td className="py-3 pr-4 whitespace-nowrap text-secondary">
              {categoriaNome ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: categoriaColore ?? "var(--border-visible)" }}
                  />
                  {categoriaNome}
                </span>
              ) : (
                "—"
              )}
            </td>
            <td
              className={`py-3 text-right whitespace-nowrap tabular-nums ${
                movimento.tipo === "entrata" ? "text-success" : "text-primary"
              }`}
            >
              {movimento.tipo === "entrata" ? "+" : "−"}
              {formatEuro(movimento.importo)}
            </td>
          </tr>
        ))}
        {rows.length === 0 ? (
          <tr>
            <td colSpan={showConto ? 5 : 4} className="py-8 text-center font-mono text-caption text-disabled">
              [NESSUN MOVIMENTO]
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}