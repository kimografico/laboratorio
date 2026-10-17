import { useEffect, useRef } from "react";

export interface KelpBackgroundProps {
  /** Algas cercanas: con contorno, grosor completo y una nervadura central */
  near?: number;
  /** Algas lejanas: más cortas y finas, solo una silueta tenue sin contorno */
  far?: number;
  /** Altura de las algas más altas, como fracción del lado menor del contenedor */
  length?: number;
  /** Grosor en la base de las algas más cercanas (px) */
  width?: number;
  /** Segmentos por alga: más segmentos, curvas más suaves */
  segments?: number;
  /** Intensidad de la corriente que las mece (1 = normal, 0 = quietas) */
  current?: number;
  /** Distancia a la que el puntero las aparta, como un nadador que pasa (px) */
  avoid?: number;
  /** Opacidad del contorno de las más cercanas (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color de las algas. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Frond = {
  rx: number;
  ry: number;
  lean: number;
  depth: number;
  far: boolean;
  L: number;
  width: number;
  phase: number;
  speed: number;
  theta: number[];
  xs: number[];
  ys: number[];
};

const UP = -Math.PI / 2;
const diff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export default function KelpBackground({
  near = 16,
  far = 27,
  length = 0.85,
  width = 25,
  segments = 45,
  current = 1.3,
  avoid = 180,
  alpha = 0.28,
  lineWidth = 1.1,
  color,
  className,
}: KelpBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const n = Math.round(segments);
    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let mul = 1;
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let fronds: Frond[] = [];
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      // Se mezclan cercanas y lejanas para que las lejanas queden repartidas entre las cercanas
      const kinds: boolean[] = [...Array(near).fill(false), ...Array(far).fill(true)];
      for (let i = kinds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
      }
      fronds = kinds
        .map((isFar, k) => {
          const depth = isFar ? 0.3 + 0.15 * Math.random() : 0.65 + 0.35 * Math.random(); // 0.3 = lejos, 1 = cerca
          const rx = w * ((k + Math.random()) / kinds.length);
          const ry = h + 6;
          const lean = (Math.random() - 0.5) * 0.3;
          return {
            rx,
            ry,
            lean,
            depth,
            far: isFar,
            L: length * Math.min(w, h) * (0.45 + 0.8 * Math.random()) * (0.55 + 0.45 * depth),
            width: width * (0.5 + 0.5 * depth),
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + 0.6 * depth, // las lejanas se mecen más despacio
            theta: new Array(n + 1).fill(UP + lean),
            xs: new Array(n + 1).fill(rx),
            ys: new Array(n + 1).fill(ry),
          };
        })
        .sort((a, b) => a.depth - b.depth); // las lejanas se dibujan primero
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
    }

    // Corriente de fondo: una ola lenta compartida, con desfase según la posición (las vecinas se mecen juntas)
    const sway = (x: number, time: number) =>
      Math.sin(time * 0.0006 + x * 0.004) * 0.6 + Math.sin(time * 0.0011 + x * 0.0017 + 1.3) * 0.3;

    function update(f: Frond, time: number) {
      const seg = f.L / n;
      f.xs[0] = f.rx;
      f.ys[0] = f.ry;
      f.theta[0] = UP + f.lean;
      for (let i = 1; i <= n; i++) {
        const fr = i / n;
        // Más flexibles hacia la punta: la corriente las dobla más cuanto más arriba
        let bend =
          (sway(f.xs[i - 1], time) * 0.07 + Math.sin(time * 0.0009 * f.speed - i * 0.25 + f.phase) * 0.03) *
          current *
          (0.3 + fr);
        bend += diff(f.theta[i - 1], UP) * 0.05; // la elasticidad las endereza
        // El puntero las aparta hacia un lado, como un nadador que pasa
        const dxp = f.xs[i - 1] - px;
        const dyp = f.ys[i - 1] - py;
        const d = Math.hypot(dxp, dyp);
        if (d < avoid) {
          const k = 1 - d / avoid;
          bend += (dxp / (Math.abs(dxp) + 24)) * k * k * 0.22;
        }
        f.theta[i] += diff(f.theta[i], f.theta[i - 1] + bend) * 0.25;
        f.xs[i] = f.xs[i - 1] + Math.cos(f.theta[i]) * seg;
        f.ys[i] = f.ys[i - 1] + Math.sin(f.theta[i]) * seg;
      }
    }

    // Contorno de hoja: ancho en la base y punta afilada
    function blade(xs: number[], ys: number[], hw: number[]) {
      const m = xs.length;
      const lx: number[] = [], ly: number[] = [], rx: number[] = [], ry: number[] = [];
      for (let i = 0; i < m; i++) {
        const i0 = Math.max(0, i - 1);
        const i1 = Math.min(m - 1, i + 1);
        const dx = xs[i1] - xs[i0];
        const dy = ys[i1] - ys[i0];
        const d = Math.hypot(dx, dy) || 1;
        const nx = -dy / d;
        const ny = dx / d;
        lx.push(xs[i] + nx * hw[i]);
        ly.push(ys[i] + ny * hw[i]);
        rx.push(xs[i] - nx * hw[i]);
        ry.push(ys[i] - ny * hw[i]);
      }
      ctx!.beginPath();
      ctx!.moveTo(lx[0], ly[0]);
      for (let i = 1; i < m; i++) ctx!.lineTo(lx[i], ly[i]);
      for (let i = m - 1; i >= 0; i--) ctx!.lineTo(rx[i], ry[i]);
      ctx!.closePath();
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function draw(f: Frond) {
      const a = alpha * mul * (0.15 + 0.85 * Math.pow(f.depth, 1.4));
      const hw = f.xs.map((_, i) => (f.width / 2) * Math.pow(1 - i / n, 0.85) * (1 + 0.15 * Math.sin(i * 0.9 + f.phase)) + 0.15);
      ctx!.lineWidth = lineWidth * (0.5 + 0.5 * f.depth);
      blade(f.xs, f.ys, hw);
      if (f.far) {
        // Las lejanas son solo una silueta tenue, sin contorno
        setAlpha(alpha * mul * 0.2);
        ctx!.fill();
        return;
      }
      setAlpha(a * 0.2);
      ctx!.fill();
      setAlpha(a);
      ctx!.stroke();
      // Nervadura central, algo más tenue
      ctx!.beginPath();
      ctx!.moveTo(f.xs[0], f.ys[0]);
      for (let i = 1; i < Math.floor(n * 0.85); i++) ctx!.lineTo(f.xs[i], f.ys[i]);
      setAlpha(a * 0.5);
      ctx!.stroke();
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--kelp-color").trim() || style.color;
      const k = style.getPropertyValue("--kelp-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      for (const f of fronds) {
        update(f, time);
        draw(f);
      }
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
  }, [near, far, length, width, segments, current, avoid, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--kelp-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
