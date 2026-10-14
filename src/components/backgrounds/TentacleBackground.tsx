import { useEffect, useRef } from "react";

export interface TentacleBackgroundProps {
  /** Tentáculos cercanos: con contorno, grosor completo y ventosas */
  near?: number;
  /** Tentáculos lejanos: más cortos, finos y lentos, solo una silueta tenue */
  far?: number;
  /** Longitud del tentáculo más cercano, como fracción del lado menor del contenedor */
  length?: number;
  /** Grosor en la base del tentáculo más cercano (px) */
  width?: number;
  /** Segmentos por tentáculo: más segmentos, curvas más suaves */
  segments?: number;
  /** Suavizado con el que se orientan hacia el puntero: cuanto más bajo, más lento */
  chase?: number;
  /** Distancia a la que notan el puntero, en longitudes de tentáculo */
  reach?: number;
  /** Enroscado de la punta (radianes por segmento) */
  curl?: number;
  /** Amplitud de las tres ondulaciones combinadas */
  wave?: number;
  /** Ancho de la punta relativo a la base (0-1) */
  tip?: number;
  /** Opacidad del contorno de los más cercanos (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color de los tentáculos. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Tentacle = {
  rx: number;
  ry: number;
  inward: number;
  depth: number;
  far: boolean;
  L: number;
  width: number;
  phase: number;
  curlSign: number;
  speed: number;
  theta: number[];
  xs: number[];
  ys: number[];
};

const diff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export default function TentacleBackground({
  near = 8,
  far = 4,
  length = 0.45,
  width = 38,
  segments = 32,
  chase = 0.012,
  reach = 2,
  curl = 0.12,
  wave = 0.08,
  tip = 0.25,
  alpha = 0.28,
  lineWidth = 1.2,
  color,
  className,
}: TentacleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const n = Math.round(segments);
    const style = getComputedStyle(canvas);
    let mul = 1;

    let widthPx = 0;
    let heightPx = 0;
    let px = -9999;
    let py = -9999;
    let hasPointer = false;
    let tentacles: Tentacle[] = [];
    let raf = 0;

    function resize() {
      widthPx = canvas.clientWidth;
      heightPx = canvas.clientHeight;
      canvas.width = widthPx;
      canvas.height = heightPx;
      const kinds: boolean[] = [...Array(near).fill(false), ...Array(far).fill(true)];
      for (let i = kinds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
      }
      tentacles = kinds
        .map((isFar, k) => {
          const depth = isFar ? 0.3 + 0.15 * Math.random() : 0.65 + 0.35 * Math.random();
          const rx = widthPx * ((k + Math.random()) / kinds.length);
          const ry = -8;
          const inward = Math.PI / 2 + (Math.random() - 0.5) * 0.7;
          return {
            rx,
            ry,
            inward,
            depth,
            far: isFar,
            L: length * Math.min(widthPx, heightPx) * (0.5 + 0.8 * depth),
            width: width * (0.45 + 0.65 * depth),
            phase: Math.random() * Math.PI * 2,
            curlSign: Math.random() < 0.5 ? -1 : 1,
            speed: 0.5 + 0.7 * depth,
            theta: new Array(n + 1).fill(inward),
            xs: new Array(n + 1).fill(rx),
            ys: new Array(n + 1).fill(ry),
          };
        })
        .sort((a, b) => a.depth - b.depth);
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      hasPointer = true;
    }

    function update(t: Tentacle, time: number) {
      const seg = t.L / n;
      const rest = t.inward + Math.sin(time * 0.0002 * t.speed + t.phase) * 0.5;
      let target = rest;
      let weight = 0;
      if (hasPointer) {
        const dx = px - t.rx;
        const dy = py - t.ry;
        weight = Math.pow(Math.max(0, 1 - Math.hypot(dx, dy) / (t.L * reach)), 0.7);
        const d = Math.max(-1.3, Math.min(1.3, diff(rest, Math.atan2(dy, dx))));
        target = rest + d * weight;
      }
      t.theta[0] += diff(t.theta[0], target) * chase * t.speed;
      t.xs[0] = t.rx;
      t.ys[0] = t.ry;
      const curlNow = curl * t.curlSign * (0.6 + 0.4 * Math.sin(time * 0.0004 + t.phase));
      for (let i = 1; i <= n; i++) {
        const f = i / n;
        let bend =
          Math.sin(time * 0.0008 * t.speed - i * 0.3 + t.phase) * wave +
          Math.sin(time * 0.0011 * t.speed - i * 0.2 + t.phase * 2.3) * wave * 0.6 +
          Math.sin(time * 0.0005 * t.speed - i * 0.12 + t.phase * 1.7) * wave * 0.8 +
          curlNow * f * f;
        if (weight > 0)
          bend += diff(t.theta[i - 1], Math.atan2(py - t.ys[i - 1], px - t.xs[i - 1])) * weight * 0.09 * f;
        t.theta[i] += diff(t.theta[i], t.theta[i - 1] + bend) * 0.25;
        t.xs[i] = t.xs[i - 1] + Math.cos(t.theta[i]) * seg;
        t.ys[i] = t.ys[i - 1] + Math.sin(t.theta[i]) * seg;
      }
    }

    function tapered(xs: number[], ys: number[], hw: number[]) {
      const m = xs.length;
      const lx: number[] = [],
        ly: number[] = [],
        rx: number[] = [],
        ry: number[] = [];
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
      const heading = Math.atan2(ys[m - 1] - ys[m - 2], xs[m - 1] - xs[m - 2]);
      ctx!.arc(xs[m - 1], ys[m - 1], hw[m - 1], heading + Math.PI / 2, heading - Math.PI / 2, true);
      for (let i = m - 2; i >= 0; i--) ctx!.lineTo(rx[i], ry[i]);
      ctx!.closePath();
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function draw(t: Tentacle) {
      const a = alpha * mul * (0.15 + 0.85 * Math.pow(t.depth, 1.4));
      const hw = t.xs.map((_, i) => (t.width / 2) * (tip + (1 - tip) * Math.pow(1 - i / n, 0.8)));
      ctx!.lineWidth = lineWidth * (0.5 + 0.5 * t.depth);
      tapered(t.xs, t.ys, hw);
      if (t.far) {
        setAlpha(alpha * mul * 0.2);
        ctx!.fill();
        return;
      }
      setAlpha(a * 0.2);
      ctx!.fill();
      setAlpha(a);
      ctx!.stroke();
      {
        ctx!.beginPath();
        for (let i = 2; i < n - 1; i++) {
          const dx = t.xs[i + 1] - t.xs[i - 1];
          const dy = t.ys[i + 1] - t.ys[i - 1];
          const d = Math.hypot(dx, dy) || 1;
          const nx = -dy / d;
          const ny = dx / d;
          const off = hw[i] * 0.46;
          const r = Math.max(0.7, hw[i] * 0.24);
          const lx = t.xs[i] + nx * off;
          const ly = t.ys[i] + ny * off;
          const rx = (t.xs[i] + t.xs[i + 1]) / 2 - nx * off;
          const ry = (t.ys[i] + t.ys[i + 1]) / 2 - ny * off;
          ctx!.moveTo(lx + r, ly);
          ctx!.arc(lx, ly, r, 0, Math.PI * 2);
          ctx!.moveTo(rx + r, ry);
          ctx!.arc(rx, ry, r, 0, Math.PI * 2);
        }
        setAlpha(a * 0.75);
        ctx!.stroke();
      }
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, widthPx, heightPx);
      const ink = style.getPropertyValue("--tentacle-color").trim() || style.color;
      const k = style.getPropertyValue("--tentacle-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      for (const t of tentacles) {
        update(t, time);
        draw(t);
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
  }, [near, far, length, width, segments, chase, reach, curl, wave, tip, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--tentacle-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
