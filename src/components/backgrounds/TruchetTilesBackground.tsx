import { useEffect, useRef } from "react";

export interface TruchetTilesBackgroundProps {
  /** Tamaño de cada baldosa (px) */
  size?: number;
  /** Distancia de influencia del puntero (px) */
  proximity?: number;
  /** Suavizado del giro: cuánto tarda la baldosa en acelerar y frenar; cuanto más bajo, más inercial */
  ease?: number;
  /** Velocidad máxima de giro (°/s) */
  spin?: number;
  /** Milisegundos que debe esperar una baldosa antes de poder girar otra vez */
  cooldown?: number;
  /** Baldosas que giran solas por segundo */
  idle?: number;
  lineWidth?: number;
  /** Opacidad de las bandas (0-1) */
  alpha?: number;
  /** Opcional: fija el color de las bandas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Tile = { cx: number; cy: number; k: number; a: number; v: number; last: number };

const HALF = Math.PI / 2;

export default function TruchetTilesBackground({
  size = 40,
  proximity = 130,
  ease = 0.12,
  spin = 360,
  cooldown = 600,
  idle = 2,
  lineWidth = 1.5,
  alpha = 0.22,
  color,
  className,
}: TruchetTilesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
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
          tiles.push({ cx: col * size + h, cy: row * size + h, k, a: k * HALF, v: 0, last: -Infinity });
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

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

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

      const dtSec = dt / 1000;
      const smooth = 1 - Math.pow(1 - ease, dt / (1000 / 60));
      const spinRad = (spin * Math.PI) / 180;

      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--truchet-tiles-color").trim() || style.color;
      const k = style.getPropertyValue("--truchet-tiles-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;

      for (const t of tiles) {
        const diff = t.k * HALF - t.a;
        const dist = Math.abs(diff);
        const target = Math.sign(diff) * Math.min(spinRad, dtSec > 0 ? dist / dtSec : 0);
        t.v += (target - t.v) * smooth;
        let step = t.v * dtSec;
        if (Math.abs(step) > dist) step = Math.sign(step) * dist;
        t.a += step;
        const c = Math.cos(t.a);
        const s = Math.sin(t.a);
        ctx!.setTransform(c, s, -s, c, t.cx, t.cy);
        ctx!.moveTo(0, -h);
        ctx!.arc(-h, -h, h, 0, HALF);
        ctx!.moveTo(0, h);
        ctx!.arc(h, h, h, Math.PI, Math.PI * 1.5);
      }

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      setAlpha(alpha * mul);
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";
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
  }, [size, proximity, ease, spin, cooldown, idle, lineWidth, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--truchet-tiles-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
