import { useEffect, useRef } from "react";

export interface VoronoiBackgroundProps {
  /** Semillas por cada 100.000 px² del contenedor */
  density?: number;
  /** Velocidad de deriva de las semillas (px por fotograma) */
  speed?: number;
  /** Radio en el que el puntero aparta las semillas cercanas (px) */
  radius?: number;
  /** Fuerza con la que el puntero aparta las semillas */
  push?: number;
  /** Radio del punto de cada semilla (px) */
  dot?: number;
  /** Opacidad con la que se rellena la celda del puntero (0-1) */
  highlight?: number;
  lineWidth?: number;
  /** Opacidad de las aristas y los puntos (0-1) */
  alpha?: number;
  /** Opcional: fija el color de las aristas y puntos. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Site = { x: number; y: number; vx: number; vy: number };

const MAX_SITES = 140;
const MARGIN = 60;

function clip(src: Float64Array, n: number, dst: Float64Array, nx: number, ny: number, c: number) {
  let m = 0;
  for (let k = 0; k < n; k++) {
    const k2 = (k + 1) % n;
    const ax = src[2 * k];
    const ay = src[2 * k + 1];
    const bx = src[2 * k2];
    const by = src[2 * k2 + 1];
    const da = nx * ax + ny * ay - c;
    const db = nx * bx + ny * by - c;
    if (da <= 0) {
      dst[2 * m] = ax;
      dst[2 * m + 1] = ay;
      m++;
      if (db > 0) {
        const t = da / (da - db);
        dst[2 * m] = ax + (bx - ax) * t;
        dst[2 * m + 1] = ay + (by - ay) * t;
        m++;
      }
    } else if (db <= 0) {
      const t = da / (da - db);
      dst[2 * m] = ax + (bx - ax) * t;
      dst[2 * m + 1] = ay + (by - ay) * t;
      m++;
    }
  }
  return m;
}

export default function VoronoiBackground({
  density = 3,
  speed = 0.25,
  radius = 150,
  push = 1.2,
  dot = 1.6,
  highlight = 0.07,
  lineWidth = 1,
  alpha = 0.2,
  color,
  className,
}: VoronoiBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const OFF = -9999;
    const cap = 2 * (MAX_SITES + 24);
    const bufA = new Float64Array(cap);
    const bufB = new Float64Array(cap);
    const hl = new Float64Array(cap);
    const ptr: Site = { x: 0, y: 0, vx: 0, vy: 0 };

    let width = 0;
    let height = 0;
    let px = OFF;
    let py = OFF;
    let sites: Site[] = [];
    let all: Site[] = [];
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      const n = Math.min(MAX_SITES, Math.max(6, Math.round((density * width * height) / 100000)));
      sites = Array.from({ length: n }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2 * speed,
        vy: (Math.random() - 0.5) * 2 * speed,
      }));
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
    }

    function move(s: Site) {
      s.x += s.vx;
      s.y += s.vy;
      if (px !== OFF) {
        const dx = s.x - px;
        const dy = s.y - py;
        const d = Math.hypot(dx, dy);
        if (d < radius && d > 0.001) {
          const f = (1 - d / radius) * push;
          s.x += (dx / d) * f;
          s.y += (dy / d) * f;
        }
      }
      if (s.x < 0 || s.x > width) {
        s.vx = -s.vx;
        s.x = Math.min(Math.max(s.x, 0), width);
      }
      if (s.y < 0 || s.y > height) {
        s.vy = -s.vy;
        s.y = Math.min(Math.max(s.y, 0), height);
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate() {
      all.length = 0;
      for (const s of sites) {
        move(s);
        all.push(s);
      }
      if (px !== OFF) {
        ptr.x = px;
        ptr.y = py;
        all.push(ptr);
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();
      let hlN = 0;

      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--voronoi-color").trim() || style.color;
      const k = style.getPropertyValue("--voronoi-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineWidth = lineWidth;
      ctx!.lineJoin = "round";

      for (let i = 0; i < all.length; i++) {
        const s = all[i];
        let src = bufA;
        let dst = bufB;
        src.set([-MARGIN, -MARGIN, width + MARGIN, -MARGIN, width + MARGIN, height + MARGIN, -MARGIN, height + MARGIN]);
        let n = 4;

        for (let j = 0; j < all.length; j++) {
          if (j === i) continue;
          const o = all[j];
          const c = (o.x * o.x + o.y * o.y - s.x * s.x - s.y * s.y) / 2;
          n = clip(src, n, dst, o.x - s.x, o.y - s.y, c);
          const tmp = src;
          src = dst;
          dst = tmp;
          if (n < 3) break;
        }
        if (n < 3) continue;

        ctx!.moveTo(src[0], src[1]);
        for (let k = 1; k < n; k++) ctx!.lineTo(src[2 * k], src[2 * k + 1]);
        ctx!.closePath();

        if (s === ptr) {
          hl.set(src.subarray(0, 2 * n));
          hlN = n;
        }
      }

      setAlpha(alpha * mul);
      ctx!.stroke();

      if (hlN >= 3 && highlight > 0) {
        ctx!.beginPath();
        ctx!.moveTo(hl[0], hl[1]);
        for (let k = 1; k < hlN; k++) ctx!.lineTo(hl[2 * k], hl[2 * k + 1]);
        ctx!.closePath();
        setAlpha(highlight * mul);
        ctx!.fill();
      }

      ctx!.beginPath();
      for (const s of sites) {
        ctx!.moveTo(s.x + dot, s.y);
        ctx!.arc(s.x, s.y, dot, 0, Math.PI * 2);
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
  }, [density, speed, radius, push, dot, highlight, lineWidth, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--voronoi-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
