import { useEffect, useRef } from "react";

export interface TuringBackgroundProps {
  /** Tamaño de cada celda de la simulación (px): más alto, más rápido y menos definido */
  cell?: number;
  /** Pasos de simulación por fotograma: más pasos, el patrón crece más deprisa */
  steps?: number;
  /** Tasa de alimentación de Gray-Scott (con kill = 0.062: ~0.04 manchas, ~0.055 laberintos y coral) */
  feed?: number;
  /** Tasa de eliminación de Gray-Scott */
  kill?: number;
  /** Radio del pincel con el que el puntero borra el patrón (en celdas); el patrón vuelve a crecer desde los bordes */
  brush?: number;
  /** Semillas nuevas por segundo que aparecen solas */
  spark?: number;
  /** Opacidad del patrón (0-1) */
  opacity?: number;
  color?: string;
  background?: string;
  className?: string;
}

function parseColor(color: string): [number, number, number] {
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.fillStyle = color;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

const DU = 1;
const DV = 0.5;

export default function TuringBackground({
  cell = 6,
  steps = 6,
  feed = 0.0545,
  kill = 0.062,
  brush = 3,
  spark = 0.15,
  opacity = 0.8,
  color = "#3b2f2a",
  background = "#e0dad5",
  className,
}: TuringBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    const [cr, cg, cb] = parseColor(color);

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let a0 = new Float32Array(0);
    let b0 = new Float32Array(0);
    let a1 = new Float32Array(0);
    let b1 = new Float32Array(0);
    let fm = new Float32Array(0);
    let lastX = -1;
    let lastY = -1;
    let acc = 0;
    let last = -1;
    let raf = 0;

    // Mancha de producto químico B (y menos A) de radio r celdas centrada en (ci, cj)
    function seed(ci: number, cj: number, r: number) {
      for (let dj = -r; dj <= r; dj++) {
        for (let di = -r; di <= r; di++) {
          const d = Math.hypot(di, dj);
          if (d > r) continue;
          const i = (ci + di + cols) % cols;
          const j = (cj + dj + rows) % rows;
          const k = j * cols + i;
          const val = 1 - d / (r + 1);
          b0[k] = Math.max(b0[k], val);
          a0[k] = Math.min(a0[k], 1 - 0.7 * val);
        }
      }
    }

    // Borra el patrón en un círculo de r celdas: vuelve a crecer desde el patrón que queda alrededor
    function clearAt(ci: number, cj: number, r: number) {
      for (let dj = -r; dj <= r; dj++) {
        for (let di = -r; di <= r; di++) {
          if (Math.hypot(di, dj) > r) continue;
          const k = ((cj + dj + rows) % rows) * cols + ((ci + di + cols) % cols);
          b0[k] = 0;
          a0[k] = 1;
        }
      }
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.max(4, Math.ceil(width / cell));
      rows = Math.max(4, Math.ceil(height / cell));
      off.width = cols;
      off.height = rows;
      a0 = new Float32Array(cols * rows).fill(1);
      b0 = new Float32Array(cols * rows);
      a1 = new Float32Array(cols * rows);
      b1 = new Float32Array(cols * rows);
      fm = new Float32Array(cols);
      for (let n = 0; n < 10; n++) seed(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 3 + Math.floor(Math.random() * 3));
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const n = lastX < 0 ? 1 : Math.max(1, Math.ceil(Math.hypot(x - lastX, y - lastY) / (cell * brush)));
      for (let s = 1; s <= n; s++) {
        const sx = lastX < 0 ? x : lastX + ((x - lastX) * s) / n;
        const sy = lastX < 0 ? y : lastY + ((y - lastY) * s) / n;
        clearAt(Math.floor(sx / cell), Math.floor(sy / cell), brush);
      }
      lastX = x;
      lastY = y;
    }

    // Un paso de Gray-Scott con laplaciano de 9 puntos y bordes que se enlazan
    function step() {
      for (let j = 0; j < rows; j++) {
        const jm = ((j - 1 + rows) % rows) * cols;
        const jc = j * cols;
        const jp = ((j + 1) % rows) * cols;
        for (let i = 0; i < cols; i++) {
          const im = (i - 1 + cols) % cols;
          const ip = (i + 1) % cols;
          const k = jc + i;
          const a = a0[k];
          const b = b0[k];
          const la = 0.2 * (a0[jc + im] + a0[jc + ip] + a0[jm + i] + a0[jp + i]) + 0.05 * (a0[jm + im] + a0[jm + ip] + a0[jp + im] + a0[jp + ip]) - a;
          const lb = 0.2 * (b0[jc + im] + b0[jc + ip] + b0[jm + i] + b0[jp + i]) + 0.05 * (b0[jm + im] + b0[jm + ip] + b0[jp + im] + b0[jp + ip]) - b;
          const abb = a * b * b;
          const f = fm[i];
          const na = a + DU * la - abb + f * (1 - a);
          const nb = b + DV * lb + abb - (kill + f) * b;
          a1[k] = na < 0 ? 0 : na > 1 ? 1 : na;
          b1[k] = nb < 0 ? 0 : nb > 1 ? 1 : nb;
        }
      }
      let t = a0;
      a0 = a1;
      a1 = t;
      t = b0;
      b0 = b1;
      b1 = t;
    }

    function animate(time: number) {
      const dt = last < 0 ? 16.67 : Math.min(time - last, 50);
      last = time;

      // La tasa de alimentación oscila despacio en el espacio y el tiempo: el patrón se transforma, no se congela
      for (let i = 0; i < cols; i++) fm[i] = feed + 0.004 * Math.sin((i / cols) * 8.2 + time * 0.0002);

      acc += (dt * spark) / 1000;
      while (acc >= 1) {
        seed(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 3);
        acc -= 1;
      }

      for (let s = 0; s < steps; s++) step();

      const img = octx!.createImageData(cols, rows);
      const data = img.data;
      for (let i = 0; i < b0.length; i++) {
        const t = Math.min(1, Math.max(0, (b0[i] - 0.1) / 0.22));
        data[4 * i] = cr;
        data[4 * i + 1] = cg;
        data[4 * i + 2] = cb;
        data[4 * i + 3] = t * t * (3 - 2 * t) * opacity * 255;
      }
      octx!.putImageData(img, 0, 0);

      ctx!.clearRect(0, 0, width, height);
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "high";
      ctx!.drawImage(off, 0, 0, cols, rows, 0, 0, width, height);

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
  }, [cell, steps, feed, kill, brush, spark, opacity, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
