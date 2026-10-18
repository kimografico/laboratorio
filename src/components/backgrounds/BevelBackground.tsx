import { useEffect, useRef } from "react";

export interface BevelBackgroundProps {
  /** Tamaño de cada baldosa (px) */
  size?: number;
  /** Separación entre baldosas (px) */
  gap?: number;
  /** Disposición: "grid" en cuadrícula o "brick" con las filas alternas desplazadas medio ladrillo */
  layout?: "grid" | "brick";
  /** Distancia hasta la que alumbra el puntero (px) */
  radius?: number;
  /** Altura de la luz sobre el plano, como fracción del radio: más alta, luz más uniforme y menos rasante */
  lightHeight?: number;
  /** Intensidad de la luz (0-2) */
  intensity?: number;
  /** Brillo de los bordes sin luz (0-1) */
  ambient?: number;
  /** Grosor del bisel (px) */
  bevel?: number;
  /** Suavizado con el que la luz sigue al puntero */
  ease?: number;
  color?: string;
  background?: string;
  className?: string;
}

const BUCKETS = 12;

export default function BevelBackground({
  size = 56,
  gap = 6,
  layout = "grid",
  radius = 280,
  lightHeight = 0.35,
  intensity = 1,
  ambient = 0.07,
  bevel = 2,
  ease = 0.15,
  color = "rgba(255, 255, 255, 1)",
  background = "#3a3633",
  className,
}: BevelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const OFF = -9999;
    const K = Math.SQRT1_2;

    let width = 0;
    let height = 0;
    let n = 0;
    // Cuatro aristas por baldosa: extremos, punto medio y normal exterior (en el plano)
    let ex1 = new Float32Array(0);
    let ey1 = new Float32Array(0);
    let ex2 = new Float32Array(0);
    let ey2 = new Float32Array(0);
    let emx = new Float32Array(0);
    let emy = new Float32Array(0);
    let enx = new Float32Array(0);
    let eny = new Float32Array(0);
    let segs: Float32Array[] = [];
    let counts = new Int32Array(BUCKETS);
    let px = OFF;
    let py = OFF;
    let tx = OFF;
    let ty = OFF;
    let pointer = false;
    let raf = 0;

    function build() {
      const step = size + gap;
      const cols = Math.ceil(width / step) + 2;
      const rows = Math.ceil(height / step) + 2;
      n = cols * rows * 4;
      ex1 = new Float32Array(n);
      ey1 = new Float32Array(n);
      ex2 = new Float32Array(n);
      ey2 = new Float32Array(n);
      emx = new Float32Array(n);
      emy = new Float32Array(n);
      enx = new Float32Array(n);
      eny = new Float32Array(n);
      segs = Array.from({ length: BUCKETS }, () => new Float32Array(n * 4));
      let e = 0;
      for (let j = -1; j < rows - 1; j++) {
        const shift = layout === "brick" && j % 2 !== 0 ? step / 2 : 0;
        for (let i = -1; i < cols - 1; i++) {
          const x = i * step + shift;
          const y = j * step;
          const edges = [
            [x, y, x + size, y, 0, -1],
            [x + size, y, x + size, y + size, 1, 0],
            [x, y + size, x + size, y + size, 0, 1],
            [x, y, x, y + size, -1, 0],
          ];
          for (const [a, b, c, d, nx, ny] of edges) {
            ex1[e] = a;
            ey1[e] = b;
            ex2[e] = c;
            ey2[e] = d;
            emx[e] = (a + c) / 2;
            emy[e] = (b + d) / 2;
            enx[e] = nx;
            eny[e] = ny;
            e++;
          }
        }
      }
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      build();
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      pointer = true;
      if (px === OFF) {
        px = tx;
        py = ty;
      }
    }

    function animate(time: number) {
      // Sin puntero, la luz recorre el contenedor sola para que el efecto se vea
      if (!pointer) {
        tx = width * (0.5 + 0.35 * Math.sin(time * 0.0004));
        ty = height * (0.5 + 0.3 * Math.sin(time * 0.00031 + 1));
      }
      if (px === OFF) {
        px = tx;
        py = ty;
      }
      px += (tx - px) * ease;
      py += (ty - py) * ease;

      const lz = lightHeight * radius;
      const reach = radius * 2;
      counts.fill(0);
      for (let e = 0; e < n; e++) {
        const dx = px - emx[e];
        const dy = py - emy[e];
        const d2 = dx * dx + dy * dy;
        let v = ambient;
        if (d2 < reach * reach) {
          // Bisel a 45°: su normal es (nx·cos45°, ny·cos45°, cos45°). La luz es un punto a altura lz sobre el plano
          const d3 = Math.sqrt(d2 + lz * lz);
          const lit = Math.max(0, (K * (enx[e] * dx + eny[e] * dy + lz)) / d3);
          const att = 1 - Math.sqrt(d2) / reach;
          v += intensity * lit * att * att;
        }
        const b = Math.min(BUCKETS - 1, Math.floor(v * BUCKETS));
        const o = counts[b] * 4;
        const s = segs[b];
        s[o] = ex1[e];
        s[o + 1] = ey1[e];
        s[o + 2] = ex2[e];
        s[o + 3] = ey2[e];
        counts[b]++;
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.lineCap = "round";
      for (let b = 0; b < BUCKETS; b++) {
        if (!counts[b]) continue;
        const a = (b + 0.5) / BUCKETS;
        ctx!.beginPath();
        const s = segs[b];
        for (let k = 0; k < counts[b]; k++) {
          ctx!.moveTo(s[k * 4], s[k * 4 + 1]);
          ctx!.lineTo(s[k * 4 + 2], s[k * 4 + 3]);
        }
        // Las aristas más iluminadas llevan además un halo ancho y tenue
        if (b >= BUCKETS * 0.5) {
          ctx!.globalAlpha = a * 0.18;
          ctx!.lineWidth = bevel * 4;
          ctx!.stroke();
        }
        ctx!.globalAlpha = Math.min(1, a);
        ctx!.lineWidth = bevel;
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
  }, [size, gap, layout, radius, lightHeight, intensity, ambient, bevel, ease, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
