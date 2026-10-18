import { useEffect, useRef } from "react";

export interface FogBackgroundProps {
  /** Tamaño de cada celda de vaho (px): más alto, más rápido y menos definido */
  cell?: number;
  /** Radio que limpia el puntero (px) */
  radius?: number;
  /** Rapidez con la que el vaho vuelve a formarse (fracción por fotograma) */
  regrow?: number;
  /** Gotas por segundo que resbalan dejando un rastro limpio */
  drips?: number;
  /** Opacidad del vaho (0-1) */
  opacity?: number;
  /** Opcional: fija el color del vaho. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Drip = { x: number; y: number; vy: number; phase: number; left: number };

export default function FogBackground({
  cell = 1,
  radius = 30,
  regrow = 0.003,
  drips = 3,
  opacity = 0.25,
  color,
  className,
}: FogBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    const OFF = -9999;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let fog = new Float32Array(0);
    let grain = new Float32Array(0);
    let px = OFF;
    let py = OFF;
    let tx = OFF;
    let ty = OFF;
    let wx = OFF;
    let wy = OFF;
    let drops: Drip[] = [];
    let acc = 0;
    let last = -1;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.max(1, Math.ceil(width / cell));
      rows = Math.max(1, Math.ceil(height / cell));
      off.width = cols;
      off.height = rows;
      fog = new Float32Array(cols * rows).fill(1);
      grain = Float32Array.from({ length: cols * rows }, () => Math.random());
      drops = [];
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (px === OFF) {
        px = tx;
        py = ty;
        wx = tx;
        wy = ty;
      }
    }

    function wipe(x: number, y: number, r: number, strength: number) {
      const i0 = Math.max(0, Math.floor((x - r) / cell));
      const i1 = Math.min(cols - 1, Math.ceil((x + r) / cell));
      const j0 = Math.max(0, Math.floor((y - r) / cell));
      const j1 = Math.min(rows - 1, Math.ceil((y + r) / cell));
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const d = Math.hypot((i + 0.5) * cell - x, (j + 0.5) * cell - y);
          if (d < r) {
            const idx = j * cols + i;
            fog[idx] = Math.max(0, fog[idx] - strength * Math.pow(1 - d / r, 1.5));
          }
        }
      }
    }

    function animate(time: number) {
      const dt = last < 0 ? 1 : Math.min((time - last) / 16.67, 3);
      last = time;

      if (px !== OFF) {
        px += (tx - px) * 0.35;
        py += (ty - py) * 0.35;
        const dist = Math.hypot(px - wx, py - wy);
        if (dist > 0.3) {
          const steps = Math.max(1, Math.ceil(dist / cell));
          for (let s = 1; s <= steps; s++) wipe(wx + ((px - wx) * s) / steps, wy + ((py - wy) * s) / steps, radius, 0.6);
          wx = px;
          wy = py;
        }
      }

      acc += (dt * 16.67 * drips) / 1000;
      while (acc >= 1) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.4;
        const i = Math.min(cols - 1, Math.floor(x / cell));
        const j = Math.min(rows - 1, Math.floor(y / cell));
        if (fog[j * cols + i] > 0.8) {
          drops.push({ x, y, vy: 0.8 + Math.random() * 1.2, phase: Math.random() * 6.28, left: 80 + Math.random() * 220 });
        }
        acc -= 1;
      }
      drops = drops.filter((d) => {
        d.y += d.vy * dt;
        d.x += Math.sin(d.y * 0.05 + d.phase) * 0.3 * dt;
        d.left -= d.vy * dt;
        wipe(d.x, d.y, cell * 1.4, 0.95);
        return d.left > 0 && d.y < height;
      });

      for (let i = 0; i < fog.length; i++) fog[i] = Math.min(1, fog[i] + regrow * dt);

      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--fog-color").trim() || style.color;
      const k = style.getPropertyValue("--fog-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;

      const img = octx!.createImageData(cols, rows);
      const data = img.data;
      for (let i = 0; i < fog.length; i++) {
        const f = fog[i];
        const t = Math.min(1, Math.max(0, (f - 0.1) / 0.8));
        const a = t * t * (3 - 2 * t) * opacity * mul * (0.92 + 0.16 * grain[i]);
        // Máscara de alfa pura: el RGB se tiña con `ink` mediante source-in tras el drawImage
        data[4 * i] = 0;
        data[4 * i + 1] = 0;
        data[4 * i + 2] = 0;
        data[4 * i + 3] = Math.min(1, a) * 255;
      }
      octx!.putImageData(img, 0, 0);

      ctx!.clearRect(0, 0, width, height);
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "high";
      ctx!.drawImage(off, 0, 0, cols, rows, 0, 0, width, height);
      // Tiña la máscara de alfa con la tinta viva de la página
      ctx!.globalCompositeOperation = "source-in";
      ctx!.fillStyle = ink;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "source-over";

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
  }, [cell, radius, regrow, drips, opacity]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--fog-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
