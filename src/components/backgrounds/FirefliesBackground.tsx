import { useEffect, useRef } from "react";

export interface FirefliesBackgroundProps {
  /** Número de luciérnagas */
  count?: number;
  /** Fuerza con la que se sincronizan entre sí (modelo de Kuramoto). Por debajo de ~0.7 destellan cada una a su aire; por encima aparecen oleadas */
  coupling?: number;
  /** Fuerza con la que el puntero, que destella a su propio ritmo, sincroniza a las cercanas */
  call?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Atracción de las luciérnagas hacia el puntero (px por fotograma²) */
  attract?: number;
  /** Radio máximo del resplandor de un destello (px) */
  glow?: number;
  /** Velocidad del tiempo */
  speed?: number;
  color?: string;
  background?: string;
  className?: string;
}

type Fly = { x: number; y: number; vx: number; vy: number; theta: number; omega: number };

const TAU = Math.PI * 2;
const OMEGA = TAU / 2.2;

export default function FirefliesBackground({
  count = 200,
  coupling = 0.5,
  call = 2.5,
  radius = 180,
  attract = 0.03,
  glow = 5,
  speed = 1.3,
  color = "#d4a017",
  background = "#e0dad5",
  className,
}: FirefliesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const OFF = -9999;

    let width = 0;
    let height = 0;
    let px = OFF;
    let py = OFF;
    let flies: Fly[] = [];
    let thetaC = 0;
    let last = -1;
    let raf = 0;

    function build() {
      flies = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        theta: Math.random() * TAU,
        omega: OMEGA * (0.8 + Math.random() * 0.4),
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
      px = clientX - rect.left;
      py = clientY - rect.top;
    }

    function animate(time: number) {
      const dtMs = last < 0 ? 16.67 : Math.min(time - last, 50);
      last = time;
      const dt = (dtMs / 1000) * speed;
      const fr = (dtMs / 16.67) * speed;
      thetaC += OMEGA * dt;

      // Campo medio de Kuramoto: r·e^(iψ) = media de e^(iθ)
      let sc = 0;
      let ss = 0;
      for (const f of flies) {
        sc += Math.cos(f.theta);
        ss += Math.sin(f.theta);
      }
      const r = Math.hypot(sc, ss) / flies.length;
      const psi = Math.atan2(ss, sc);

      for (const f of flies) {
        let dth = f.omega + coupling * r * Math.sin(psi - f.theta);
        let prox = 0;
        let dx = 0;
        let dy = 0;
        let d = 1e9;
        if (px !== OFF) {
          dx = px - f.x;
          dy = py - f.y;
          d = Math.hypot(dx, dy);
          if (d < radius) {
            prox = 1 - d / radius;
            dth += call * prox * Math.sin(thetaC - f.theta);
          }
        }
        f.theta = (f.theta + dth * dt) % TAU;

        // Vuelo errático; el puntero atrae a las cercanas pero sin amontonarlas encima
        f.vx += (Math.random() - 0.5) * 0.06 * fr;
        f.vy += (Math.random() - 0.5) * 0.06 * fr;
        if (prox > 0 && d > 24) {
          f.vx += (dx / d) * attract * prox * fr;
          f.vy += (dy / d) * attract * prox * fr;
        } else if (d <= 24) {
          f.vx -= (dx / (d || 1)) * 0.02 * fr;
          f.vy -= (dy / (d || 1)) * 0.02 * fr;
        }
        const sp = Math.hypot(f.vx, f.vy);
        const lim = 0.7;
        if (sp > lim) {
          f.vx *= lim / sp;
          f.vy *= lim / sp;
        }
        f.vx *= 0.995;
        f.vy *= 0.995;
        f.x = (f.x + f.vx * fr + width) % width;
        f.y = (f.y + f.vy * fr + height) % height;
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = color;
      for (const f of flies) {
        // Destello breve y brusco: (0.5 + 0.5·cos θ)^6
        const p = Math.pow(0.5 + 0.5 * Math.cos(f.theta), 6);
        for (let k = 0; k < 3; k++) {
          ctx!.globalAlpha = (0.05 + 0.3 * p) * (1 - k * 0.3);
          ctx!.beginPath();
          ctx!.arc(f.x, f.y, glow * (0.3 + 0.7 * p) * (1 - k * 0.3), 0, TAU);
          ctx!.fill();
        }
        ctx!.globalAlpha = 0.35 + 0.65 * p;
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, 1.6, 0, TAU);
        ctx!.fill();
      }

      // El puntero también destella: un anillo tenue marca su ritmo
      if (px !== OFF && call > 0) {
        const pc = Math.pow(0.5 + 0.5 * Math.cos(thetaC), 6);
        ctx!.strokeStyle = color;
        ctx!.globalAlpha = 0.1 + 0.3 * pc;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.arc(px, py, 5 + 5 * pc, 0, TAU);
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
  }, [count, coupling, call, radius, attract, glow, speed, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
