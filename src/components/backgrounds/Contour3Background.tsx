import { useEffect, useRef } from "react";

export interface Contour3BackgroundProps {
  /** Resolución de la malla (px): más bajo = curvas más suaves pero más costoso */
  cell?: number;
  /** Número de curvas de nivel */
  levels?: number;
  /** Escala del relieve: más bajo = colinas más amplias */
  scale?: number;
  /** Velocidad a la que se transforma el relieve */
  speed?: number;
  /** Altura de la colina que levanta el puntero */
  bump?: number;
  /** Radio de la colina (px) */
  radius?: number;
  /** Suavizado con el que la colina sigue al puntero */
  ease?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

// Aristas de una celda: 0 = arriba, 1 = derecha, 2 = abajo, 3 = izquierda
const CASES: number[][] = [[], [3, 2], [2, 1], [3, 1], [0, 1], [], [0, 2], [3, 0], [3, 0], [0, 2], [], [0, 1], [3, 1], [2, 1], [3, 2], []];

function ex(e: number, x0: number, s: number, L: number, a: number, b: number, c: number, d: number) {
  return e === 0 ? x0 + (s * (L - a)) / (b - a) : e === 1 ? x0 + s : e === 2 ? x0 + (s * (L - d)) / (c - d) : x0;
}

function ey(e: number, y0: number, s: number, L: number, a: number, b: number, c: number, d: number) {
  return e === 0 ? y0 : e === 1 ? y0 + (s * (L - b)) / (c - b) : e === 2 ? y0 + s : y0 + (s * (L - a)) / (d - a);
}

export default function Contour3Background({
  cell = 12,
  levels = 9,
  scale = 0.005,
  speed = 0.0003,
  bump = 1.2,
  radius = 170,
  ease = 0.12,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.22)",
  background = "#e0dad5",
  className,
}: Contour3BackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const OFF = -9999;
    const lo = -0.8;
    const step = 0.3;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);
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
      field = new Float32Array((cols + 1) * (rows + 1));
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

    function sample(time: number) {
      const t = time * speed;
      const r2 = radius * radius;
      const reach2 = r2 * 9;
      for (let j = 0; j <= rows; j++) {
        const y = j * cell;
        for (let i = 0; i <= cols; i++) {
          const x = i * cell;
          let v =
            (Math.sin(x * scale + t) * Math.cos(y * scale * 1.3 - t * 0.7) +
              0.5 * Math.sin((x + y) * scale * 0.7 + t * 1.3)) /
            1.5;
          if (px !== OFF) {
            const dx = x - px;
            const dy = y - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < reach2) v += bump * Math.exp(-d2 / r2);
          }
          field[j * (cols + 1) + i] = v;
        }
      }
    }

    function animate(time: number) {
      if (px !== OFF) {
        px += (tx - px) * ease;
        py += (ty - py) * ease;
      }
      sample(time);

      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.lineCap = "round";
      const stride = cols + 1;

      for (let k = 0; k < levels; k++) {
        const L = lo + k * step;
        ctx!.beginPath();
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const i0 = j * stride + i;
            const a = field[i0];
            const b = field[i0 + 1];
            const d = field[i0 + stride];
            const c = field[i0 + stride + 1];
            const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
            if (idx === 0 || idx === 15) continue;

            let pairs = CASES[idx];
            if (idx === 5 || idx === 10) {
              const inside = (a + b + c + d) / 4 > L;
              pairs = inside === (idx === 5) ? [3, 0, 2, 1] : [0, 1, 3, 2];
            }

            const x0 = i * cell;
            const y0 = j * cell;
            for (let p = 0; p < pairs.length; p += 2) {
              const e1 = pairs[p];
              const e2 = pairs[p + 1];
              ctx!.moveTo(ex(e1, x0, cell, L, a, b, c, d), ey(e1, y0, cell, L, a, b, c, d));
              ctx!.lineTo(ex(e2, x0, cell, L, a, b, c, d), ey(e2, y0, cell, L, a, b, c, d));
            }
          }
        }
        ctx!.globalAlpha = k % 3 === 0 ? 1 : 0.55;
        ctx!.lineWidth = k % 3 === 0 ? lineWidth * 1.2 : lineWidth;
        ctx!.stroke();
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
  }, [cell, levels, scale, speed, bump, radius, ease, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
