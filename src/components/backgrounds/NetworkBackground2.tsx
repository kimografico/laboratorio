import { useEffect, useRef } from "react";

export interface NetworkBackground2Props {
  /** Puntos conectados por cada 10.000 px² del contenedor */
  density?: number;
  /** Puntos sueltos (flotan sin conectarse) por cada 10.000 px² */
  scatter?: number;
  /** Distancia máxima para que dos puntos se unan (px) */
  link?: number;
  /** Velocidad de deriva (px por fotograma); los sueltos van más lentos */
  speed?: number;
  /** Radio en el que el puntero atrae y conecta puntos (px) */
  radius?: number;
  /** Fuerza de atracción del puntero */
  attract?: number;
  /** Radio de cada punto conectado (px); los sueltos son más pequeños y variables */
  dot?: number;
  color?: string;
  background?: string;
  className?: string;
}

type Node = { x: number; y: number; vx: number; vy: number; bx: number; by: number; r: number };

export default function NetworkBackground2({
  density = 0.6,
  scatter = 1.2,
  link = 120,
  speed = 0.3,
  radius = 200,
  attract = 0.04,
  dot = 1.6,
  color = "#000000",
  background = "#e0dad5",
  className,
}: NetworkBackground2Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let px = -9999;
    let py = -9999;
    let nodes: Node[] = [];
    let floaters: Node[] = [];
    let cols = 0;
    let rows = 0;
    let grid: number[][] = [];
    let raf = 0;

    const make = (v: number, r: number): Node => {
      const bx = (Math.random() - 0.5) * 2 * v;
      const by = (Math.random() - 0.5) * 2 * v;
      return { x: Math.random() * width, y: Math.random() * height, vx: bx, vy: by, bx, by, r };
    };

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / link) + 1;
      rows = Math.ceil(height / link) + 1;
      grid = Array.from({ length: cols * rows }, () => []);
      const area = (width * height) / 10000;
      nodes = Array.from({ length: Math.round(density * area) }, () => make(speed, dot));
      floaters = Array.from({ length: Math.round(scatter * area) }, () =>
        make(speed * 0.6, dot * (0.45 + Math.random() * 0.7))
      );
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
    }

    function line(x1: number, y1: number, x2: number, y2: number, a: number) {
      ctx!.globalAlpha = a;
      ctx!.beginPath();
      ctx!.moveTo(x1, y1);
      ctx!.lineTo(x2, y2);
      ctx!.stroke();
    }

    function drift(n: Node, pull: number) {
      n.vx += (n.bx - n.vx) * 0.02;
      n.vy += (n.by - n.vy) * 0.02;
      const dx = px - n.x;
      const dy = py - n.y;
      const d = Math.hypot(dx, dy);
      if (d < radius && d > 1) {
        const f = attract * pull * (1 - d / radius);
        n.vx += (dx / d) * f;
        n.vy += (dy / d) * f;
      }
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0) n.x += width;
      else if (n.x > width) n.x -= width;
      if (n.y < 0) n.y += height;
      else if (n.y > height) n.y -= height;
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      for (const n of nodes) drift(n, 1);
      for (const f of floaters) drift(f, 0.6);

      ctx!.strokeStyle = color;
      ctx!.fillStyle = color;
      ctx!.lineWidth = 1;
      const link2 = link * link;
      for (const cell of grid) cell.length = 0;
      nodes.forEach((n, i) => grid[Math.floor(n.y / link) * cols + Math.floor(n.x / link)].push(i));
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const cx = Math.floor(a.x / link);
        const cy = Math.floor(a.y / link);
        for (let gy = Math.max(cy - 1, 0); gy <= Math.min(cy + 1, rows - 1); gy++) {
          for (let gx = Math.max(cx - 1, 0); gx <= Math.min(cx + 1, cols - 1); gx++) {
            for (const j of grid[gy * cols + gx]) {
              if (j <= i) continue;
              const b = nodes[j];
              const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
              if (d2 < link2) line(a.x, a.y, b.x, b.y, 0.25 * (1 - Math.sqrt(d2) / link));
            }
          }
        }
        const d = Math.hypot(a.x - px, a.y - py);
        if (d < radius) line(a.x, a.y, px, py, 0.5 * (1 - d / radius));
      }

      ctx!.globalAlpha = 0.35;
      ctx!.beginPath();
      for (const n of nodes) {
        ctx!.moveTo(n.x + n.r, n.y);
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      }
      ctx!.fill();
      ctx!.globalAlpha = 0.22;
      ctx!.beginPath();
      for (const f of floaters) {
        ctx!.moveTo(f.x + f.r, f.y);
        ctx!.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      }
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
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [density, scatter, link, speed, radius, attract, dot, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
