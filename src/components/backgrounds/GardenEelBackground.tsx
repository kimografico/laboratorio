import { useEffect, useRef } from "react";

export interface GardenEelBackgroundProps {
  /** Anguilas cercanas: con contorno, ojo y madriguera */
  near?: number;
  /** Anguilas lejanas: más cortas y tenues, solo silueta */
  far?: number;
  /** Altura de la anguila más cercana con el cuerpo estirado (px) */
  size?: number;
  /** Distancia a la que notan el puntero y se esconden (px) */
  reach?: number;
  /** Fracción de altura que conservan escondidas (0 = desaparecen del todo) */
  retract?: number;
  /** Rapidez con que vuelven a salir (0.9 deprisa – 0.99 muy despacio) */
  heal?: number;
  /** Inclinación de la corriente que las empuja a todas (radianes) */
  current?: number;
  /** Opacidad del contorno de las cercanas (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Eel = {
  bx: number;
  L: number;
  depth: number;
  far: boolean;
  phase: number;
  ext: number;
  lean: number;
  hx: number;
  hy: number;
};

const N = 16;

export default function GardenEelBackground({
  near = 30,
  far = 30,
  size = 320,
  reach = 200,
  retract = 0.05,
  heal = 0.97,
  current = 0.05,
  alpha = 0.3,
  lineWidth = 1.1,
  color,
  className,
}: GardenEelBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let hasPointer = false;
    let eels: Eel[] = [];
    let raf = 0;
    const xs = new Float64Array(N + 1);
    const ys = new Float64Array(N + 1);
    const lx = new Float64Array(N + 1);
    const ly = new Float64Array(N + 1);
    const rx = new Float64Array(N + 1);
    const ry = new Float64Array(N + 1);

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const kinds: boolean[] = [...Array(near).fill(false), ...Array(far).fill(true)];
      eels = kinds
        .map((isFar) => {
          const depth = isFar ? 0.3 + 0.15 * Math.random() : 0.65 + 0.35 * Math.random();
          return {
            bx: Math.random() * w,
            L: size * (0.45 + 0.6 * depth) * (0.75 + 0.5 * Math.random()),
            depth,
            far: isFar,
            phase: Math.random() * Math.PI * 2,
            ext: 1,
            lean: (Math.random() - 0.5) * 0.2,
            hx: 0,
            hy: 0,
          };
        })
        .sort((a, b) => a.depth - b.depth);
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      hasPointer = true;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function drawEel(e: Eel, time: number, mul: number) {
      const ts = time * 0.001;
      // Se esconden cuando el puntero se acerca a la cabeza (rápido) y salen despacio al irse
      let prox = 0;
      if (hasPointer) prox = Math.pow(Math.max(0, 1 - Math.hypot(e.hx - px, e.hy - py) / reach), 0.8);
      const tgt = 1 - (1 - retract) * prox;
      e.ext += (tgt - e.ext) * (tgt < e.ext ? 0.2 : 1 - heal);
      const len = e.L * e.ext * (0.94 + 0.06 * Math.sin(ts * 0.6 + e.phase));
      const seg = len / N;
      const base = h - 4;
      const lean = -Math.PI / 2 + Math.sin(ts * 0.25 + 1) * current + e.lean;
      xs[0] = e.bx;
      ys[0] = base;
      let x = e.bx;
      let y = base;
      for (let i = 1; i <= N; i++) {
        const f = i / N;
        // Ondulación que sube por el cuerpo y la cabeza que mira a un lado y a otro
        const a = lean + Math.sin(ts * 1.2 - i * 0.4 + e.phase) * 0.18 * (0.3 + 0.7 * f) + (i > N - 4 ? Math.sin(ts * 0.5 + e.phase) * 0.3 * ((i - (N - 4)) / 3) : 0);
        x += Math.cos(a) * seg;
        y += Math.sin(a) * seg;
        xs[i] = x;
        ys[i] = y;
      }
      e.hx = xs[N];
      e.hy = ys[N];

      const W = e.L * 0.03;
      const a0 = alpha * mul * (0.15 + 0.85 * Math.pow(e.depth, 1.4));
      ctx!.lineWidth = lineWidth * (0.5 + 0.5 * e.depth);
      const hw = (i: number) => W * (0.85 + 0.35 * Math.pow(i / N, 4));
      for (let i = 0; i <= N; i++) {
        const i0 = Math.max(0, i - 1);
        const i1 = Math.min(N, i + 1);
        const dx = xs[i1] - xs[i0];
        const dy = ys[i1] - ys[i0];
        const d = Math.hypot(dx, dy) || 1;
        lx[i] = xs[i] - (dy / d) * hw(i);
        ly[i] = ys[i] + (dx / d) * hw(i);
        rx[i] = xs[i] + (dy / d) * hw(i);
        ry[i] = ys[i] - (dx / d) * hw(i);
      }
      ctx!.beginPath();
      ctx!.moveTo(lx[0], ly[0]);
      for (let i = 1; i <= N; i++) ctx!.lineTo(lx[i], ly[i]);
      const heading = Math.atan2(ys[N] - ys[N - 1], xs[N] - xs[N - 1]);
      ctx!.arc(xs[N], ys[N], hw(N), heading + Math.PI / 2, heading - Math.PI / 2, true);
      for (let i = N - 1; i >= 0; i--) ctx!.lineTo(rx[i], ry[i]);
      ctx!.closePath();
      if (e.far) {
        setAlpha(alpha * mul * 0.2);
        ctx!.fill();
        return;
      }
      setAlpha(a0 * 0.2);
      ctx!.fill();
      setAlpha(a0);
      ctx!.stroke();
      // Borde de la madriguera
      ctx!.beginPath();
      ctx!.ellipse(e.bx, base, W * 2.4, W * 0.7, 0, Math.PI, Math.PI * 2);
      setAlpha(a0 * 0.5);
      ctx!.stroke();
      // Ojo
      ctx!.globalCompositeOperation = "destination-out";
      ctx!.globalAlpha = 1;
      ctx!.beginPath();
      ctx!.arc(xs[N - 1] + (-(ys[N] - ys[N - 2]) / (Math.hypot(xs[N] - xs[N - 2], ys[N] - ys[N - 2]) || 1)) * W * 0.4, ys[N - 1] + ((xs[N] - xs[N - 2]) / (Math.hypot(xs[N] - xs[N - 2], ys[N] - ys[N - 2]) || 1)) * W * 0.4, Math.max(0.9, W * 0.28), 0, Math.PI * 2);
      ctx!.fill();
      ctx!.globalCompositeOperation = "source-over";
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--eel-color").trim() || style.color;
      const k = style.getPropertyValue("--eel-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      for (const e of eels) drawEel(e, time, mul);
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
  }, [near, far, size, reach, retract, heal, current, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--eel-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}