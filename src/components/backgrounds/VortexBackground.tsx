import { useEffect, useRef } from "react";

export interface VortexBackgroundProps {
  /** Número de partículas */
  count?: number;
  /** Velocidad de giro */
  spin?: number;
  /** Fuerza de succión hacia el centro */
  pull?: number;
  /** Radio máximo de las órbitas (px) */
  radius?: number;
  /** Longitud de las estelas */
  trail?: number;
  /** Color de las partículas */
  color?: string;
  /** Color de fondo */
  background?: string;
  className?: string;
}

type Particle = { a: number; d: number; size: number; speed: number };

export default function VortexBackground({
  count = 600,
  spin = 1,
  pull = 1,
  radius = 220,
  trail = 1,
  color = "#e8e8e8",
  background = "#0d0d10",
  className,
}: VortexBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let parts: Particle[] = [];
    let cx = 0;
    let cy = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let last = -1;
    let raf = 0;

    function reset(p: Particle) {
      p.a = Math.random() * Math.PI * 2;
      p.d = radius * (0.35 + Math.random() * 0.65);
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cx = width / 2;
      cy = height / 2;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      parts = Array.from({ length: Math.round(count) }, () => {
        const p: Particle = { a: 0, d: 0, size: 0.5 + Math.random() * 1.6, speed: 0.7 + Math.random() * 0.6 };
        reset(p);
        return p;
      });
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      pointerX = clientX - rect.left;
      pointerY = clientY - rect.top;
    }

    function animate(time: number) {
      const dt = last < 0 ? 1 : Math.min((time - last) / 16.67, 3);
      last = time;

      const hasPointer = pointerX > -9999;
      const targetX = hasPointer ? pointerX : width / 2;
      const targetY = hasPointer ? pointerY : height / 2;
      cx += (targetX - cx) * 0.05 * dt;
      cy += (targetY - cy) * 0.05 * dt;

      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = Math.max(0.02, 0.16 / (0.4 + trail));
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalAlpha = 1;

      ctx!.fillStyle = color;
      for (const p of parts) {
        const omega = (spin * 90) / (p.d + 40);
        p.a += omega * 0.02 * p.speed * dt;
        p.d -= pull * (0.4 + 40 / (p.d + 40)) * 0.5 * p.speed * dt;
        if (p.d < 6) reset(p);
        const x = cx + Math.cos(p.a) * p.d;
        const y = cy + Math.sin(p.a) * p.d;
        if (x < -20 || x > width + 20 || y < -20 || y > height + 20) {
          reset(p);
          continue;
        }
        ctx!.globalAlpha = Math.min(1, 0.15 + (1 - p.d / radius) * 0.85);
        ctx!.beginPath();
        ctx!.arc(x, y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => setPointer(e.touches[0].clientX, e.touches[0].clientY);
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
  }, [count, spin, pull, radius, trail, color, background]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
