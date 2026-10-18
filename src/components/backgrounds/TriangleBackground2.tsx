import { useEffect, useRef } from "react";

export interface TriangleBackground2Props {
  /** Separación entre triángulos (px) */
  size?: number;
  /** Radio base del triángulo (px) */
  radius?: number;
  /** Distancia de influencia del puntero (px) */
  proximity?: number;
  /** Crecimiento máximo del radio cerca del puntero (px) */
  growth?: number;
  /** Suavizado: cuanto más bajo, más lento y fluido */
  ease?: number;
  /** Giro máximo aleatorio (grados, +/-) al acercarse el puntero */
  rotation?: number;
  /** Opacidad de los triángulos (0-1) */
  alpha?: number;
  /** Opcional: fija el color de los triángulos. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Dot = { x: number; y: number; r: number; grow: number; angle: number; target: number; spin: number };

export default function TriangleBackground2({
  size = 30,
  radius = 2,
  proximity = 150,
  growth = 12,
  ease = 0.05,
  rotation = 30,
  alpha = 0.15,
  color,
  className,
}: TriangleBackground2Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const maxAngle = (rotation * Math.PI) / 180;
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
          dots.push({ x: col * size, y: row * size, r: radius, grow: 0, angle: 0, target: 0, spin: 0 });
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
        const distance = Math.hypot(d.x - px, d.y - py);
        const t = 1 - Math.min(Math.max(distance / proximity, 0), 1);
        if (t > 0 && d.grow === 0) d.spin = Math.random() * 2 - 1;
        d.grow = t * growth;
        d.target = d.spin * maxAngle * t;
      }
    }

    function triangle(x: number, y: number, r: number, rot: number) {
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3 + rot;
        const px = x + r * Math.cos(a);
        const py = y + r * Math.sin(a);
        if (i === 0) ctx!.moveTo(px, py);
        else ctx!.lineTo(px, py);
      }
      ctx!.closePath();
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--triangle-2-color").trim() || style.color;
      const k = style.getPropertyValue("--triangle-2-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.fillStyle = ink;
      for (const d of dots) {
        d.r += (radius + d.grow - d.r) * ease;
        d.angle += (d.target - d.angle) * ease * 0.5;
        triangle(d.x, d.y, Math.max(d.r, 0), d.angle);
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
  }, [size, radius, proximity, growth, ease, rotation, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--triangle-2-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
