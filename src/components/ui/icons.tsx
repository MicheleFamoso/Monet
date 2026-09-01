interface IconProps {
  className?: string;
}

export function IconConti({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h.01M11 15h2" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

export function IconResoconti({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20V14" />
      <path d="M10 20V8" />
      <path d="M16 20V11" />
      <path d="M22 20H3" />
    </svg>
  );
}

export function IconCategorie({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconImpostazioni({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconEye({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.04 18.04 0 0 1 5.06-5.94" />
      <path d="M5.55 5.55A10 10 0 0 1 12 5c6.5 0 10 7 10 7a18.1 18.1 0 0 1-3.07 4.31" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

const STELLA_DOT_MATRIX: { x: number; y: number; accesa: boolean }[] = (() => {
  const grid = 9;
  const cell = 24 / grid;
  const cx = 12;
  const cy = 12;
  const raggioEst = 11;
  const raggioInt = 5;

  const poly: { x: number; y: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? raggioEst : raggioInt;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    poly.push({ x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) });
  }

  function inside(x: number, y: number): boolean {
    let dentro = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x;
      const yi = poly[i].y;
      const xj = poly[j].x;
      const yj = poly[j].y;
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) dentro = !dentro;
    }
    return dentro;
  }

  const pts: { x: number; y: number; accesa: boolean }[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const x = c * cell + cell / 2;
      const y = r * cell + cell / 2;
      pts.push({ x, y, accesa: inside(x, y) });
    }
  }
  return pts;
})();

export function IconStarDot({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      {STELLA_DOT_MATRIX.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="0.9"
          className={p.accesa ? "fill-accent" : "fill-border"}
          opacity={p.accesa ? 1 : 0.5}
        />
      ))}
    </svg>
  );
}

const DOT_GRID = 9;
const DOT_CELL = 24 / DOT_GRID;

interface DotMatrixProps {
  isOn: (x: number, y: number) => boolean;
  className?: string;
}

function DotMatrix({ isOn, className }: DotMatrixProps) {
  const pts: { x: number; y: number; accesa: boolean }[] = [];
  for (let r = 0; r < DOT_GRID; r++) {
    for (let c = 0; c < DOT_GRID; c++) {
      const x = c * DOT_CELL + DOT_CELL / 2;
      const y = r * DOT_CELL + DOT_CELL / 2;
      pts.push({ x, y, accesa: isOn(x, y) });
    }
  }
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="0.85"
          className={p.accesa ? "fill-current" : "fill-border"}
          opacity={p.accesa ? 1 : 0.5}
        />
      ))}
    </svg>
  );
}

function inRett(x: number, y: number, x0: number, y0: number, x1: number, y1: number): boolean {
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function inTriangolo(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
): boolean {
  const segno = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number) =>
    (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
  const d1 = segno(x, y, ax, ay, bx, by);
  const d2 = segno(x, y, bx, by, cx, cy);
  const d3 = segno(x, y, cx, cy, ax, ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

export function IconCrescitaDot({ className }: IconProps) {
  return (
    <DotMatrix
      className={className}
      isOn={(x, y) =>
        inRett(x, y, 8.5, 5, 15.5, 21) ||
        inTriangolo(x, y, 5.5, 13, 12, 4, 18.5, 13)
      }
    />
  );
}

export function IconUsciteDot({ className }: IconProps) {
  return (
    <DotMatrix
      className={className}
      isOn={(x, y) =>
        (x >= 2 && x <= 13.5 && y >= 8.5 && y <= 15.5) ||
        inTriangolo(x, y, 13, 5.5, 22.5, 12, 13, 18.5)
      }
    />
  );
}

export function IconSwap({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 7h12" />
      <path d="M13 4l3 3-3 3" />
      <path d="M20 17H8" />
      <path d="M11 14l-3 3 3 3" />
    </svg>
  );
}
