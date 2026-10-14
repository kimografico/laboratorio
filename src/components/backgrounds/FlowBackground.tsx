import { useEffect, useRef } from "react";

export interface FlowBackgroundProps {
  /** Número de partículas */
  count?: number;
  /** Velocidad de las partículas (px por fotograma) */
  speed?: number;
  /** Escala del campo: más bajo = corrientes más amplias */
  scale?: number;
  /** Radio en el que el puntero repele las partículas (px) */
  radius?: number;
  /** Fuerza de repulsión del puntero */
  push?: number;
  /** Rapidez con la que se borra la estela (0.02 = larga, 0.15 = corta) */
  fade?: number;
  lineWidth?: number;
  /** Color de las partículas (con transparencia) */
  color?: string;
  background?: string;
  className?: string;
}

type Particle = { x: number; y: number; life: number };

export default function FlowBackground({
  count = 800,
  speed = 1.1,
  scale = 0.0035,
  radius = 140,
  push = 3,
  fade = 0.07,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.45)",
  background = "#e0dad5",
  className,
}: FlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;
    let px = -9999;
    let py = -9999;
    let particles: Particle[] = [];
    let raf = 0;

    const spawn = (p: Particle) => {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.life = 100 + Math.random() * 200;
    };

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      particles = Array.from({ length: count }, () => {
        const p = { x: 0, y: 0, life: 0 };
        spawn(p);
        return p;
      });
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
    }

    const angle = (x: number, y: number) =>
      (Math.sin(x * scale + time * 2) + Math.cos(y * scale * 1.3 - time) + Math.sin((x + y) * scale * 0.5)) *
      Math.PI;

    function animate() {
      time += 0.003;
      ctx!.globalAlpha = fade;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalAlpha = 1;

      ctx!.beginPath();
      for (const p of particles) {
        const a = angle(p.x, p.y);
        let vx = Math.cos(a) * speed;
        let vy = Math.sin(a) * speed;

        const dx = p.x - px;
        const dy = p.y - py;
        const d = Math.hypot(dx, dy);
        if (d < radius && d > 0) {
          const f = (1 - d / radius) * push;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
        }

        ctx!.moveTo(p.x, p.y);
        p.x += vx;
        p.y += vy;
        ctx!.lineTo(p.x, p.y);

        if (--p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) spawn(p);
      }
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
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
  }, [count, speed, scale, radius, push, fade, lineWidth, color, background]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
