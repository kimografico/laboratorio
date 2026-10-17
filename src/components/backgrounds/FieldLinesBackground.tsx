import { useEffect, useRef } from "react";

export interface FieldLinesBackgroundProps {
  /** Líneas de campo que salen del puntero */
  lines?: number;
  /** Polos opuestos que atraen las líneas y se mueven despacio por el contenedor */
  sinks?: number;
  /** Longitud de cada paso de integración (px) */
  step?: number;
  /** Pasos máximos por línea: limita su longitud */
  length?: number;
  /** Velocidad de giro de las líneas alrededor del puntero */
  spin?: number;
  /** Suavizado con el que el polo del puntero lo sigue */
  ease?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

const TAU = Math.PI * 2;

export default function FieldLinesBackground({
  lines = 28,
  sinks = 3,
  step = 6,
  length = 300,
  spin = 0.00005,
  ease = 0.1,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.22)",
  background = "#e0dad5",
  className,
}: FieldLinesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const OFF = -9999;
    const kx = new Float32Array(sinks);
    const ky = new Float32Array(sinks);
    const q = 1 / sinks;

    let width = 0;
    let height = 0;
    let px = OFF;
    let py = OFF;
    let tx = OFF;
    let ty = OFF;
    let ex = 0;
    let ey = 0;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (px === OFF) {
        px = tx;
        py = ty;
      }
    }

    // Campo de una carga +1 en (cx, cy) y `sinks` cargas -1/sinks; deja el resultado en (ex, ey)
    function field(x: number, y: number, cx: number, cy: number) {
      let dx = x - cx;
      let dy = y - cy;
      let d2 = dx * dx + dy * dy + 1;
      let inv = 1 / (d2 * Math.sqrt(d2));
      let fx = dx * inv;
      let fy = dy * inv;
      for (let k = 0; k < sinks; k++) {
        dx = x - kx[k];
        dy = y - ky[k];
        d2 = dx * dx + dy * dy + 1;
        inv = q / (d2 * Math.sqrt(d2));
        fx -= dx * inv;
        fy -= dy * inv;
      }
      ex = fx;
      ey = fy;
    }

    function animate(time: number) {
      if (px === OFF) {
        tx = width / 2 + Math.cos(time * 0.0003) * width * 0.08;
        ty = height / 2 + Math.sin(time * 0.0004) * height * 0.08;
      }
      const sx = px === OFF ? tx : px;
      const sy = px === OFF ? ty : py;
      if (px !== OFF) {
        px += (tx - px) * ease;
        py += (ty - py) * ease;
      }

      for (let k = 0; k < sinks; k++) {
        const phi = (k * TAU) / sinks + time * 0.00004;
        kx[k] = width / 2 + Math.cos(phi) * width * 0.34;
        ky[k] = height / 2 + Math.sin(phi) * height * 0.34;
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();

      for (let l = 0; l < lines; l++) {
        const th = (l * TAU) / lines + time * spin;
        let x = sx + Math.cos(th) * 5;
        let y = sy + Math.sin(th) * 5;
        ctx!.moveTo(x, y);

        for (let s = 0; s < length; s++) {
          field(x, y, sx, sy);
          let m = Math.hypot(ex, ey) || 1;
          field(x + (ex / m) * step * 0.5, y + (ey / m) * step * 0.5, sx, sy);
          m = Math.hypot(ex, ey) || 1;
          x += (ex / m) * step;
          y += (ey / m) * step;
          ctx!.lineTo(x, y);

          if (x < -60 || x > width + 60 || y < -60 || y > height + 60) break;
          let hit = false;
          for (let k = 0; k < sinks; k++) {
            const dx = x - kx[k];
            const dy = y - ky[k];
            if (dx * dx + dy * dy < 81) {
              ctx!.lineTo(kx[k], ky[k]);
              hit = true;
              break;
            }
          }
          if (hit) break;
        }
      }

      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineJoin = "round";
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.moveTo(sx + 3, sy);
      ctx!.arc(sx, sy, 3, 0, TAU);
      for (let k = 0; k < sinks; k++) {
        ctx!.moveTo(kx[k] + 2, ky[k]);
        ctx!.arc(kx[k], ky[k], 2, 0, TAU);
      }
      ctx!.fillStyle = color;
      ctx!.globalAlpha = 2.2;
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
  }, [lines, sinks, step, length, spin, ease, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
