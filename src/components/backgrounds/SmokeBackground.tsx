import { useEffect, useRef } from "react";

export interface SmokeBackgroundProps {
  /** Número de columnas de humo */
  sources?: number;
  /** Velocidad de ascenso */
  rise?: number;
  /** Turbulencia del humo */
  turbulence?: number;
  /** Viento lateral (px/s) */
  wind?: number;
  /** Opacidad del humo (0-1) */
  opacity?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Color del humo */
  color?: string;
  /** Color de fondo */
  background?: string;
  className?: string;
}

type Puff = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  grow: number;
  life: number;
  max: number;
  phase: number;
  source: number;
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

export default function SmokeBackground({
  sources = 3,
  rise = 0.6,
  turbulence = 0.5,
  wind = 0.1,
  opacity = 0.35,
  radius = 180,
  color = "#3a3a3a",
  background = "#e8e6e2",
  className,
}: SmokeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [cr, cg, cb] = parseColor(color);

    let width = 0;
    let height = 0;
    let puffs: Puff[] = [];
    let xs: number[] = [];
    let pointerX = -9999;
    let pointerY = -9999;
    let acc = 0;
    let last = -1;
    let raf = 0;

    function spawn(source: number) {
      const r = 14 + Math.random() * 18;
      puffs.push({
        x: xs[source] + (Math.random() - 0.5) * 30,
        y: height + r,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -rise * (0.7 + Math.random() * 0.6),
        r,
        grow: 0.3 + Math.random() * 0.4,
        life: 0,
        max: 300 + Math.random() * 240,
        phase: Math.random() * Math.PI * 2,
        source,
      });
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      xs = Array.from({ length: sources }, (_, i) => ((i + 0.5) / sources) * width + (Math.random() - 0.5) * width * 0.1);
      puffs = [];
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
      ctx!.globalAlpha = 0.05;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalAlpha = 1;

      acc += (dt * 16.67 * sources * 6) / 1000;
      while (acc >= 1) {
        spawn(Math.floor(Math.random() * sources));
        acc -= 1;
      }

      puffs = puffs.filter((p) => {
        p.life += dt;
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const infl = 1 - dist / radius;
          p.vx += (dx / (dist + 1)) * infl * 0.8;
          p.vy += (dy / (dist + 1)) * infl * 0.3;
        }
        p.vx += (wind * 0.02 + Math.sin(time * 0.0012 + p.phase) * turbulence * 0.12) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        p.r += p.grow * dt;

        const t = p.life / p.max;
        const a = Math.max(0, 1 - t) * opacity * 0.22;
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
        g.addColorStop(0.6, `rgba(${cr},${cg},${cb},${a * 0.5})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
        return t < 1 && p.y > -p.r;
      });

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
  }, [sources, rise, turbulence, wind, opacity, radius, color, background]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
