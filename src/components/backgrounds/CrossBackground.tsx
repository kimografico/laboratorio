import { useEffect, useRef } from "react";

export interface CrossBackgroundProps {
  /** Separación entre cruces (px) */
  size?: number;
  /** Mitad de la longitud de cada brazo (px) */
  arm?: number;
  /** Alargamiento máximo cerca del puntero (px) */
  growth?: number;
  /** Distancia de influencia del puntero (px) */
  proximity?: number;
  /** Giro máximo (grados): 45 convierte la "+" en "×", 90 es un cuarto de vuelta completo */
  rotation?: number;
  /** Suavizado: cuanto más bajo, más lento (el giro va a la mitad) */
  ease?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

type Cross = { x: number; y: number; angle: number; extra: number; targetAngle: number; targetExtra: number };

export default function CrossBackground({
  size = 32,
  arm = 6,
  growth = 8,
  proximity = 180,
  rotation = 90,
  ease = 0.05,
  lineWidth = 1.5,
  color = "rgba(0, 0, 0, 0.2)",
  background = "#e0dad5",
  className,
}: CrossBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxAngle = (rotation * Math.PI) / 180;
    let width = 0;
    let height = 0;
    let crosses: Cross[] = [];
    let raf = 0;

    function build() {
      const columns = Math.ceil(width / size) + 1;
      const rows = Math.ceil(height / size) + 1;
      crosses = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          crosses.push({ x: col * size, y: row * size, angle: 0, extra: 0, targetAngle: 0, targetExtra: 0 });
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
      for (const c of crosses) {
        const t = 1 - Math.min(Math.hypot(c.x - px, c.y - py) / proximity, 1);
        c.targetAngle = maxAngle * t;
        c.targetExtra = growth * t;
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();
      for (const c of crosses) {
        c.angle += (c.targetAngle - c.angle) * ease * 0.5;
        c.extra += (c.targetExtra - c.extra) * ease;
        const half = arm + c.extra;
        for (let k = 0; k < 2; k++) {
          const a = c.angle + (k * Math.PI) / 2;
          const hx = Math.cos(a) * half;
          const hy = Math.sin(a) * half;
          ctx!.moveTo(c.x - hx, c.y - hy);
          ctx!.lineTo(c.x + hx, c.y + hy);
        }
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
  }, [size, arm, growth, proximity, rotation, ease, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
