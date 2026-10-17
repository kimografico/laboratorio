import { useEffect, useRef } from "react";

export interface TruchetBackgroundProps {
  /** Tamaño de cada baldosa (px) */
  size?: number;
  /** Distancia de influencia del puntero (px) */
  proximity?: number;
  /** Suavizado del giro de cada baldosa: cuanto más bajo, más lento */
  ease?: number;
  /** Milisegundos que debe esperar una baldosa antes de poder girar otra vez */
  cooldown?: number;
  /** Baldosas que giran solas por segundo */
  idle?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

type Tile = { cx: number; cy: number; k: number; a: number; last: number };

const HALF = Math.PI / 2;

export default function TruchetBackground({
  size = 40,
  proximity = 130,
  ease = 0.12,
  cooldown = 600,
  idle = 2,
  lineWidth = 1.5,
  color = "rgba(0, 0, 0, 0.22)",
  background = "#e0dad5",
  className,
}: TruchetBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const h = size / 2;

    let width = 0;
    let height = 0;
    let tiles: Tile[] = [];
    let idleAcc = 0;
    let last = -1;
    let raf = 0;

    function build() {
      const columns = Math.ceil(width / size) + 1;
      const rows = Math.ceil(height / size) + 1;
      tiles = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const k = Math.random() < 0.5 ? 0 : 1;
          tiles.push({ cx: col * size + h, cy: row * size + h, k, a: k * HALF, last: -Infinity });
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
      const now = performance.now();
      for (const t of tiles) {
        const d = Math.hypot(t.cx - px, t.cy - py);
        if (d < proximity && now - t.last > cooldown && Math.random() < (1 - d / proximity) * 0.5) {
          t.k += 1;
          t.last = now;
        }
      }
    }

    function animate(time: number) {
      const dt = last < 0 ? 0 : Math.min(time - last, 100);
      last = time;
      idleAcc += (dt * idle) / 1000;
      while (idleAcc >= 1 && tiles.length) {
        tiles[Math.floor(Math.random() * tiles.length)].k += 1;
        idleAcc -= 1;
      }

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();

      for (const t of tiles) {
        t.a += (t.k * HALF - t.a) * ease;
        const c = Math.cos(t.a);
        const s = Math.sin(t.a);
        ctx!.setTransform(c, s, -s, c, t.cx, t.cy);
        ctx!.moveTo(0, -h);
        ctx!.arc(-h, -h, h, 0, HALF);
        ctx!.moveTo(0, h);
        ctx!.arc(h, h, h, Math.PI, Math.PI * 1.5);
      }

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";
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
  }, [size, proximity, ease, cooldown, idle, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
