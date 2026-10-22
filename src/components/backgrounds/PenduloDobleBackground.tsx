// Fondo de hero: Péndulo doble
import { useEffect, useRef } from 'react';

export interface PenduloDobleBackgroundProps {
  /** Escala (px) (60 a 260) */
  size?: number;
  /** Brazos (1 a 3) */
  arms?: number;
  /** Velocidad (0.2 a 3) */
  speed?: number;
  /** Estela (50 a 1200) */
  trail?: number;
  /** Empuje puntero (0 a 10) */
  kick?: number;
  /** Fricción (0 a 0.05) */
  damp?: number;
  /** Grosor (0.5 a 3) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Fija el pivote al centro horizontal y al 35% de la altura */
  fixed?: boolean;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  size: 150,
  arms: 2,
  speed: 1.2,
  trail: 500,
  kick: 3,
  damp: 0.002,
  lw: 1.4,
  alpha: 0.6,
  fixed: false,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {
  const n = Math.max(1, Math.min(3, Math.round(P.arms)));
  S.n = n;
  S.th = Array.from({ length: n }, (_, i) => (i === 0 ? 2.4 + Math.random() * 0.3 : 2.1 - (i - 1) * 0.15));
  S.om = new Array(n).fill(0);
  S.tr = [];
  S.px = W / 2;
}

// Aceleraciones angulares de una cadena de péndulos con masas y longitudes iguales.
function accel(th: number[], om: number[], L: number, g: number): number[] {
  const n = th.length;
  const A: number[][] = [];
  const rhs: number[] = [];
  for (let i = 0; i < n; i++) {
    A.push([]);
    let b = -(n - i) * g * L * Math.sin(th[i]);
    for (let j = 0; j < n; j++) {
      const mu = n - Math.max(i, j);
      A[i].push(mu * L * L * Math.cos(th[i] - th[j]));
      b -= mu * L * L * Math.sin(th[i] - th[j]) * om[j] * om[j];
    }
    rhs.push(b);
  }
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
    [A[c], A[p]] = [A[p], A[c]];
    [rhs[c], rhs[p]] = [rhs[p], rhs[c]];
    for (let i = c + 1; i < n; i++) {
      const f = A[i][c] / A[c][c];
      for (let j = c; j < n; j++) A[i][j] -= f * A[c][j];
      rhs[i] -= f * rhs[c];
    }
  }
  const out = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = rhs[i];
    for (let j = i + 1; j < n; j++) sum -= A[i][j] * out[j];
    out[i] = sum / A[i][i];
  }
  return out;
}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {
  const px = P.fixed ? W / 2 : W / 2 + (m.sx - W / 2) * 0.5;
  const py = P.fixed ? H * 0.35 : H * 0.4 + (m.sy - H / 2) * 0.3;
  const steps = 8;
  const h = (dt / 1000) * P.speed / steps;
  S.om[0] += (px - S.px) * P.kick * 0.004;
  S.px = px;

  for (let step = 0; step < steps; step++) {
    // Longitudes normalizadas: la escala visual no debe frenar la simulación.
    const a = accel(S.th, S.om, 1, 9.8);
    for (let i = 0; i < S.n; i++) {
      S.om[i] += a[i] * h;
      S.om[i] *= 1 - P.damp;
      S.th[i] += S.om[i] * h;
    }
  }

  const pts: number[][] = [[px, py]];
  let x = px;
  let y = py;
  for (let i = 0; i < S.n; i++) {
    x += Math.sin(S.th[i]) * P.size;
    y += Math.cos(S.th[i]) * P.size;
    pts.push([x, y]);
  }

  const [tx, ty] = pts[pts.length - 1];
  S.tr.push(tx, ty);
  while (S.tr.length > P.trail * 2) S.tr.splice(0, 2);
  c.strokeStyle = ink;
  c.fillStyle = ink;
  c.lineWidth = P.lw;
  c.lineCap = "round";
  const L = S.tr.length / 2;
  for (let i = 1; i < L; i++) {
    c.globalAlpha = P.alpha * i / L;
    c.beginPath();
    c.moveTo(S.tr[2 * i - 2], S.tr[2 * i - 1]);
    c.lineTo(S.tr[2 * i], S.tr[2 * i + 1]);
    c.stroke();
  }

  c.globalAlpha = P.alpha;
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.stroke();
  c.beginPath();
  for (let i = 1; i < pts.length; i++) {
    const r = i === pts.length - 1 ? 5 : 4;
    c.moveTo(pts[i][0] + r, pts[i][1]);
    c.arc(pts[i][0], pts[i][1], r, 0, Math.PI * 2);
  }
  c.fill();
}

export default function PenduloDobleBackground(props: PenduloDobleBackgroundProps) {
  const { color, className, ...rest } = props;
  const P: Params = { ...DEFAULTS, ...rest };
  const key = JSON.stringify(P);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const m: Pointer = { x: 0, y: 0, sx: 0, sy: 0, on: false };
    let width = 0;
    let height = 0;
    let S: any = {};
    let last = 0;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      if (!m.on) {
        m.x = m.sx = width / 2;
        m.y = m.sy = height / 2;
      }
      S = {};
      init(width, height, P, S);
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      m.x = clientX - rect.left;
      m.y = clientY - rect.top;
      if (!m.on) {
        m.sx = m.x;
        m.sy = m.y;
      }
      m.on = true;
    }

    function animate(t: number) {
      const dt = Math.min(t - last, 50);
      last = t;
      m.sx += (m.x - m.sx) * 0.12;
      m.sy += (m.y - m.sy) * 0.12;
      // Tinta y opacidad leidas del CSS de la pagina en cada fotograma
      const ink = style.getPropertyValue('--pendulo-doble-color').trim() || style.color;
      const k = style.getPropertyValue('--pendulo-doble-opacity').trim();
      canvas.style.opacity = k !== '' && Number.isFinite(Number(k)) ? k : '';
      ctx!.globalAlpha = 1;
      ctx!.clearRect(0, 0, width, height);
      frame(ctx!, width, height, P, S, t, m, ink, dt);
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => setPointer(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('touchmove', onTouch, { passive: true });

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div
      className={`bg-canvas ${className ?? ''}`.trim()}
      style={color ? ({ '--pendulo-doble-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
