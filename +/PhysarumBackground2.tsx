import { useEffect, useRef } from "react";

export interface PhysarumBackgroundProps {
  /** Número de agentes (cada uno deja un rastro y sigue los de los demás) */
  agents?: number;
  /** Tamaño de cada celda del mapa de rastros (px): más alto, más rápido y menos definido */
  cell?: number;
  /** Distancia a la que cada agente huele el rastro (en celdas) */
  sensor?: number;
  /** Ángulo entre los sensores laterales y el frontal (radianes) */
  sensorAngle?: number;
  /** Ángulo que gira el agente en cada paso (radianes) */
  turn?: number;
  /** Fracción del rastro que se conserva por fotograma (0.9 se borra rápido, 0.98 dura mucho) */
  persistence?: number;
  /** Fuerza del "alimento" que el puntero deja y que atrae a los agentes */
  lure?: number;
  /** Radio del alimento del puntero (en celdas) */
  lureRadius?: number;
  /** Opacidad de las venas (0-1) */
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

const TAU = Math.PI * 2;

export default function PhysarumBackground({
  agents = 3500,
  cell = 5,
  sensor = 4,
  sensorAngle = 0.6,
  turn = 0.5,
  persistence = 0.94,
  lure = 1.5,
  lureRadius = 6,
  opacity = 0.8,
  color = "#7a4a1d",
  background = "#e0dad5",
  className,
}: PhysarumBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    const [cr, cg, cb] = parseColor(color);
    const OFF = -9999;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let t0 = new Float32Array(0);
    let t1 = new Float32Array(0);
    const ax = new Float32Array(agents);
    const ay = new Float32Array(agents);
    const aa = new Float32Array(agents);
    let px = OFF;
    let py = OFF;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.max(4, Math.ceil(width / cell));
      rows = Math.max(4, Math.ceil(height / cell));
      off.width = cols;
      off.height = rows;
      t0 = new Float32Array(cols * rows);
      t1 = new Float32Array(cols * rows);
      for (let i = 0; i < agents; i++) {
        ax[i] = Math.random() * cols;
        ay[i] = Math.random() * rows;
        aa[i] = Math.random() * TAU;
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = (clientX - rect.left) / cell;
      py = (clientY - rect.top) / cell;
    }

    // Rastro en el punto (x, y) con los bordes enlazados
    function sample(x: number, y: number) {
      const i = ((Math.floor(x) % cols) + cols) % cols;
      const j = ((Math.floor(y) % rows) + rows) % rows;
      return t0[j * cols + i];
    }

    function step() {
      for (let n = 0; n < agents; n++) {
        const a = aa[n];
        const l = sample(ax[n] + Math.cos(a - sensorAngle) * sensor, ay[n] + Math.sin(a - sensorAngle) * sensor);
        const c = sample(ax[n] + Math.cos(a) * sensor, ay[n] + Math.sin(a) * sensor);
        const r = sample(ax[n] + Math.cos(a + sensorAngle) * sensor, ay[n] + Math.sin(a + sensorAngle) * sensor);
        if (c > l && c > r) {
          // sigue recto
        } else if (c < l && c < r) {
          aa[n] += (Math.random() < 0.5 ? -1 : 1) * turn;
        } else if (l > r) {
          aa[n] -= turn;
        } else if (r > l) {
          aa[n] += turn;
        }
        ax[n] = (ax[n] + Math.cos(aa[n]) + cols) % cols;
        ay[n] = (ay[n] + Math.sin(aa[n]) + rows) % rows;
        t0[Math.floor(ay[n]) * cols + Math.floor(ax[n])] += 0.6;
      }

      // El alimento del puntero: un montículo de rastro que atrae a los agentes
      if (px !== OFF) {
        const r = lureRadius;
        for (let dj = -r; dj <= r; dj++) {
          for (let di = -r; di <= r; di++) {
            const d = Math.hypot(di, dj);
            if (d > r) continue;
            const i = (((Math.floor(px) + di) % cols) + cols) % cols;
            const j = (((Math.floor(py) + dj) % rows) + rows) % rows;
            t0[j * cols + i] += lure * (1 - d / r);
          }
        }
      }

      // Difusión (mezcla con el promedio de 3x3) y evaporación
      for (let j = 0; j < rows; j++) {
        const jm = ((j - 1 + rows) % rows) * cols;
        const jc = j * cols;
        const jp = ((j + 1) % rows) * cols;
        for (let i = 0; i < cols; i++) {
          const im = (i - 1 + cols) % cols;
          const ip = (i + 1) % cols;
          const avg =
            (t0[jm + im] + t0[jm + i] + t0[jm + ip] + t0[jc + im] + t0[jc + i] + t0[jc + ip] + t0[jp + im] + t0[jp + i] + t0[jp + ip]) / 9;
          t1[jc + i] = (t0[jc + i] * 0.65 + avg * 0.35) * persistence;
        }
      }
      const tmp = t0;
      t0 = t1;
      t1 = tmp;
    }

    function animate() {
      step();

      const img = octx!.createImageData(cols, rows);
      const d = img.data;
      for (let i = 0; i < t0.length; i++) {
        const t = Math.min(1, Math.max(0, (t0[i] - 0.3) / 2.5));
        d[4 * i] = cr;
        d[4 * i + 1] = cg;
        d[4 * i + 2] = cb;
        d[4 * i + 3] = Math.pow(t, 1.2) * opacity * 255;
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
  }, [agents, cell, sensor, sensorAngle, turn, persistence, lure, lureRadius, opacity, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
