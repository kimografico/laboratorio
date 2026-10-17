import { useEffect, useRef } from "react";

export interface MeteorsBackgroundProps {
  /** Meteoros por segundo */
  rate?: number;
  /** Velocidad de los meteoros */
  speed?: number;
  /** Longitud de la estela */
  length?: number;
  /** Atracción del puntero sobre los meteoros */
  attract?: number;
  /** Parpadeo de las estrellas */
  twinkle?: number;
  /** Color de meteoros y estrellas */
  color?: string;
  /** Color de fondo */
  background?: string;
  className?: string;
}

type Meteor = { x: number; y: number; vx: number; vy: number; size: number; life: number; max: number };
type Star = { x: number; y: number; r: number; phase: number };

export default function MeteorsBackground({
  rate = 1.5,
  speed = 1,
  length = 1,
  attract = 1,
  twinkle = 1,
  color = "#fff3d6",
  background = "#070914",
  className,
}: MeteorsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let meteors: Meteor[] = [];
    let stars: Star[] = [];
    let pointerX = -9999;
    let pointerY = -9999;
    let acc = 0;
    let last = -1;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
      }));
      meteors = [];
    }

    function spawn() {
      const fromLeft = Math.random() < 0.5;
      const vx = (fromLeft ? 1 : -1) * (2.5 + Math.random() * 2) * speed;
      meteors.push({
        x: fromLeft ? -20 : width + 20,
        y: Math.random() * height * 0.5,
        vx,
        vy: (2.5 + Math.random() * 1.5) * speed,
        size: 1.4 + Math.random() * 1.8,
        life: 0,
        max: 260 + Math.random() * 160,
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

      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);

      ctx!.fillStyle = color;
      for (const s of stars) {
        const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 0.0015 + s.phase)) * twinkle;
        ctx!.globalAlpha = Math.min(1, tw);
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      acc += (dt * 16.67 * rate) / 1000;
      while (acc >= 1) {
        spawn();
        acc -= 1;
      }

      ctx!.lineCap = "round";
      meteors = meteors.filter((m) => {
        m.life += dt;
        const dx = pointerX - m.x;
        const dy = pointerY - m.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 260 && dist > 1) {
          const infl = (1 - dist / 260) * attract * 0.12;
          m.vx += (dx / dist) * infl;
          m.vy += (dy / dist) * infl;
        }
        m.x += m.vx * dt;
        m.y += m.vy * dt;

        const tl = length * (14 + Math.hypot(m.vx, m.vy) * 3);
        const angle = Math.atan2(m.vy, m.vx);
        const tx = m.x - Math.cos(angle) * tl;
        const ty = m.y - Math.sin(angle) * tl;
        const g = ctx!.createLinearGradient(m.x, m.y, tx, ty);
        g.addColorStop(0, color);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx!.strokeStyle = g;
        ctx!.globalAlpha = 0.9;
        ctx!.lineWidth = m.size;
        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(tx, ty);
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.size * 0.7, 0, Math.PI * 2);
        ctx!.fillStyle = color;
        ctx!.fill();

        const off = m.x < -60 || m.x > width + 60 || m.y > height + 60 || m.y < -60;
        return m.life < m.max && !off;
      });
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
  }, [rate, speed, length, attract, twinkle, color, background]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
