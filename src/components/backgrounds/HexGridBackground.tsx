import { useEffect, useRef } from "react";

export interface HexGridBackgroundProps {
  /** Lado del hexágono (px) */
  size?: number;
  /** Grosor base de la línea (px) */
  lineWidth?: number;
  /** Opacidad base de la línea (0-1) */
  alpha?: number;
  /** Radio de influencia del ratón (px) */
  hoverRadius?: number;
  /** Factor de opacidad al pasar ratón (1 = sin cambio) */
  hoverAlpha?: number;
  /** Factor de grosor al pasar ratón (1 = sin cambio) */
  hoverWidth?: number;
  /** Color de la línea (hereda del tema si no se especifica) */
  color?: string;
  className?: string;
}

export default function HexGridBackground({
  size = 28,
  lineWidth = 0.5,
  alpha = 0.02,
  hoverRadius = 250,
  hoverAlpha = 5,
  hoverWidth = 3.5,
  color,
  className,
}: HexGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let raf = 0;
    let hexes: { x: number; y: number; vertices: [number, number][] }[] = [];

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;

      const dx = Math.sqrt(3) * size;
      const dy = size * 1.5;
      const cols = Math.ceil(w / dx) + 2;
      const rows = Math.ceil(h / dy) + 2;
      hexes = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c * dx + (r % 2 ? dx / 2 : 0) - dx / 2;
          const cy = r * dy - dy / 2;
          const vertices: [number, number][] = [];
          for (let j = 0; j < 6; j++) {
            const ang = -Math.PI / 2 + (j * Math.PI) / 3;
            vertices.push([cx + Math.cos(ang) * size, cy + Math.sin(ang) * size]);
          }
          hexes.push({ x: cx, y: cy, vertices });
        }
      }
    }

    function onPointer(e: MouseEvent | TouchEvent) {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const rect = canvas.getBoundingClientRect();
      mousePos.current = { x: clientX - rect.left, y: clientY - rect.top };
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      const ink = color || style.getPropertyValue("--fg").trim() || style.color;
      ctx.strokeStyle = ink;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const mx = mousePos.current?.x ?? -1e4;
      const my = mousePos.current?.y ?? -1e4;
      const r2 = hoverRadius * hoverRadius;

      for (const hx of hexes) {
        const dx = hx.x - mx;
        const dy = hx.y - my;
        const d2 = dx * dx + dy * dy;
        const inRange = d2 <= r2;

        const t = inRange ? 1 - d2 / r2 : 0;
        const lw = lineWidth * (1 + t * (hoverWidth - 1));
        const a = alpha * (1 + t * (hoverAlpha - 1));

        ctx.lineWidth = lw;
        ctx.globalAlpha = a;

        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const [vx, vy] = hx.vertices[j];
          if (j === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("mousemove", onPointer);
    window.addEventListener("touchmove", onPointer, { passive: true });
    window.addEventListener("mouseleave", () => { mousePos.current = null; });

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onPointer);
      window.removeEventListener("touchmove", onPointer);
      window.removeEventListener("mouseleave", () => { mousePos.current = null; });
    };
  }, [size, lineWidth, alpha, hoverRadius, hoverAlpha, hoverWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()}>
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}