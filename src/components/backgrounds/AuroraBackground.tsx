import { useEffect, useRef } from "react";

export interface AuroraBackgroundProps {
  /** Colores de las manchas (hex de 6 dígitos). Una mancha por color */
  colors?: string[];
  /** Radio de cada mancha como fracción del lado menor del contenedor */
  size?: number;
  /** Opacidad del centro de cada mancha (0-1) */
  opacity?: number;
  /** Suavizado base: cuanto más bajo, más lento */
  ease?: number;
  /** Fuerza con la que las manchas huyen del puntero (0 = lo ignoran, 1 = huyen mucho) */
  avoid?: number;
  /** Opcional: fija el color de las manchas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Blob = { rgb: string; x: number; y: number; ease: number; phase: number };

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export default function AuroraBackground({
  colors = ["#ee3d3d", "#f5a623", "#2b4eff"],
  size = 0.75,
  opacity = 0.5,
  ease = 0.05,
  avoid = 1,
  color,
  className,
}: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsKey = colors.join(",");

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const palette = colorsKey ? colorsKey.split(",") : [];

    let width = 0;
    let height = 0;
    let hasPointer = false;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    const blobs: Blob[] = palette.map((c, i) => ({
      rgb: hexToRgb(c),
      x: 0,
      y: 0,
      ease: ease * (1 - i * 0.25),
      phase: i * 2.1,
    }));

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      for (const b of blobs) {
        b.x = width / 2;
        b.y = height / 2;
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      hasPointer = true;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      const radius = Math.min(width, height) * size;
      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--aurora-color").trim() || style.color;
      const k = style.getPropertyValue("--aurora-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      for (const b of blobs) {
        let targetX = width / 2 + Math.cos(time * 0.0004 + b.phase) * width * 0.22;
        let targetY = height / 2 + Math.sin(time * 0.0005 + b.phase) * height * 0.18;
        if (hasPointer) {
          const dx = targetX - tx;
          const dy = targetY - ty;
          const d = Math.hypot(dx, dy) || 1;
          const t = Math.max(0, 1 - d / radius);
          targetX += (dx / d) * radius * avoid * t;
          targetY += (dy / d) * radius * avoid * t;
        }
        b.x += (targetX - b.x) * b.ease;
        b.y += (targetY - b.y) * b.ease;

        const g = ctx!.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
        g.addColorStop(0, `rgba(${b.rgb}, ${opacity * mul})`);
        g.addColorStop(1, `rgba(${b.rgb}, 0)`);
        ctx!.fillStyle = g;
        setAlpha(mul);
        ctx!.fillRect(0, 0, width, height);
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
  }, [colorsKey, size, opacity, ease, avoid]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--aurora-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
