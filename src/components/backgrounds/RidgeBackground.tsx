import { useEffect, useRef } from "react";

export interface RidgeBackgroundProps {
  /** Separación entre líneas (px) */
  spacing?: number;
  /** Altura máxima de la elevación bajo el puntero (px) */
  lift?: number;
  /** Radio de la elevación (px) */
  radius?: number;
  /** Rugosidad (0-1): 0 = colina suave y redonda, 1 = montañas aserradas con ruido */
  roughness?: number;
  /** Variación entre filas (0-1) */
  variation?: number;
  /** Amplitud de la ondulación ambiental (px) */
  idle?: number;
  /** Suavizado con el que la elevación sigue al puntero */
  ease?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};
const vnoise = (x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
};
const ridged = (x: number) => {
  const n = vnoise(x) * 0.6 + vnoise(x * 2.3 + 11) * 0.3 + vnoise(x * 5.1 + 37) * 0.1;
  return 1 - Math.abs(2 * n - 1);
};

export default function RidgeBackground({
  spacing = 18,
  lift = 120,
  radius = 180,
  roughness = 0.75,
  variation = 0.5,
  idle = 14,
  ease = 0.06,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.3)",
  background = "#e0dad5",
  className,
}: RidgeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const varF = variation * roughness;
    const step = roughness > 0 ? 5 : 8;

    const OFF = -9999;
    let width = 0;
    let height = 0;
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

    function animate(time: number) {
      if (px !== OFF) {
        px += (tx - px) * ease;
        py += (ty - py) * ease;
      }
      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.fillStyle = background;
      ctx!.lineWidth = lineWidth;
      ctx!.lineJoin = "round";

      for (let row = 0, y0 = spacing; y0 <= height + spacing * 2; row++, y0 += spacing) {
        const shift = (hash(row * 3.7 + 1.3) - 0.5) * 3 * varF;
        const height2 = 1 + (hash(row * 5.3 + 2.1) - 0.5) * 0.8 * varF;
        const freq = 0.03 * (1 + (hash(row * 7.1 + 3.9) - 0.5) * 0.2 * varF);
        ctx!.beginPath();
        for (let x = -step; x <= width + step; x += step) {
          const dx = x - px;
          const dy = y0 - py;
          const envelope = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
          const shape = 1 - roughness + roughness * (0.25 + 0.75 * ridged(x * freq + row * 0.12 + shift));
          const wave = Math.sin(x * 0.004 + row * 0.35 + time * 0.0004) * idle;
          const y = y0 - lift * envelope * shape * height2 - wave;
          if (x === -step) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.stroke();
        ctx!.lineTo(width + step, y0 + spacing * 0.5);
        ctx!.lineTo(-step, y0 + spacing * 0.5);
        ctx!.closePath();
        ctx!.fill();
      }
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
  }, [spacing, lift, radius, roughness, variation, idle, ease, lineWidth, color, background]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
