import { useEffect, useRef } from "react";

export interface LeavesBackgroundProps {
  /** Ramas cercanas: hojas con contorno, nervios y peciolo */
  near?: number;
  /** Ramas lejanas: más grandes y muy tenues, solo la silueta (como sombras sobre el fondo) */
  far?: number;
  /** Largo de la hoja más grande (px) */
  size?: number;
  /** Fuerza del viento que las mece (1 = normal, 0 = quietas) */
  wind?: number;
  /** Cuánto las aparta el puntero al pasar cerca (0 = no las toca) */
  push?: number;
  /** Opacidad del contorno de las hojas cercanas (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Leaf = { node: number; side: number; len: number; ph: number; push: number };
type Branch = {
  rx: number;
  ry: number;
  base: number; // ángulo de la rama (hacia abajo y hacia dentro)
  curve: number;
  L: number;
  far: boolean;
  ph: number;
  xs: number[];
  ys: number[];
  th: number[];
  leaves: Leaf[];
};

const NODES = 16;

export default function LeavesBackground({
  near = 4,
  far = 3,
  size = 80,
  wind = 1,
  push = 1,
  alpha = 0.3,
  lineWidth = 1.2,
  color,
  className,
}: LeavesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let hasPointer = false;
    let branches: Branch[] = [];
    let raf = 0;

    function make(isFar: boolean, i: number, total: number): Branch {
      // Las ramas entran desde el borde superior (y los laterales) hacia el interior
      const slot = (i + 0.5) / total;
      const fromSide = Math.random() < 0.3;
      let rx: number, ry: number, base: number;
      if (fromSide) {
        const left = Math.random() < 0.5;
        rx = left ? -20 : w + 20;
        ry = h * (0.05 + 0.4 * Math.random());
        base = left ? 0.5 + 0.35 * Math.random() : Math.PI - 0.5 - 0.35 * Math.random();
      } else {
        rx = w * (0.05 + 0.9 * slot) + (Math.random() - 0.5) * 60;
        ry = -20;
        base = Math.PI / 2 + (slot < 0.5 ? 0.45 : -0.45) * (0.4 + 0.6 * Math.random());
      }
      const sc = isFar ? 1.6 : 1;
      const L = Math.min(w, h) * (0.55 + 0.35 * Math.random()) * (isFar ? 1.15 : 1);
      return {
        rx, ry, base,
        curve: (Math.random() - 0.5) * 0.9,
        L, far: isFar, ph: Math.random() * Math.PI * 2,
        xs: new Array(NODES + 1).fill(rx), ys: new Array(NODES + 1).fill(ry), th: new Array(NODES + 1).fill(base),
        leaves: Array.from({ length: (NODES - 3) * 2 }, (_, k) => ({
          node: 3 + Math.floor(k / 2),
          side: k % 2 === 0 ? 1 : -1,
          len: size * sc * (0.75 + 0.5 * Math.random()) * (1 - 0.45 * ((3 + Math.floor(k / 2)) / NODES)),
          ph: Math.random() * Math.PI * 2,
          push: 0,
        })),
      };
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      branches = [
        ...Array.from({ length: far }, (_, i) => make(true, i, far)),
        ...Array.from({ length: near }, (_, i) => make(false, i, near)),
      ];
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      hasPointer = true;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function drawBranch(b: Branch, time: number, a: number) {
      // Racha de viento: sube y baja despacio; las hojas aletean más cuando sopla
      const gust = Math.max(0.2, 0.7 + 0.5 * Math.sin(time * 0.00031 + b.ph) + 0.3 * Math.sin(time * 0.0009 + 1)) * wind;
      const seg = b.L / NODES;
      b.xs[0] = b.rx;
      b.ys[0] = b.ry;
      b.th[0] = b.base;
      for (let i = 1; i <= NODES; i++) {
        const f = i / NODES;
        // La rama se curva y se mece con una onda que viaja hacia la punta
        const th = b.base + b.curve * f + Math.sin(time * 0.0005 + b.ph - i * 0.32) * 0.09 * gust * Math.pow(f, 1.1);
        b.th[i] = th;
        b.xs[i] = b.xs[i - 1] + Math.cos(th) * seg;
        b.ys[i] = b.ys[i - 1] + Math.sin(th) * seg;
      }

      // Rama
      ctx!.beginPath();
      ctx!.moveTo(b.xs[0], b.ys[0]);
      for (let i = 1; i <= NODES; i++) ctx!.lineTo(b.xs[i], b.ys[i]);
      ctx!.lineWidth = lineWidth * (b.far ? 3 : 1.6);
      setAlpha(a * (b.far ? 0.5 : 0.9));
      ctx!.stroke();

      // Hojas
      for (const lf of b.leaves) {
        const nx = b.xs[lf.node];
        const ny = b.ys[lf.node];
        // El puntero las aparta (con easing) y el viento las hace aletear
        if (hasPointer && push > 0) {
          const dx = nx - px;
          const dy = ny - py;
          const d = Math.hypot(dx, dy);
          const R = 150 + lf.len;
          const target = d < R ? Math.pow(1 - d / R, 1.5) * push * (dx >= 0 ? 1 : -1) * lf.side * -1 : 0;
          lf.push += (target - lf.push) * 0.07;
        } else lf.push *= 0.95;
        const flutter = Math.sin(time * 0.0021 + lf.ph) * 0.2 * gust;
        const ang = b.th[lf.node] + lf.side * (1.0 + flutter) + lf.push * 0.9;
        const L = lf.len;
        const Wd = L * 0.34;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        ctx!.setTransform(c, s, -s, c, nx, ny);
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.quadraticCurveTo(L * 0.5, -Wd, L, 0);
        ctx!.quadraticCurveTo(L * 0.5, Wd, 0, 0);
        setAlpha(a * (b.far ? 0.5 : 0.22));
        ctx!.fill();
        if (!b.far) {
          ctx!.lineWidth = lineWidth;
          setAlpha(a * 0.85);
          ctx!.stroke();
          // Nervio central y tres pares de nervios laterales
          ctx!.beginPath();
          ctx!.moveTo(0, 0);
          ctx!.lineTo(L * 0.92, 0);
          for (let k = 1; k <= 3; k++) {
            const x = L * 0.22 * k;
            ctx!.moveTo(x, 0);
            ctx!.lineTo(x + L * 0.14, -Wd * 0.5 * (1 - k * 0.15));
            ctx!.moveTo(x, 0);
            ctx!.lineTo(x + L * 0.14, Wd * 0.5 * (1 - k * 0.15));
          }
          setAlpha(a * 0.4);
          ctx!.stroke();
        }
        ctx!.setTransform(1, 0, 0, 1, 0, 0);
      }
    }

    function animate(time: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--leaves-color").trim() || style.color;
      const k = style.getPropertyValue("--leaves-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      for (const b of branches) drawBranch(b, time, alpha * mul * (b.far ? 0.35 : 1));
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onPointer(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [near, far, size, wind, push, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--leaves-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
