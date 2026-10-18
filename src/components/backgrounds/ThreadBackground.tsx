import { useEffect, useRef } from "react";

export interface ThreadBackgroundProps {
  /** Número de hilos; cada uno sigue al puntero con un retraso distinto */
  threads?: number;
  /** Puntos de cada hilo: más puntos, hilo más largo */
  length?: number;
  /** Rapidez con la que cada punto alcanza al anterior (0.1 lento y largo, 0.5 rígido) */
  follow?: number;
  /** Ondulación lateral del hilo (px) */
  wobble?: number;
  lineWidth?: number;
  /** Opacidad de los hilos (0-1) */
  alpha?: number;
  /** Opcional: fija el color de los hilos. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Pt = { x: number; y: number };
type Strand = { pts: Pt[]; lag: number };

export default function ThreadBackground({
  threads = 3,
  length = 34,
  follow = 0.3,
  wobble = 7,
  lineWidth = 1.4,
  alpha = 0.45,
  color,
  className,
}: ThreadBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let px = 0;
    let py = 0;
    let lastMove = -Infinity;
    let strands: Strand[] = [];
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      strands = Array.from({ length: threads }, (_, s) => ({
        lag: Math.max(0.04, 0.16 - s * 0.035),
        pts: Array.from({ length }, () => ({ x: width / 2, y: height / 2 })),
      }));
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      lastMove = performance.now();
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      const active = performance.now() - lastMove < 2500;

      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--thread-color").trim() || style.color;
      const k = style.getPropertyValue("--thread-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.lineCap = "round";

      strands.forEach((st, s) => {
        const tx = active ? px : width * 0.5 + Math.cos(time * 0.0004 + s * 1.3) * width * 0.3;
        const ty = active ? py : height * 0.5 + Math.sin(time * 0.0006 + s * 1.3) * height * 0.25;
        const pts = st.pts;
        pts[0].x += (tx - pts[0].x) * st.lag;
        pts[0].y += (ty - pts[0].y) * st.lag;
        for (let i = 1; i < pts.length; i++) {
          pts[i].x += (pts[i - 1].x - pts[i].x) * follow;
          pts[i].y += (pts[i - 1].y - pts[i].y) * follow;
        }

        let lx = pts[0].x;
        let ly = pts[0].y;
        for (let i = 1; i < pts.length; i++) {
          const p = pts[i];
          const prev = pts[i - 1];
          const dx = prev.x - p.x;
          const dy = prev.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          const wob = Math.sin(time * 0.003 + i * 0.6 + s * 2) * wobble * (i / pts.length);
          const x = p.x - (dy / d) * wob;
          const y = p.y + (dx / d) * wob;
          const t = i / pts.length;
          setAlpha(Math.pow(1 - t, 1.5) * alpha * mul);
          ctx!.lineWidth = lineWidth * (1 - t * 0.7);
          ctx!.beginPath();
          ctx!.moveTo(lx, ly);
          ctx!.lineTo(x, y);
          ctx!.stroke();
          lx = x;
          ly = y;
        }
      });

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
  }, [threads, length, follow, wobble, lineWidth, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--thread-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
