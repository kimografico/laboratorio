import { useEffect, useRef } from "react";

export interface MoireBackgroundProps {
  /** Separación entre anillos (px) */
  spacing?: number;
  /** Diferencia de separación entre las dos tramas (0 = idénticas, 0.03 = la segunda un 3% más abierta) */
  detune?: number;
  /** Suavizado con el que la segunda trama sigue al puntero: cuanto más bajo, más lento */
  ease?: number;
  /** Amplitud de la deriva en reposo (px) */
  drift?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

const TAU = Math.PI * 2;

export default function MoireBackground({
  spacing = 14,
  detune = 0.02,
  ease = 0.05,
  drift = 40,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.2)",
  background = "#e0dad5",
  className,
}: MoireBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let bx = 0;
    let by = 0;
    let tx = 0;
    let ty = 0;
    let pointer = false;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      if (!pointer) {
        bx = tx = width * 0.65;
        by = ty = height * 0.5;
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      pointer = true;
    }

    function rings(cx: number, cy: number, gap: number) {
      const reach = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy));
      for (let r = gap; r <= reach; r += gap) {
        ctx!.moveTo(cx + r, cy);
        ctx!.arc(cx, cy, r, 0, TAU);
      }
    }

    function animate(time: number) {
      const ax = width * 0.5 + Math.sin(time * 0.0002) * drift;
      const ay = height * 0.5 + Math.cos(time * 0.00017) * drift;
      if (!pointer) {
        tx = width * 0.65 + Math.cos(time * 0.00013) * drift;
        ty = height * 0.5 + Math.sin(time * 0.00021) * drift;
      }
      bx += (tx - bx) * ease;
      by += (ty - by) * ease;

      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();
      rings(ax, ay, spacing);
      rings(bx, by, spacing * (1 + detune));
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.stroke();

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
  }, [spacing, detune, ease, drift, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
