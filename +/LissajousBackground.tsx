import { useEffect, useRef } from "react";

export interface LissajousBackgroundProps {
  /** Copias superpuestas de la curva, cada una ligeramente desfasada */
  layers?: number;
  /** Tamaño de la figura como fracción de la dimensión menor (0-0.5) */
  size?: number;
  /** Puntos por curva: más puntos, trazo más fino y más costoso */
  points?: number;
  /** Vueltas que da la curva: más vueltas, malla más densa */
  turns?: number;
  /** Suavizado con el que la figura se transforma al mover el puntero */
  ease?: number;
  /** Velocidad de giro de la figura */
  spin?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

const TAU = Math.PI * 2;

export default function LissajousBackground({
  layers = 4,
  size = 0.38,
  points = 1800,
  turns = 3,
  ease = 0.04,
  spin = 0.00006,
  lineWidth = 0.8,
  color = "rgba(0, 0, 0, 0.22)",
  background = "#e0dad5",
  className,
}: LissajousBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let sx = 0.5;
    let sy = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let pointer = false;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = Math.min(1, Math.max(0, (clientX - rect.left) / width));
      ty = Math.min(1, Math.max(0, (clientY - rect.top) / height));
      pointer = true;
    }

    function animate(time: number) {
      if (!pointer) {
        tx = 0.5 + 0.25 * Math.sin(time * 0.00012);
        ty = 0.5 + 0.25 * Math.cos(time * 0.00009);
      }
      sx += (tx - sx) * ease;
      sy += (ty - sy) * ease;

      const a = 2 + sx * 5;
      const b = 2 + sy * 5;
      const R = Math.min(width, height) * size;
      const cx = width / 2;
      const cy = height / 2;
      const rot = time * spin;

      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();

      for (let l = 0; l < layers; l++) {
        const s = 1 - l * 0.07;
        const phase = l * 0.09;
        const cr = Math.cos(rot + l * 0.02);
        const sr = Math.sin(rot + l * 0.02);
        for (let i = 0; i <= points; i++) {
          const th = (i / points) * TAU * turns;
          const X = Math.sin(a * th + phase) * R * s;
          const Y = Math.sin(b * th) * R * s;
          const x = cx + X * cr - Y * sr;
          const y = cy + X * sr + Y * cr;
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
      }

      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineJoin = "round";
      ctx!.stroke();

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
  }, [layers, size, points, turns, ease, spin, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
