import { useEffect, useRef } from "react";

export interface NeedleBackgroundProps {
  /** Separación entre líneas (px) */
  size?: number;
  /** Longitud base de cada línea (px) */
  length?: number;
  /** Alargamiento máximo cerca del puntero (px) */
  growth?: number;
  /** Distancia de influencia del puntero (px) */
  proximity?: number;
  /** Suavizado: cuanto más bajo, más lento y fluido */
  ease?: number;
  /** Ángulo de reposo (grados) */
  restAngle?: number;
  /** Grosor de la línea (px) */
  lineWidth?: number;
  /** Color de las líneas (negro con mucha transparencia) */
  color?: string;
  /** Color de fondo */
  background?: string;
  className?: string;
}

type Needle = { x: number; y: number; len: number; angle: number; targetLen: number; targetAngle: number };

const TAU = Math.PI * 2;
const delta = (from: number, to: number) => ((((to - from) % TAU) + TAU + Math.PI) % TAU) - Math.PI;

export default function NeedleBackground({
  size = 32,
  length = 10,
  growth = 8,
  proximity = 220,
  ease = 0.06,
  restAngle = 45,
  lineWidth = 1.5,
  color = "rgba(0, 0, 0, 0.18)",
  background = "#e0dad5",
  className,
}: NeedleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rest = (restAngle * Math.PI) / 180;
    let width = 0;
    let height = 0;
    let needles: Needle[] = [];
    let raf = 0;

    function build() {
      const columns = Math.ceil(width / size) + 1;
      const rows = Math.ceil(height / size) + 1;
      needles = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          needles.push({
            x: col * size,
            y: row * size,
            len: length,
            angle: rest,
            targetLen: length,
            targetAngle: rest,
          });
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
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      for (const n of needles) {
        const dx = px - n.x;
        const dy = py - n.y;
        const t = 1 - Math.min(Math.hypot(dx, dy) / proximity, 1);
        const toPointer = Math.atan2(dy, dx);
        n.targetAngle = rest + delta(rest, toPointer) * t;
        n.targetLen = length + growth * t;
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();
      for (const n of needles) {
        n.angle += delta(n.angle, n.targetAngle) * ease;
        n.len += (n.targetLen - n.len) * ease;
        const hx = (Math.cos(n.angle) * n.len) / 2;
        const hy = (Math.sin(n.angle) * n.len) / 2;
        ctx!.moveTo(n.x - hx, n.y - hy);
        ctx!.lineTo(n.x + hx, n.y + hy);
      }
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";
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
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [size, length, growth, proximity, ease, restAngle, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
