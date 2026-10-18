import { useEffect, useRef } from "react";

export interface DotBackgroundProps {
  /** Separación entre puntos (px) */
  size?: number;
  /** Radio base del punto (px) */
  radius?: number;
  /** Distancia de influencia del puntero (px) */
  proximity?: number;
  /** Desplazamiento máximo al ser repelido (px) */
  push?: number;
  /** Rigidez del muelle: más alto, vuelve antes */
  stiffness?: number;
  /** Amortiguación (0-1): más alto, más rebote */
  damping?: number;
  /** Opacidad de los puntos (0-1) */
  alpha?: number;
  /** Opcional: fija el color de los puntos. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Dot = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  tx: number;
  ty: number;
  tr: number;
};

export default function DotBackground({
  size = 18,
  radius = 1,
  proximity = 160,
  push = 30,
  stiffness = 0.05,
  damping = 0.85,
  alpha = 0.2,
  color,
  className,
}: DotBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let raf = 0;

    function build() {
      const columns = Math.ceil(width / size) + 1;
      const rows = Math.ceil(height / size) + 1;
      dots = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const x = col * size;
          const y = row * size;
          dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, r: radius, tx: x, ty: y, tr: radius });
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
      for (const d of dots) {
        const ax = d.hx - px;
        const ay = d.hy - py;
        const distance = Math.hypot(ax, ay) || 1;
        const t = 1 - Math.min(distance / proximity, 1);
        d.tx = d.hx + (ax / distance) * push * t;
        d.ty = d.hy + (ay / distance) * push * t;
        d.tr = radius + 1.5 * t;
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--dot-color").trim() || style.color;
      const k = style.getPropertyValue("--dot-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.beginPath();
      for (const d of dots) {
        d.vx = (d.vx + (d.tx - d.x) * stiffness) * damping;
        d.vy = (d.vy + (d.ty - d.y) * stiffness) * damping;
        d.x += d.vx;
        d.y += d.vy;
        d.r += (d.tr - d.r) * 0.08;
        ctx!.moveTo(d.x + d.r, d.y);
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      }
      setAlpha(alpha * mul);
      ctx!.fill();
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
  }, [size, radius, proximity, push, stiffness, damping, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--dot-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
