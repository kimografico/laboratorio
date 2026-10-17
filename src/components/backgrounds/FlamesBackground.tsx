import { useEffect, useRef } from "react";

export interface FlamesBackgroundProps {
  /** Cantidad e intensidad de las llamas */
  intensity?: number;
  /** Viento lateral (px/s) */
  wind?: number;
  /** Número de ascuas */
  embers?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Color base de la llama */
  color?: string;
  /** Color de fondo */
  background?: string;
  className?: string;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  ember: boolean;
  phase: number;
};

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

export default function FlamesBackground({
  intensity = 1,
  wind = 0,
  embers = 40,
  radius = 180,
  color = "#ff7a18",
  background = "#120a06",
  className,
}: FlamesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [cr, cg, cb] = parseColor(color);
    const hr = Math.round(cr + (255 - cr) * 0.7);
    const hg = Math.round(cg + (255 - cg) * 0.7);
    const hb = Math.round(cb + (255 - cb) * 0.5);

    let width = 0;
    let height = 0;
    let parts: Particle[] = [];
    let pointerX = -9999;
    let pointerY = -9999;
    let last = -1;
    let raf = 0;

    function spawn(count: number, ember: boolean) {
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const r = ember ? 1 + Math.random() * 2 : 18 + Math.random() * 34;
        parts.push({
          x,
          y: height + r,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(ember ? 1.6 : 1) * (0.6 + Math.random() * 0.8),
          r,
          life: 0,
          max: ember ? 160 + Math.random() * 200 : 90 + Math.random() * 120,
          ember,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      parts = [];
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      pointerX = clientX - rect.left;
      pointerY = clientY - rect.top;
    }

    function animate(time: number) {
      const dt = last < 0 ? 1 : Math.min((time - last) / 16.67, 3);
      last = time;

      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 0.22;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalAlpha = 1;

      spawn(Math.random() < 0.6 * intensity ? Math.ceil(intensity) : 0, false);
      if (parts.filter((p) => p.ember).length < embers && Math.random() < 0.4) spawn(1, true);

      ctx!.globalCompositeOperation = "lighter";
      parts = parts.filter((p) => {
        p.life += dt;
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const infl = 1 - dist / radius;
          p.vx += (dx / (dist + 1)) * infl * 0.6;
          p.vy += infl * 0.12;
        }
        p.vx += (wind * 0.02 + Math.sin(time * 0.002 + p.phase) * 0.05) * (p.ember ? 1.4 : 1);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.99;
        p.vy *= 0.995;

        const t = p.life / p.max;
        const alpha = Math.max(0, 1 - t);
        const rad = p.ember ? p.r : p.r * (0.4 + 0.6 * (1 - t));
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        if (p.ember) {
          g.addColorStop(0, `rgba(${hr},${hg},${hb},${alpha})`);
        } else {
          g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.5})`);
          g.addColorStop(0.5, `rgba(${cr},${cg},${cb},${alpha * 0.2})`);
        }
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx!.fill();
        return t < 1;
      });
      ctx!.globalCompositeOperation = "source-over";

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
  }, [intensity, wind, embers, radius, color, background]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
