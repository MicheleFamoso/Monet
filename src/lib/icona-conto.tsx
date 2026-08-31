import type { ComponentType } from "react";

interface ContoIconaProps {
  className?: string;
}

function makeIcon(paths: React.ReactNode): ComponentType<ContoIconaProps> {
  return function ContoIcona({ className }: ContoIconaProps) {
    return (
      <svg
        className={className}
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {paths}
      </svg>
    );
  };
}

export interface ContoIconaDef {
  id: string;
  label: string;
  Icon: ComponentType<ContoIconaProps>;
}

const def = (id: string, label: string, children: React.ReactNode): ContoIconaDef => ({
  id,
  label,
  Icon: makeIcon(children),
});

export const ICONE_CONTO: ContoIconaDef[] = [
  def("wallet", "Portafoglio", (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <path d="M3 8v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-5" />
      <path d="M3 8a2 2 0 0 0 2 2h13a1 1 0 0 1 1 1v1" />
      <path d="M15 15h4" />
    </>
  )),
  def("card", "Carta", (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </>
  )),
  def("cash", "Contanti", (
    <>
      <path d="M12 2v20" />
      <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  )),
  def("bank", "Banca", (
    <>
      <path d="M3 10l9-6 9 6" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
      <path d="M3 20h18" />
    </>
  )),
  def("piggy", "Salvadanaio", (
    <>
      <path d="M19 10a7 7 0 0 0-14-1v7a2 2 0 0 0 2 2h1" />
      <path d="M7 16v3" />
      <path d="M19 10c1.5 0 2 1 2 2s-.5 2-2 2" />
      <path d="M17 9h.01" />
    </>
  )),
  def("tag", "Tag", (
    <>
      <path d="M12 2H2v10l9.3 9.3a1 1 0 0 0 1.4 0l8.6-8.6a1 1 0 0 0 0-1.4L12 2z" />
      <path d="M7 7h.01" />
    </>
  )),
  def("phone", "Telefono", (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  )),
  def("car", "Auto", (
    <>
      <path d="M4 11l1.5-4.5A2 2 0 0 1 7.4 5h9.2a2 2 0 0 1 1.9 1.5L20 11" />
      <path d="M3 11h18a1 1 0 0 1 1 1v5h-2" />
      <path d="M4 17H2v-5" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  )),
  def("home", "Casa", (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      <path d="M10 21v-6h4v6" />
    </>
  )),
  def("store", "Negozio", (
    <>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M4 12v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8" />
      <path d="M9 21v-6h6v6" />
    </>
  )),
];

export const ICONA_DEFAULT = "wallet";

const ICONA_BY_ID: Record<string, ComponentType<ContoIconaProps>> = Object.fromEntries(
  ICONE_CONTO.map((i) => [i.id, i.Icon]),
);

export { ICONA_BY_ID };

export function getIconaConto(id: string | undefined): ComponentType<ContoIconaProps> {
  return ICONA_BY_ID[id ?? ICONA_DEFAULT] ?? ICONE_CONTO[0].Icon;
}

