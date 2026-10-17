import { useEffect, useRef } from "react";

export interface StringsBackgroundProps {
  /** Número de cuerdas horizontales */
  strings?: number;
  /** Tensión: velocidad a la que viaja la onda por la cuerda (0.05-0.25; se limita a 0.25 para que la simulación sea estable) */
  tension?: number;
  /** Amortiguación por fotograma (0.95 se apaga rápido, 0.999 vibra mucho tiempo) */
  decay?: number;
  /** Desplazamiento máximo al pulsar una cuerda (px) */
  pluck?: number;
  /** Pulsaciones suaves por segundo que se producen solas, para que no esté todo quieto */
  ambient?: number;
  /** Separación entre los nodos de cada cuerda (px) */
  segment?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

export default function StringsBackground({
  strings = 36,
  tension = 0.18,
  decay = 0.985,
  pluck = 14,
  ambient = 0.6,
  segment = 10,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.3)",
  background = "#e0dad5",
  className,
}: StringsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c2 = Math.min(0.25, tension);

    let width = 0;
    let height = 0;
    let cols = 0;
    let u = new Float32Array(0);
    let v = new Float32Array(0);
    let lastX = -1;
    let lastY = -1;
    let acc = 0;
    let last = -1;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / segment) + 1;
      u = new Float32Array(strings * cols);
      v = new Float32Array(strings * cols);
    }

    // Tira de la cuerda s por el punto x y la suelta: el desplazamiento inicial es un triángulo
    function pluckAt(s: number, x: number, amp: number) {
      const i0 = x / segment;
      const w = 6;
      const lim = pluck * 2.5;
      for (let i = Math.max(1, Math.floor(i0 - w)); i <= Math.min(cols - 2, Math.ceil(i0 + w)); i++) {
        const k = s * cols + i;
        // Pulsaciones seguidas se suman, pero la amplitud queda acotada
        u[k] = Math.max(-lim, Math.min(lim, u[k] + amp * Math.max(0, 1 - Math.abs(i - i0) / w)));
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (lastY >= 0) {
        const speed = Math.hypot(x - lastX, y - lastY);
        const amp = pluck * Math.min(1, 0.25 + speed / 40);
        for (let s = 0; s < strings; s++) {
          const ys = ((s + 1) * height) / (strings + 1);
          if ((lastY < ys && y >= ys) || (lastY > ys && y <= ys)) {
            const t = (ys - lastY) / (y - lastY);
            pluckAt(s, lastX + (x - lastX) * t, (y > lastY ? 1 : -1) * amp);
          }
        }
      }
      lastX = x;
      lastY = y;
    }

    function step() {
      for (let s = 0; s < strings; s++) {
        const o = s * cols;
        for (let i = 1; i < cols - 1; i++) {
          v[o + i] = (v[o + i] + c2 * (u[o + i - 1] + u[o + i + 1] - 2 * u[o + i])) * decay;
        }
        for (let i = 1; i < cols - 1; i++) u[o + i] += v[o + i];
      }
    }

    function animate(time: number) {
      const dt = last < 0 ? 16.67 : Math.min(time - last, 50);
      last = time;

      acc += (dt * ambient) / 1000;
      while (acc >= 1) {
        pluckAt(Math.floor(Math.random() * strings), Math.random() * width, (Math.random() < 0.5 ? -1 : 1) * pluck * 0.4);
        acc -= 1;
      }

      const n = dt > 25 ? 2 : 1;
      for (let k = 0; k < n; k++) step();

      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();
      for (let s = 0; s < strings; s++) {
        const y0 = ((s + 1) * height) / (strings + 1);
        const o = s * cols;
        ctx!.moveTo(0, y0);
        for (let i = 1; i < cols; i++) ctx!.lineTo(i * segment, y0 + u[o + i]);
      }
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineJoin = "round";
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
  }, [strings, tension, decay, pluck, ambient, segment, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
