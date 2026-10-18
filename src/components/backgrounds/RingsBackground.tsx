import { useEffect, useRef } from "react";

export interface RingsBackgroundProps {
  /** Número de anillos */
  count?: number;
  /** Desplazamiento máximo por paralaje (px) para los anillos más cercanos */
  strength?: number;
  /** Suavizado del paralaje: cuanto más bajo, más lento */
  ease?: number;
  /** Opacidad máxima de los anillos (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color de los anillos. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Ring = { fx: number; fy: number; r: number; z: number; phase: number; filled: boolean };

export default function RingsBackground({
  count = 14,
  strength = 80,
  ease = 0.03,
  alpha = 0.2,
  lineWidth = 1,
  color,
  className,
}: RingsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let rings: Ring[] = [];
    let tx = 0;
    let ty = 0;
    let sx = 0;
    let sy = 0;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      const maxR = Math.min(width, height) * 0.2;
      rings = Array.from({ length: count }, () => {
        const r = maxR * (0.2 + Math.random() * 0.8);
        return {
          fx: Math.random(),
          fy: Math.random(),
          r,
          z: 0.2 + 0.8 * (r / maxR),
          phase: Math.random() * Math.PI * 2,
          filled: Math.random() < 0.3,
        };
      });
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = (clientX - rect.left) / width - 0.5;
      ty = (clientY - rect.top) / height - 0.5;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      sx += (tx - sx) * ease;
      sy += (ty - sy) * ease;
      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--rings-color").trim() || style.color;
      const k = style.getPropertyValue("--rings-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineWidth = lineWidth;
      for (const r of rings) {
        const x = r.fx * width - sx * strength * 2 * r.z + Math.cos(time * 0.00015 + r.phase) * 14;
        const y = r.fy * height - sy * strength * 2 * r.z + Math.sin(time * 0.00012 + r.phase) * 14;
        ctx!.beginPath();
        ctx!.arc(x, y, r.r, 0, Math.PI * 2);
        if (r.filled) {
          setAlpha(alpha * 0.25 * r.z * mul);
          ctx!.fill();
        }
        setAlpha(alpha * (0.4 + 0.6 * r.z) * mul);
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
  }, [count, strength, ease, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--rings-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
