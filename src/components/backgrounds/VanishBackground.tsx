import { useEffect, useRef } from "react";

export interface VanishBackgroundProps {
  /** Número de estrellas */
  count?: number;
  /** Velocidad de avance: profundidad recorrida por milisegundo (0.0003 ≈ 3 s de recorrido) */
  speed?: number;
  /** Apertura de la perspectiva como fracción de la dimensión menor */
  focal?: number;
  /** Longitud de la estela, en fotogramas de avance */
  streak?: number;
  /** Suavizado con el que el punto de fuga sigue al puntero */
  ease?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

export default function VanishBackground({
  count = 600,
  speed = 0.0006,
  focal = 0.25,
  streak = 2,
  ease = 0.05,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.55)",
  background = "#e0dad5",
  className,
}: VanishBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const xs = new Float32Array(count);
    const ys = new Float32Array(count);
    const zs = new Float32Array(count);

    let width = 0;
    let height = 0;
    let vx = 0;
    let vy = 0;
    let tx = 0;
    let ty = 0;
    let pointer = false;
    let last = -1;
    let raf = 0;

    function spawn(i: number, anywhere: boolean) {
      xs[i] = Math.random() * 2 - 1;
      ys[i] = Math.random() * 2 - 1;
      zs[i] = anywhere ? 0.05 + Math.random() * 0.95 : 1;
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      if (!pointer) {
        vx = tx = width / 2;
        vy = ty = height / 2;
      }
      for (let i = 0; i < count; i++) spawn(i, true);
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      pointer = true;
    }

    function animate(time: number) {
      const dt = last < 0 ? 16 : Math.min(time - last, 50);
      last = time;

      if (!pointer) {
        tx = width / 2 + Math.cos(time * 0.0002) * width * 0.08;
        ty = height / 2 + Math.sin(time * 0.00027) * height * 0.08;
      }
      vx += (tx - vx) * ease;
      vy += (ty - vy) * ease;

      const f = Math.min(width, height) * focal;
      const tail = speed * 16.7 * streak;

      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.lineCap = "round";

      for (let i = 0; i < count; i++) {
        zs[i] -= speed * dt;
        if (zs[i] <= 0.03) {
          spawn(i, false);
          continue;
        }
        const z = zs[i];
        const z0 = z + tail;
        const X = vx + (xs[i] * f) / z;
        const Y = vy + (ys[i] * f) / z;
        if (X < -50 || X > width + 50 || Y < -50 || Y > height + 50) {
          spawn(i, false);
          continue;
        }
        const depth = 1 - z;
        ctx!.globalAlpha = Math.min(1, Math.pow(depth, 1.2));
        ctx!.lineWidth = lineWidth * (0.6 + depth * 1.2);
        ctx!.beginPath();
        ctx!.moveTo(vx + (xs[i] * f) / z0, vy + (ys[i] * f) / z0);
        ctx!.lineTo(X, Y);
        ctx!.stroke();
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
  }, [count, speed, focal, streak, ease, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
