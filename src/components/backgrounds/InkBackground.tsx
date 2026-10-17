import { useEffect, useRef } from "react";

export interface InkBackgroundProps {
  /** Gotas de tinta por segundo */
  drops?: number;
  /** Fuerza con la que el puntero remueve la tinta */
  stir?: number;
  /** Velocidad de difusión de cada pluma */
  diffuse?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Color de la tinta */
  color?: string;
  /** Color de fondo */
  background?: string;
  className?: string;
}

type Plume = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  grow: number;
  life: number;
  max: number;
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

export default function InkBackground({
  drops = 3,
  stir = 1.2,
  diffuse = 0.6,
  radius = 160,
  color = "#1a1a1a",
  background = "#f2efe9",
  className,
}: InkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [cr, cg, cb] = parseColor(color);

    let width = 0;
    let height = 0;
    let plumes: Plume[] = [];
    let pointerX = -9999;
    let pointerY = -9999;
    let mvx = 0;
    let mvy = 0;
    let acc = 0;
    let last = -1;
    let raf = 0;

    function spawnAt(x: number, y: number) {
      plumes.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: radius * (0.18 + Math.random() * 0.12),
        grow: 0.15 + Math.random() * 0.25,
        life: 0,
        max: 420 + Math.random() * 320,
      });
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      plumes = [];
      for (let i = 0; i < 4; i++) spawnAt(Math.random() * width, Math.random() * height);
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (pointerX > -9999) {
        mvx = x - pointerX;
        mvy = y - pointerY;
      }
      pointerX = x;
      pointerY = y;
    }

    function animate(time: number) {
      const dt = last < 0 ? 1 : Math.min((time - last) / 16.67, 3);
      last = time;

      // Fundido: la tinta se disuelve poco a poco
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 0.03 * (0.5 + diffuse);
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalAlpha = 1;

      acc += (dt * 16.67 * drops) / 1000;
      while (acc >= 1) {
        spawnAt(Math.random() * width, Math.random() * height);
        acc -= 1;
      }

      for (const p of plumes) {
        p.life += dt;
        const dx = p.x - pointerX;
        const dy = p.y - pointerY;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const infl = 1 - dist / radius;
          p.vx += mvx * infl * infl * stir * 0.03;
          p.vy += mvy * infl * infl * stir * 0.03;
          p.vx += (dx / (dist + 1)) * infl * 0.05 * stir;
          p.vy += (dy / (dist + 1)) * infl * 0.05 * stir;
        }
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.r += p.grow * dt * diffuse;
      }
      plumes = plumes.filter((p) => p.life < p.max);

      ctx!.globalCompositeOperation = "multiply";
      for (const p of plumes) {
        const a = Math.max(0, 1 - p.life / p.max) * 0.16;
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
        g.addColorStop(0.6, `rgba(${cr},${cg},${cb},${a * 0.5})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalCompositeOperation = "source-over";

      mvx *= 0.8;
      mvy *= 0.8;

      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => setPointer(e.touches[0].clientX, e.touches[0].clientY);
    const onDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      for (let i = 0; i < 5; i++) spawnAt(e.clientX - rect.left, e.clientY - rect.top);
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mousedown", onDown);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mousedown", onDown);
    };
  }, [drops, stir, diffuse, radius, color, background]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
