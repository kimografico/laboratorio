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
  /** Opacidad de las partículas (0-1) */
  alpha?: number;
  /** Opcional: fija el color de las partículas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
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
  alpha = 0.45,
  color,
  className,
}: FlowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
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

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate() {
      time += 0.003;
      // destination-out borra la estela sin depender del color de fondo (desaparece la dependencia del fondo)
      ctx!.save();
      ctx!.globalCompositeOperation = "destination-out";
      setAlpha(fade);
      ctx!.fillRect(0, 0, width, height);
      ctx!.restore();

      ctx!.beginPath();
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--flow-color").trim() || style.color;
      const k = style.getPropertyValue("--flow-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
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
      setAlpha(alpha * mul);
      ctx!.lineWidth = lineWidth;
      ctx!.stroke();
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
  }, [count, speed, scale, radius, push, fade, lineWidth, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--flow-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
