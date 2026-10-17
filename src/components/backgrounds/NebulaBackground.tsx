import { useEffect, useRef } from "react";

export interface NebulaBackgroundProps {
  /** Densidad de gas y estrellas */
  density?: number;
  /** Deriva de las nubes (px/s) */
  drift?: number;
  /** Cuánto ilumina el puntero el gas */
  reveal?: number;
  /** Suavidad de los bordes (0-1) */
  softness?: number;
  /** Color del gas */
  color?: string;
  /** Color de fondo */
  background?: string;
  className?: string;
}

type Blob = { x: number; y: number; r: number; vx: number; vy: number; phase: number };
type Star = { x: number; y: number; r: number; phase: number };

function parseColor(color: string): [number, number, number] {
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.fillStyle = color;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

export default function NebulaBackground({
  density = 1,
  drift = 0.2,
  reveal = 1.2,
  softness = 0.6,
  color = "#7aa2ff",
  background = "#05060a",
  className,
}: NebulaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [cr, cg, cb] = parseColor(color);

    let width = 0;
    let height = 0;
    let blobs: Blob[] = [];
    let stars: Star[] = [];
    let pointerX = -9999;
    let pointerY = -9999;
    let last = -1;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      const diag = Math.hypot(width, height);
      blobs = Array.from({ length: Math.round(6 * density) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: diag * (0.18 + Math.random() * 0.22),
        vx: (Math.random() - 0.5) * drift,
        vy: (Math.random() - 0.5) * drift,
        phase: Math.random() * Math.PI * 2,
      }));
      stars = Array.from({ length: Math.round(140 * density) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      pointerX = clientX - rect.left;
      pointerY = clientY - rect.top;
    }

    function animate(time: number) {
      const dt = last < 0 ? 1 : Math.min((time - last) / 16.67, 3);
      last = time;

      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 0.06;
      ctx!.fillStyle = background;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalAlpha = 1;

      ctx!.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        b.x += (b.vx + Math.sin(time * 0.0002 + b.phase) * drift * 0.4) * dt;
        b.y += (b.vy + Math.cos(time * 0.00017 + b.phase) * drift * 0.4) * dt;
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.y > height + b.r) b.y = -b.r;

        const d = Math.hypot(b.x - pointerX, b.y - pointerY);
        const near = Math.max(0, 1 - d / (b.r * 1.2)) * reveal;
        const a = (0.05 + near * 0.08) * (0.6 + 0.4 * softness);
        const g = ctx!.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
        g.addColorStop(softness, `rgba(${cr},${cg},${cb},${a * 0.4})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalCompositeOperation = "source-over";
      ctx!.fillStyle = color;
      for (const s of stars) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.002 + s.phase));
        ctx!.globalAlpha = tw;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => setPointer(e.touches[0].clientX, e.touches[0].clientY);
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
  }, [density, drift, reveal, softness, color, background]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
