import { useEffect, useRef } from "react";

export interface PendulumWaveBackgroundProps {
  /** Puntos por fila (cada uno es un péndulo con su propia frecuencia) */
  count?: number;
  /** Número de filas, repartidas en la altura del contenedor */
  rows?: number;
  /** Amplitud del vaivén, como fracción de la separación entre filas */
  amplitude?: number;
  /** Segundos que tarda el patrón completo en volver a alinearse (más alto = más lento) */
  period?: number;
  /** Radio de cada punto (px) */
  dot?: number;
  /** Cuánto refuerza el puntero la amplitud de los péndulos cercanos (0 = no reacciona) */
  excite?: number;
  /** Opacidad de los puntos (0-1) */
  alpha?: number;
  /** Opacidad de la línea que une los puntos de cada fila, como fracción de la de los puntos (0 = sin línea) */
  line?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

export default function PendulumWaveBackground({
  count = 74,
  rows = 8,
  amplitude = 0.5,
  period = 250,
  dot = 2,
  excite = 1.7,
  alpha = 0.3,
  line = 0.14,
  color,
  className,
}: PendulumWaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let boost = new Float32Array(0); // refuerzo de amplitud de cada péndulo (por fila y columna), suavizado
    let level = new Float32Array(0); // petición de refuerzo (la sube el puntero y decae sola)
    let lastX = -1;
    let lastY = -1;
    let raf = 0;
    const offs = Array.from({ length: 64 }, (_, i) => (i * 0.37) % 1); // desfase del ciclo de cada fila

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      boost = new Float32Array(count * rows);
      level = new Float32Array(count * rows);
    }

    // El puntero da un empujón a los péndulos por los que pasa: oscilan más y después se calman
    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const x0 = lastX < 0 ? x : lastX;
      const y0 = lastY < 0 ? y : lastY;
      lastX = x;
      lastY = y;
      if (excite <= 0) return;
      const sx = x - x0;
      const sy = y - y0;
      const len2 = sx * sx + sy * sy;
      const gap = h / (rows + 1);
      for (let r = 0; r < rows; r++) {
        const by = gap * (r + 1);
        for (let c = 0; c < count; c++) {
          const bx = ((c + 0.5) * w) / count;
          const t = len2 > 0 ? Math.min(1, Math.max(0, ((bx - x0) * sx + (by - y0) * sy) / len2)) : 0;
          const d = Math.hypot(bx - (x0 + t * sx), by - (y0 + t * sy));
          if (d < 140) {
            const f = Math.pow(1 - d / 140, 1.2) * excite;
            const i = r * count + c;
            if (f > level[i]) level[i] = f;
          }
        }
      }
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--pendulum-color").trim() || style.color;
      const k = style.getPropertyValue("--pendulum-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineWidth = 1;

      const gap = h / (rows + 1);
      const T = period * 1000;
      for (let r = 0; r < rows; r++) {
        const by = gap * (r + 1);
        // Cada fila lleva su propio punto del ciclo, así no están todas alineadas a la vez
        const t0 = time + offs[r] * T;
        // Las filas de arriba son más pequeñas y tenues: sensación de profundidad
        const depth = 0.55 + 0.45 * ((r + 1) / rows);
        ctx!.beginPath();
        for (let c = 0; c < count; c++) {
          const i = r * count + c;
          boost[i] += (level[i] - boost[i]) * 0.1;
          level[i] *= 0.985;
          if (level[i] < 0.002) level[i] = 0;
          // Péndulo: el c-ésimo da (N0 + c) oscilaciones en un ciclo completo. Así se forman ondas que viajan,
          // figuras estacionarias y desorden, y al cerrar el ciclo vuelven a alinearse todos
          const cycles = 14 + c;
          const y = by + gap * amplitude * (1 + 1.6 * boost[i]) * Math.cos((2 * Math.PI * cycles * t0) / T);
          const x = ((c + 0.5) * w) / count;
          if (c === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        if (line > 0) {
          ctx!.globalAlpha = Math.min(1, alpha * mul * line * depth);
          ctx!.stroke();
        }
        ctx!.beginPath();
        for (let c = 0; c < count; c++) {
          const i = r * count + c;
          const cycles = 14 + c;
          const y = by + gap * amplitude * (1 + 1.6 * boost[i]) * Math.cos((2 * Math.PI * cycles * t0) / T);
          const x = ((c + 0.5) * w) / count;
          const rr = dot * depth * (1 + 0.5 * boost[i]);
          ctx!.moveTo(x + rr, y);
          ctx!.arc(x, y, rr, 0, Math.PI * 2);
        }
        ctx!.globalAlpha = Math.min(1, alpha * mul * depth);
        ctx!.fill();
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
  }, [count, rows, amplitude, period, dot, excite, alpha, line]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--pendulum-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
