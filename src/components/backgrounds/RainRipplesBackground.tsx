import { useEffect, useRef } from "react";

export interface RainRipplesBackgroundProps {
  /** Gotas por segundo */
  rain?: number;
  /** Velocidad de caída */
  speed?: number;
  /** Estela de cada gota (px) */
  length?: number;
  /** Duración de cada onda (s) */
  life?: number;
  /** Grosor de las ondas (px) */
  width?: number;
  /** Opacidad de gotas y ondas (0-1) */
  alpha?: number;
  /** Opcional: fija el color de gotas y ondas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Drop = { x: number; y: number; px: number; py: number; vx: number; vy: number; len: number; impact: number };
type Ripple = { x: number; y: number; age: number; rMax: number };

const RIPPLE_FLAT = 0.32;

export default function RainRipplesBackground({
  rain = 6,
  speed = 1,
  length = 30,
  life = 4,
  width = 1,
  alpha = 0.2,
  color,
  className,
}: RainRipplesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = -1;
    let acc = 0;
    let travel = 0;
    let lastX = -1e4;
    let lastY = -1e4;
    const drops: Drop[] = [];
    const ripples: Ripple[] = [];

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      drops.length = 0;
      ripples.length = 0;
      travel = 0;
      lastX = -1e4;
      lastY = -1e4;
    }

    function makeDrop(): Drop {
      const p = Math.random();
      const px = Math.random() * w;
      const py = -20 - Math.random() * 60;
      const vy = (300 + p * 560) * speed;
      const vx = -(15 + p * 45) * speed * 0.5;
      return {
        x: px,
        y: py,
        px,
        py,
        vx,
        vy,
        len: length * (0.55 + p),
        impact: h * (0.62 + 0.36 * p),
      };
    }

    function addRipple(x: number, y: number, rMax: number) {
      ripples.push({ x, y, age: 0, rMax });
      if (ripples.length > 48) ripples.shift();
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      travel += Math.hypot(x - lastX, y - lastY);
      lastX = x;
      lastY = y;
      if (travel > 150) {
        travel = 0;
        addRipple(x, y, 130 + Math.random() * 90);
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      const dt = last < 0 ? 0.0167 : Math.min((time - last) / 1000, 0.05);
      last = time;

      acc += dt * rain;
      while (acc >= 1) {
        acc -= 1;
        drops.push(makeDrop());
      }

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.px = d.x;
        d.py = d.y;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.y >= d.impact) {
          addRipple(d.x, d.impact, (70 + (d.impact / h) * 140) * (0.8 + Math.random() * 0.5));
          drops.splice(i, 1);
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].age += dt;
        if (ripples[i].age > life) ripples.splice(i, 1);
      }

      ctx!.clearRect(0, 0, w, h);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--rain-color").trim() || style.color;
      const k = style.getPropertyValue("--rain-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.lineCap = "round";

      for (const d of drops) {
        const vlen = Math.hypot(d.vx, d.vy) || 1;
        setAlpha(alpha * mul * (0.35 + (d.impact / h) * 0.55));
        ctx!.lineWidth = width;
        ctx!.beginPath();
        ctx!.moveTo(d.x - (d.vx / vlen) * d.len, d.y - (d.vy / vlen) * d.len);
        ctx!.lineTo(d.x, d.y);
        ctx!.stroke();
      }

      for (const rp of ripples) {
        const t = rp.age / life;
        const a = Math.pow(1 - t, 1.7);
        if (a < 0.02) continue;
        const r = (1 - Math.pow(1 - t, 2)) * rp.rMax;
        setAlpha(a * alpha * mul * 0.75);
        ctx!.lineWidth = width * (1 - 0.5 * t) + 0.3;
        ctx!.beginPath();
        ctx!.ellipse(rp.x, rp.y, r, r * RIPPLE_FLAT, 0, 0, Math.PI * 2);
        ctx!.stroke();
        const t2 = t - 0.18;
        if (t2 > 0) {
          const r2 = (1 - Math.pow(1 - t2, 2)) * rp.rMax;
          setAlpha(Math.pow(1 - t2, 1.7) * alpha * mul * 0.4);
          ctx!.beginPath();
          ctx!.ellipse(rp.x, rp.y, r2, r2 * RIPPLE_FLAT, 0, 0, Math.PI * 2);
          ctx!.stroke();
        }
      }
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
  }, [rain, speed, length, life, width, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--rain-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
