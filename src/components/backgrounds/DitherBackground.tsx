import { useEffect, useRef } from "react";

export interface DitherBackgroundProps {
  /** Tamaño del píxel del tramado (px) */
  cell?: number;
  /** Espacio entre píxeles (px) */
  gap?: number;
  /** Radio del halo del puntero (px) */
  radius?: number;
  /** Densidad máxima del tramado en el centro del halo (0-1) */
  intensity?: number;
  /** Densidad de las nubes ambientales que flotan solas (0-1) */
  ambient?: number;
  /** Velocidad de las nubes ambientales */
  speed?: number;
  /** Suavizado con el que el halo sigue al puntero */
  ease?: number;
  /** Opacidad del tramado (0-1) */
  alpha?: number;
  /** Opcional: fija el color del tramado. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

// Matriz de Bayer normalizada (umbrales entre 0 y 1)
function bayer(size: number) {
  let m = [0];
  const q = [0, 2, 3, 1];
  for (let n = 1; n < size; n *= 2) {
    const w = n * 2;
    const next: number[] = new Array(w * w);
    for (let y = 0; y < w; y++) {
      for (let x = 0; x < w; x++) {
        next[y * w + x] = 4 * m[(y % n) * n + (x % n)] + q[(y >= n ? 2 : 0) + (x >= n ? 1 : 0)];
      }
    }
    m = next;
  }
  return Float32Array.from(m, (v) => (v + 0.5) / (size * size));
}

const THRESHOLD = bayer(8);

export default function DitherBackground({
  cell = 6,
  gap = 1,
  radius = 240,
  intensity = 0.55,
  ambient = 0.18,
  speed = 0.0003,
  ease = 0.1,
  alpha = 0.28,
  color,
  className,
}: DitherBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const OFF = -9999;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let px = OFF;
    let py = OFF;
    let tx = OFF;
    let ty = OFF;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (px === OFF) {
        px = tx;
        py = ty;
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      if (px !== OFF) {
        px += (tx - px) * ease;
        py += (ty - py) * ease;
      }

      const t = time * speed;
      const r2 = radius * radius;
      const reach2 = r2 * 6.25;
      const side = Math.max(1, cell - gap);

      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();

      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--dither-color").trim() || style.color;
      const k = style.getPropertyValue("--dither-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.fillStyle = ink;

      for (let j = 0; j < rows; j++) {
        const y = (j + 0.5) * cell;
        for (let i = 0; i < cols; i++) {
          const x = (i + 0.5) * cell;
          const n = 0.5 + 0.25 * (Math.sin(x * 0.009 + t) * Math.cos(y * 0.011 - t * 0.8) + Math.sin((x - y) * 0.006 + t * 1.3));
          let v = ambient * n * n;
          if (px !== OFF) {
            const dx = x - px;
            const dy = y - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < reach2) v += intensity * Math.exp(-d2 / r2);
          }
          if (v > THRESHOLD[(j & 7) * 8 + (i & 7)]) ctx!.rect(i * cell, j * cell, side, side);
        }
      }

      setAlpha(alpha * mul);
      ctx!.fill();
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
  }, [cell, gap, radius, intensity, ambient, speed, ease, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--dither-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
