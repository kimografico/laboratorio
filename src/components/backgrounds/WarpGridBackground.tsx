import { useEffect, useRef } from "react";

export interface WarpGridBackgroundProps {
  /** Separación entre líneas de la rejilla (px) */
  size?: number;
  /** Radio de influencia de la lente (px) */
  radius?: number;
  /** Intensidad de la lente: cuánto se abre la rejilla bajo el puntero */
  lens?: number;
  /** Suavizado con el que la lente sigue al puntero (0.02 - 0.2) */
  ease?: number;
  lineWidth?: number;
  /** Opacidad de la rejilla (0-1) */
  alpha?: number;
  /** Opcional: fija el color de la rejilla. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

export default function WarpGridBackground({
  size = 36,
  radius = 180,
  lens = 0.6,
  ease = 0.1,
  lineWidth = 1,
  alpha = 0.2,
  color,
  className,
}: WarpGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const step = 10;
    const OFF = -9999;
    let width = 0;
    let height = 0;
    let px = OFF;
    let py = OFF;
    let tx = OFF;
    let ty = OFF;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (px === OFF) {
        px = tx;
        py = ty;
      }
    }

    function point(x: number, y: number, first: boolean) {
      const dx = x - px;
      const dy = y - py;
      const k = 1 + lens * Math.exp(-(dx * dx + dy * dy) / (radius * radius));
      if (first) ctx!.moveTo(px + dx * k, py + dy * k);
      else ctx!.lineTo(px + dx * k, py + dy * k);
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate() {
      if (px !== OFF) {
        px += (tx - px) * ease;
        py += (ty - py) * ease;
      }
      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();
      for (let y = 0; y <= height + size; y += size) {
        for (let x = 0; x <= width + step; x += step) point(x, y, x === 0);
      }
      for (let x = 0; x <= width + size; x += size) {
        for (let y = 0; y <= height + step; y += step) point(x, y, y === 0);
      }
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--warp-grid-color").trim() || style.color;
      const k = style.getPropertyValue("--warp-grid-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
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
  }, [size, radius, lens, ease, lineWidth, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--warp-grid-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
