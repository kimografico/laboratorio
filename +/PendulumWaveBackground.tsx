import { useEffect, useRef } from "react";

export interface PendulumWaveBackgroundProps {
  /** Número de péndulos */
  count?: number;
  /** Oscilaciones que da el péndulo más largo durante un ciclo; el resto da una más cada uno. Más alto, ondas más finas */
  base?: number;
  /** Segundos que dura un ciclo completo: al terminarlo todos vuelven a estar en fase */
  period?: number;
  /** Amplitud inicial de las oscilaciones (radianes) */
  amplitude?: number;
  /** Radio de cada pesa (px) */
  bob?: number;
  /** Dibuja una línea que une las pesas y deja ver la onda */
  connect?: boolean;
  /** Fuerza con la que el puntero empuja a las pesas que toca */
  push?: number;
  /** Rapidez con la que la onda se recompone tras una perturbación (por segundo) */
  restore?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

type Bob = { w: number; L: number; x0: number; A: number; phi: number };

const TAU = Math.PI * 2;

// Normaliza un ángulo a (-π, π]
function wrap(a: number) {
  return a - TAU * Math.floor((a + Math.PI) / TAU);
}

export default function PendulumWaveBackground({
  count = 28,
  base = 40,
  period = 60,
  amplitude = 0.3,
  bob = 4,
  connect = true,
  push = 0.5,
  restore = 0.05,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.45)",
  background = "#e0dad5",
  className,
}: PendulumWaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let bobs: Bob[] = [];
    let t0 = -1;
    let tNow = 0;
    let last = -1;
    let lastX = -1;
    let lastY = -1;
    let raf = 0;

    function build() {
      // La longitud de cada péndulo es proporcional al cuadrado de su periodo: ω = 2π·(base + i)/period, L ∝ 1/ω²
      const Lmax = height * 0.85;
      bobs = Array.from({ length: count }, (_, i) => ({
        w: (TAU * (base + i)) / period,
        L: Lmax * Math.pow(base / (base + i), 2),
        x0: width * (0.06 + (0.88 * i) / Math.max(1, count - 1)),
        A: amplitude,
        phi: 0,
      }));
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
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (lastX >= 0 && t0 >= 0) {
        const vx = (x - lastX) * 60;
        const reach = 50;
        for (const b of bobs) {
          const th = b.A * Math.cos(b.w * tNow + b.phi);
          const dth = -b.A * b.w * Math.sin(b.w * tNow + b.phi);
          const bx = b.x0 + b.L * Math.sin(th);
          const by = b.L * Math.cos(th);
          const d = Math.hypot(bx - x, by - y);
          if (d < reach) {
            // La pesa recibe velocidad tangencial; se recalculan amplitud y fase de su movimiento armónico
            const ndth = dth + ((vx * push * (1 - d / reach)) / b.L);
            b.A = Math.min(1.2, Math.hypot(th, ndth / b.w));
            b.phi = wrap(Math.atan2(-ndth / b.w, th) - b.w * tNow);
          }
        }
      }
      lastX = x;
      lastY = y;
    }

    function animate(time: number) {
      if (t0 < 0) t0 = time;
      tNow = (time - t0) / 1000;
      const dt = last < 0 ? 0.0167 : Math.min((time - last) / 1000, 0.1);
      last = time;

      // La amplitud y la fase vuelven poco a poco a las del patrón original
      const k = Math.exp(-restore * dt);
      for (const b of bobs) {
        b.A = amplitude + (b.A - amplitude) * k;
        b.phi = wrap(b.phi * k);
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      const bx = new Array<number>(count);
      const by = new Array<number>(count);
      ctx!.beginPath();
      for (let i = 0; i < count; i++) {
        const b = bobs[i];
        const th = b.A * Math.cos(b.w * tNow + b.phi);
        bx[i] = b.x0 + b.L * Math.sin(th);
        by[i] = b.L * Math.cos(th);
        ctx!.moveTo(b.x0, 0);
        ctx!.lineTo(bx[i], by[i]);
      }
      ctx!.globalAlpha = 0.45;
      ctx!.stroke();

      if (connect) {
        ctx!.beginPath();
        ctx!.moveTo(bx[0], by[0]);
        for (let i = 1; i < count; i++) ctx!.lineTo(bx[i], by[i]);
        ctx!.globalAlpha = 0.8;
        ctx!.stroke();
      }

      ctx!.globalAlpha = 1;
      ctx!.fillStyle = color;
      ctx!.beginPath();
      for (let i = 0; i < count; i++) {
        ctx!.moveTo(bx[i] + bob, by[i]);
        ctx!.arc(bx[i], by[i], bob, 0, TAU);
      }
      ctx!.fill();

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
  }, [count, base, period, amplitude, bob, connect, push, restore, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
