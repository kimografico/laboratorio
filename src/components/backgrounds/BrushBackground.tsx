import { useEffect, useRef } from "react";

export interface BrushBackgroundProps {
  /** Radio de los ensō (círculos de pincel) en px; los trazos sueltos miden unas 2,5 veces esto */
  size?: number;
  /** Grosor máximo del pincel (px) */
  width?: number;
  /** Cerdas del pincel: más cerdas, trazo más lleno */
  bristles?: number;
  /** Sequedad del pincel (0-1): huecos de cerdas sin tinta, sobre todo al final del trazo */
  dry?: number;
  /** Segundos que tarda en dibujarse un trazo */
  draw?: number;
  /** Segundos hasta que el trazo se desvanece */
  life?: number;
  /** Dibuja un primer ensō al montarse, para que el fondo no empiece vacío */
  intro?: boolean;
  /** Opacidad de la tinta (0-1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Stroke = { born: number; M: number; xs: Float32Array[]; ys: Float32Array[]; vis: Uint8Array[]; lw: number; dur: number };

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const M = 100;

export default function BrushBackground({
  size = 120,
  width = 16,
  bristles = 18,
  dry = 0.6,
  draw = 1.3,
  life = 12,
  intro = true,
  alpha = 0.3,
  color,
  className,
}: BrushBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const NBR = Math.max(4, Math.round(bristles));
    let w = 0;
    let h = 0;
    let now = 0;
    let strokes: Stroke[] = [];
    let first = intro;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
    }

    // Línea central del trazo (círculo abierto o barrido curvo) con su normal en cada punto
    function spawn(x: number, y: number) {
      const cx = new Float32Array(M);
      const cy = new Float32Array(M);
      const nx = new Float32Array(M);
      const ny = new Float32Array(M);
      if (Math.random() < 0.7) {
        const R = size * (0.75 + 0.5 * Math.random());
        const a0 = Math.random() * Math.PI * 2;
        const sweep = Math.PI * (1.7 + 0.22 * Math.random());
        const dir = Math.random() < 0.5 ? -1 : 1;
        for (let i = 0; i < M; i++) {
          const u = i / (M - 1);
          const ang = a0 + dir * sweep * u;
          // Al cerrar, el pincel se desliza un poco hacia fuera: el círculo queda abierto, como un ensō
          const rad = R * (1 + 0.06 * u + 0.015 * Math.sin(u * 9));
          nx[i] = Math.cos(ang);
          ny[i] = Math.sin(ang);
          cx[i] = x + nx[i] * rad;
          cy[i] = y + ny[i] * rad;
        }
      } else {
        const len = size * 2.5;
        const phi = Math.random() * Math.PI;
        const off = (Math.random() < 0.5 ? -1 : 1) * len * 0.25;
        const p0x = x - (Math.cos(phi) * len) / 2;
        const p0y = y - (Math.sin(phi) * len) / 2;
        const p2x = x + (Math.cos(phi) * len) / 2;
        const p2y = y + (Math.sin(phi) * len) / 2;
        const qx = x - Math.sin(phi) * off;
        const qy = y + Math.cos(phi) * off;
        for (let i = 0; i < M; i++) {
          const u = i / (M - 1);
          cx[i] = (1 - u) * (1 - u) * p0x + 2 * (1 - u) * u * qx + u * u * p2x;
          cy[i] = (1 - u) * (1 - u) * p0y + 2 * (1 - u) * u * qy + u * u * p2y;
          const tx = 2 * (1 - u) * (qx - p0x) + 2 * u * (p2x - qx);
          const ty = 2 * (1 - u) * (qy - p0y) + 2 * u * (p2y - qy);
          const d = Math.hypot(tx, ty) || 1;
          nx[i] = -ty / d;
          ny[i] = tx / d;
        }
      }
      const W = width * (0.8 + 0.4 * Math.random());
      const seed = Math.random() * 1000;
      const xs: Float32Array[] = [];
      const ys: Float32Array[] = [];
      const vis: Uint8Array[] = [];
      for (let b = 0; b < NBR; b++) {
        const o = (b / (NBR - 1)) * 2 - 1;
        const bx = new Float32Array(M);
        const by = new Float32Array(M);
        const bv = new Uint8Array(M);
        for (let i = 0; i < M; i++) {
          const u = i / (M - 1);
          // Presión: entra de golpe, se mantiene y se afina hacia el final
          const wd = W * (0.9 - 0.55 * Math.pow(u, 1.3)) * (0.5 + 0.5 * Math.min(1, u * 12));
          const off = o * wd + Math.sin(u * 14 + b * 3.7) * 0.8;
          bx[i] = cx[i] + nx[i] * off;
          by[i] = cy[i] + ny[i] * off;
          // Pincel seco: las cerdas se quedan sin tinta a ratos, más al final y en los bordes del pincel
          bv[i] = hash(b * 17.3 + Math.floor(u * 55) * 3.1 + seed) > dry * (0.12 + 0.85 * u * u + 0.2 * Math.abs(o)) ? 1 : 0;
        }
        xs.push(bx);
        ys.push(by);
        vis.push(bv);
      }
      strokes.push({ born: now, M, xs, ys, vis, lw: Math.max(1.5, ((2 * W) / NBR) * 1.1), dur: draw });
      if (strokes.length > 8) strokes.shift();
    }

    function onDown(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      spawn(x, y);
    }

    function animate(time: number) {
      now = time * 0.001;
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--brush-color").trim() || style.color;
      const k = style.getPropertyValue("--brush-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      if (first) {
        first = false;
        spawn(w / 2, h / 2);
      }
      strokes = strokes.filter((s) => now - s.born < life);

      for (const s of strokes) {
        const age = now - s.born;
        const t = Math.min(1, age / s.dur);
        const g = t * t * (3 - 2 * t);
        const n = Math.max(2, Math.floor(g * (s.M - 1)) + 1);
        const f = age < life * 0.5 ? 1 : Math.max(0, 1 - (age - life * 0.5) / (life * 0.5));
        ctx!.lineWidth = s.lw;
        ctx!.globalAlpha = Math.min(1, alpha * mul * f);
        // Todas las cerdas en un solo trazado: el solapamiento no suma opacidad
        ctx!.beginPath();
        for (let b = 0; b < NBR; b++) {
          const bx = s.xs[b];
          const by = s.ys[b];
          const bv = s.vis[b];
          for (let i = 0; i < n; i++) {
            if (!bv[i]) continue;
            if (i > 0 && bv[i - 1]) ctx!.lineTo(bx[i], by[i]);
            else ctx!.moveTo(bx[i], by[i]);
          }
        }
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onDownEvt = (e: PointerEvent) => onDown(e.clientX, e.clientY);
    window.addEventListener("pointerdown", onDownEvt);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointerdown", onDownEvt);
    };
  }, [size, width, bristles, dry, draw, life, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--brush-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
