import { useEffect, useRef } from "react";

export interface LifeBackgroundProps {
  /** Tamaño de la celda (px) */
  cell?: number;
  /** Milisegundos entre generaciones: más alto, más lento */
  tick?: number;
  /** Radio del pincel del puntero (en celdas) */
  brush?: number;
  /** Fracción de celdas vivas al empezar (0-1) */
  seed?: number;
  /** Probabilidad por generación de que aparezca un grupo nuevo de celdas (0-1) */
  spark?: number;
  /** Opacidad de las celdas vivas (0-1) */
  alpha?: number;
  /** Opcional: fija el color de las celdas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

export default function LifeBackground({
  cell = 10,
  tick = 140,
  brush = 2,
  seed = 0.05,
  spark = 0.01,
  alpha = 0.3,
  color,
  className,
}: LifeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let alive = new Uint8Array(0);
    let next = new Uint8Array(0);
    let shown = new Float32Array(0);
    let lastX = -1;
    let lastY = -1;
    let acc = 0;
    let last = -1;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
      alive = new Uint8Array(cols * rows);
      next = new Uint8Array(cols * rows);
      shown = new Float32Array(cols * rows);
      for (let i = 0; i < alive.length; i++) alive[i] = Math.random() < seed ? 1 : 0;
    }

    function paint(x: number, y: number) {
      const ci = Math.floor(x / cell);
      const cj = Math.floor(y / cell);
      for (let dj = -brush; dj <= brush; dj++) {
        for (let di = -brush; di <= brush; di++) {
          if (di * di + dj * dj > brush * brush || Math.random() > 0.5) continue;
          const i = ci + di;
          const j = cj + dj;
          if (i >= 0 && i < cols && j >= 0 && j < rows) alive[j * cols + i] = 1;
        }
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (lastX < 0) {
        paint(x, y);
      } else {
        const steps = Math.max(1, Math.ceil(Math.hypot(x - lastX, y - lastY) / cell));
        for (let s = 1; s <= steps; s++) paint(lastX + ((x - lastX) * s) / steps, lastY + ((y - lastY) * s) / steps);
      }
      lastX = x;
      lastY = y;
    }

    function step() {
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          let n = 0;
          for (let dj = -1; dj <= 1; dj++) {
            const jj = (j + dj + rows) % rows;
            for (let di = -1; di <= 1; di++) {
              if (di === 0 && dj === 0) continue;
              n += alive[jj * cols + ((i + di + cols) % cols)];
            }
          }
          const idx = j * cols + i;
          next[idx] = n === 3 || (alive[idx] === 1 && n === 2) ? 1 : 0;
        }
      }
      const tmp = alive;
      alive = next;
      next = tmp;

      if (Math.random() < spark) {
        const i0 = Math.floor(Math.random() * cols);
        const j0 = Math.floor(Math.random() * rows);
        for (const [dx, dy] of [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]]) {
          alive[((j0 + dy) % rows) * cols + ((i0 + dx) % cols)] = 1;
        }
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      const dt = last < 0 ? 0 : Math.min(time - last, 100);
      last = time;
      acc += dt;
      while (acc >= tick) {
        step();
        acc -= tick;
      }

      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--life-color").trim() || style.color;
      const k = style.getPropertyValue("--life-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.fillStyle = ink;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i;
          const on = alive[idx] === 1;
          shown[idx] += ((on ? 1 : 0) - shown[idx]) * (on ? 0.4 : 0.06);
          const a = shown[idx];
          if (a < 0.03) continue;
          const s = (cell - 2) * (0.5 + 0.5 * a);
          setAlpha(a * alpha * mul);
          ctx!.fillRect(i * cell + (cell - s) / 2, j * cell + (cell - s) / 2, s, s);
        }
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
  }, [cell, tick, brush, seed, spark, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--life-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
