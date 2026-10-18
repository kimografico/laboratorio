import { useEffect, useRef } from "react";

export interface ClothBackgroundProps {
  /** Separación entre nodos de la red (px) */
  spacing?: number;
  /** Gravedad (px por fotograma²): con "top" cuelga y se estira; con "edges" cae hacia el centro */
  gravity?: number;
  /** Iteraciones de las restricciones por fotograma: más iteraciones, tela más rígida */
  iterations?: number;
  /** Intensidad del viento ambiental que mece la red */
  wind?: number;
  /** Radio en el que el puntero empuja la red (px) */
  radius?: number;
  /** Fuerza del empuje: se multiplica por la velocidad del puntero */
  push?: number;
  /** Amortiguación por fotograma (1 = sin pérdidas) */
  damping?: number;
  /** Anclajes: "top" cuelga de la fila superior (cortina); "edges" la fija por todo el borde (membrana) */
  pin?: "top" | "edges";
  /** Radio de los puntos de cada nodo (px); 0 para no dibujarlos */
  dot?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

const TAU = Math.PI * 2;

export default function ClothBackground({
  spacing = 40,
  gravity = 0.5,
  iterations = 10,
  wind = 0.05,
  radius = 130,
  push = 0.7,
  damping = 0.99,
  pin = "top",
  dot = 3,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.3)",
  background = "#e0dad5",
  className,
}: ClothBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const OFF = -9999;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let ox = new Float32Array(0);
    let oy = new Float32Array(0);
    let fixed = new Uint8Array(0);
    let lastX = OFF;
    let lastY = OFF;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;
      const n = cols * rows;
      x = new Float32Array(n);
      y = new Float32Array(n);
      ox = new Float32Array(n);
      oy = new Float32Array(n);
      fixed = new Uint8Array(n);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          x[k] = ox[k] = i * spacing;
          y[k] = oy[k] = j * spacing;
          const edge = j === 0 || (pin === "edges" && (j === rows - 1 || i === 0 || i === cols - 1));
          fixed[k] = edge ? 1 : 0;
        }
      }
    }

    // El puntero empuja los nodos cercanos en la dirección en que se mueve: se desplaza x e y pero no ox/oy,
    // así que el empuje se convierte en velocidad en el siguiente fotograma
    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;
      if (lastX !== OFF) {
        const vx = cx - lastX;
        const vy = cy - lastY;
        for (let k = 0; k < x.length; k++) {
          if (fixed[k]) continue;
          const d = Math.hypot(x[k] - cx, y[k] - cy);
          if (d < radius) {
            const w = (1 - d / radius) * (1 - d / radius) * push;
            x[k] += Math.max(-spacing, Math.min(spacing, vx * w));
            y[k] += Math.max(-spacing, Math.min(spacing, vy * w));
          }
        }
      }
      lastX = cx;
      lastY = cy;
    }

    function satisfy(a: number, b: number) {
      const dx = x[b] - x[a];
      const dy = y[b] - y[a];
      const d = Math.hypot(dx, dy) || 1e-6;
      const diff = ((d - spacing) / d) * 0.5;
      const fa = fixed[a];
      const fb = fixed[b];
      if (!fa && !fb) {
        x[a] += dx * diff;
        y[a] += dy * diff;
        x[b] -= dx * diff;
        y[b] -= dy * diff;
      } else if (!fa) {
        x[a] += dx * diff * 2;
        y[a] += dy * diff * 2;
      } else if (!fb) {
        x[b] -= dx * diff * 2;
        y[b] -= dy * diff * 2;
      }
    }

    function animate(time: number) {
      const lim = spacing;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          if (fixed[k]) continue;
          let vx = (x[k] - ox[k]) * damping;
          let vy = (y[k] - oy[k]) * damping;
          vx = Math.max(-lim, Math.min(lim, vx));
          vy = Math.max(-lim, Math.min(lim, vy));
          ox[k] = x[k];
          oy[k] = y[k];
          const w = wind * Math.sin(time * 0.0007 + y[k] * 0.012 + x[k] * 0.005) * (pin === "top" ? 0.3 + (j / rows) : 1);
          x[k] += vx + w;
          y[k] += vy + gravity;
        }
      }

      for (let it = 0; it < iterations; it++) {
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const k = j * cols + i;
            if (i < cols - 1) satisfy(k, k + 1);
            if (j < rows - 1) satisfy(k, k + cols);
          }
        }
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();
      for (let j = 0; j < rows; j++) {
        ctx!.moveTo(x[j * cols], y[j * cols]);
        for (let i = 1; i < cols; i++) ctx!.lineTo(x[j * cols + i], y[j * cols + i]);
      }
      for (let i = 0; i < cols; i++) {
        ctx!.moveTo(x[i], y[i]);
        for (let j = 1; j < rows; j++) ctx!.lineTo(x[j * cols + i], y[j * cols + i]);
      }
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineJoin = "round";
      ctx!.stroke();

      if (dot > 0) {
        ctx!.beginPath();
        for (let k = 0; k < x.length; k++) {
          ctx!.moveTo(x[k] + dot, y[k]);
          ctx!.arc(x[k], y[k], dot, 0, TAU);
        }
        ctx!.fillStyle = color;
        ctx!.fill();
      }

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
  }, [spacing, gravity, iterations, wind, radius, push, damping, pin, dot, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
