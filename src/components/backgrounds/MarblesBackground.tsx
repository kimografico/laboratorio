import { useEffect, useRef } from "react";

export interface MarblesBackgroundProps {
  /** Canicas */
  count?: number;
  /** Gravedad (px/s²) */
  gravity?: number;
  /** Rebote contra paredes y choques (0 = no rebotan, 1 = perfecto) */
  bounce?: number;
  /** Radio base de cada canica (px); cada una varía un ±20% */
  size?: number;
  /** Velocidad inicial */
  speed?: number;
  /** Grosor del contorno (px) */
  width?: number;
  /** Opacidad general (0-1) */
  alpha?: number;
  color?: string;
  className?: string;
}

type Marble = { x: number; y: number; vx: number; vy: number; rot: number; r: number };

export default function MarblesBackground({
  count = 51,
  gravity = 600,
  bounce = 0.86,
  size = 16,
  speed = 1,
  width = 1.2,
  alpha = 0.3,
  color,
  className,
}: MarblesBackgroundProps) {
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
    let hasPointer = false;
    let sx = 0;
    let sy = 0;
    let list: Marble[] = [];

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      list = Array.from({ length: count }, () => {
        const r = size * (0.8 + 0.4 * Math.random());
        return {
          x: r + Math.random() * Math.max(1, w - r * 2),
          y: r + Math.random() * Math.max(1, h * 0.55),
          vx: (Math.random() - 0.5) * 160 * speed,
          vy: (Math.random() - 0.5) * 120 * speed,
          rot: Math.random() * Math.PI * 2,
          r,
        };
      });
      sx = w / 2;
      sy = h / 2;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      sx = clientX - rect.left;
      sy = clientY - rect.top;
      hasPointer = true;
    }

    function animate(time: number) {
      const dt = last < 0 ? 0.0167 : Math.min((time - last) / 1000, 0.033);
      last = time;

      const damp = Math.pow(0.995, dt * 60);
      for (const m of list) {
        m.vy += gravity * dt;
        if (hasPointer) {
          const dx = m.x - sx;
          const dy = m.y - sy;
          const d = Math.hypot(dx, dy) || 1;
          const R = 150;
          if (d < R) {
            const f = (1 - d / R) * 1500;
            m.vx += (dx / d) * f * dt;
            m.vy += (dy / d) * f * dt;
          }
        }
        m.vx *= damp;
        m.vy *= damp;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.rot += (m.vx / m.r) * dt * 0.8;

        if (m.x < m.r) {
          m.x = m.r;
          m.vx = Math.abs(m.vx) * bounce;
        } else if (m.x > w - m.r) {
          m.x = w - m.r;
          m.vx = -Math.abs(m.vx) * bounce;
        }
        if (m.y < m.r) {
          m.y = m.r;
          m.vy = Math.abs(m.vy) * bounce;
        } else if (m.y > h - m.r) {
          m.y = h - m.r;
          m.vy = -Math.abs(m.vy) * bounce;
          if (Math.abs(m.vy) < 24) m.vy = 0;
          m.vx *= 0.96;
        }
      }

      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i];
          const b = list[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const min = a.r + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 === 0) continue;
          const d = Math.sqrt(d2);
          const nx = dx / d;
          const ny = dy / d;
          const invA = 1 / (a.r * a.r);
          const invB = 1 / (b.r * b.r);
          const invSum = invA + invB;
          const push = min - d;
          a.x -= nx * push * (invA / invSum);
          a.y -= ny * push * (invA / invSum);
          b.x += nx * push * (invB / invSum);
          b.y += ny * push * (invB / invSum);
          const rvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rvn < 0) {
            const e = rvn < -30 ? bounce : 0;
            const imp = (-(1 + e) * rvn) / invSum;
            a.vx -= nx * imp * invA;
            a.vy -= ny * imp * invA;
            b.vx += nx * imp * invB;
            b.vy += ny * imp * invB;
          }
        }
      }

      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--marbles-color").trim() || style.color;
      const k = style.getPropertyValue("--marbles-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;

      for (const m of list) {
        ctx!.globalAlpha = alpha * mul * 0.45;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.r * 0.94, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = alpha * mul;
        ctx!.lineWidth = width;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.r * 0.94, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.globalAlpha = alpha * mul * 0.55;
        ctx!.lineWidth = m.r * 0.15;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.r * 0.5, m.rot, m.rot + 2.2);
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.r * 0.28, m.rot + Math.PI * 0.6, m.rot + Math.PI * 1.5);
        ctx!.stroke();
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
  }, [count, gravity, bounce, size, speed, width, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--marbles-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
