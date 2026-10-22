import { useEffect, useRef } from "react";

export interface LightsBackgroundProps {
  /** Guirnaldas colgadas de lado a lado */
  strands?: number;
  /** Bombillas por guirnalda */
  bulbs?: number;
  /** Alterna las bombillas multicolor */
  multicolor?: boolean;
  /** Peso de las bombillas, aplicado como gravedad a cada punto de la cuerda */
  weight?: number;
  /** Tensión de la cuerda en escala 0-100 */
  tension?: number;
  /** Radio de cada bombilla (px) */
  size?: number;
  /** Intensidad de la brisa (0 = quietas) */
  wind?: number;
  /** Amortiguación de la cuerda (0.85 muy blanda y sin rebote – 0.99 elástica); baja = menos elástica */
  damping?: number;
  /** Distancia a la que el puntero enciende las bombillas (px) */
  glow?: number;
  /** Velocidad de la onda de luz que provoca un clic (px por segundo) */
  pulse?: number;
  /** Radio de influencia del puntero al rozar las cuerdas (px) */
  radius?: number;
  /** Opacidad de los trazos (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Strand = {
  n: number;
  x: Float32Array;
  y: Float32Array;
  ox: Float32Array;
  oy: Float32Array;
  rest: number;
  phase: number;
  depth: number;
  bulbOffset: number;
  glow: Float32Array; // encendido suavizado por cercanía del puntero
};

export default function LightsBackground({
  strands = 4,
  bulbs = 16,
  multicolor = true,
  weight = 0.4,
  tension = 50,
  size = 7,
  wind = 2,
  damping = 0.93,
  glow = 170,
  pulse = 600,
  radius = 120,
  alpha = 0.32,
  lineWidth = 1,
  color,
  className,
}: LightsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const NB = Math.max(3, Math.round(bulbs));
    const n = NB * 6 + 1;
    const tensionRatio = Math.min(100, Math.max(0, tension)) / 100;
    const iterations = Math.round(
      10 + (990 * (Math.exp(2.3 * tensionRatio) - 1)) / (Math.exp(2.3) - 1),
    );
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let pvx = 0;
    let pvy = 0;
    let hasPointer = false;
    let list: Strand[] = [];
    let pulses: { x: number; y: number; t0: number }[] = [];
    let now = 0;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      list = Array.from({ length: Math.max(1, Math.round(strands)) }, (_, k) => {
        const depth = 0.5 + 0.5 * Math.random();
        const ax = -20;
        const bx = w + 20;
        const ay = h * (0.01 + (0.5 * k) / Math.max(1, strands) + 0.04 * Math.random());
        const by = h * (0.01 + (0.5 * k) / Math.max(1, strands) + 0.04 * Math.random());
        const chord = Math.hypot(bx - ax, by - ay);
        const s: Strand = {
          n,
          x: new Float32Array(n),
          y: new Float32Array(n),
          ox: new Float32Array(n),
          oy: new Float32Array(n),
          rest: chord / (n - 1),
          phase: Math.random() * 10,
          depth,
          bulbOffset: k % 2 === 0 ? 5 : 2,
          glow: new Float32Array(NB),
        };
        for (let i = 0; i < n; i++) {
          const u = i / (n - 1);
          s.x[i] = ax + (bx - ax) * u;
          s.y[i] = ay + (by - ay) * u;
          s.ox[i] = s.x[i];
          s.oy[i] = s.y[i];
        }
        return s;
      });
    }

    function onMove(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const nx = clientX - rect.left;
      const ny = clientY - rect.top;
      if (hasPointer) {
        pvx = Math.max(-40, Math.min(40, pvx + (nx - px) * 0.5));
        pvy = Math.max(-40, Math.min(40, pvy + (ny - py) * 0.5));
      }
      px = nx;
      py = ny;
      hasPointer = true;
    }

    // Un clic lanza una onda circular de luz que recorre las bombillas a su paso
    function onDown(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      pulses.push({ x, y, t0: now });
      if (pulses.length > 6) pulses.shift();
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function step(s: Strand, time: number) {
      const { x, y, ox, oy } = s;
      for (let i = 1; i < s.n - 1; i++) {
        const vx = (x[i] - ox[i]) * damping;
        const vy = (y[i] - oy[i]) * damping;
        ox[i] = x[i];
        oy[i] = y[i];
        x[i] += vx + Math.sin(time * 0.0006 + s.phase + i * 0.2) * wind * 0.05;
        y[i] += vy + weight;
        if (hasPointer) {
          const d = Math.hypot(x[i] - px, y[i] - py);
          if (d < radius) {
            const f = (1 - d / radius) * (1 - d / radius);
            x[i] += pvx * f * 0.35;
            y[i] += pvy * f * 0.35;
          }
        }
      }
      for (let it = 0; it < iterations; it++) {
        for (let i = 0; i < s.n - 1; i++) {
          const dx = x[i + 1] - x[i];
          const dy = y[i + 1] - y[i];
          const d = Math.hypot(dx, dy) || 1;
          const k = ((d - s.rest) / d) * 0.5;
          const ma = i === 0 ? 0 : 1;
          const mb = i + 1 === s.n - 1 ? 0 : 1;
          const tot = ma + mb || 1;
          x[i] += (dx * k * 2 * ma) / tot;
          y[i] += (dy * k * 2 * ma) / tot;
          x[i + 1] -= (dx * k * 2 * mb) / tot;
          y[i + 1] -= (dy * k * 2 * mb) / tot;
        }
      }
    }

    function animate(time: number) {
      now = time * 0.001;
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--lights-color").trim() || style.color;
      const k = style.getPropertyValue("--lights-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineCap = "round";
      pvx *= 0.9;
      pvy *= 0.9;
      pulses = pulses.filter((p) => now - p.t0 < 5);

      for (const s of list) {
        step(s, time);
        const a = alpha * mul * (0.4 + 0.6 * s.depth);
        ctx!.lineWidth = lineWidth * s.depth;
        ctx!.beginPath();
        ctx!.moveTo(s.x[0], s.y[0]);
        for (let i = 1; i < s.n; i++) ctx!.lineTo(s.x[i], s.y[i]);
        setAlpha(a * 0.8);
        ctx!.stroke();

        const r = size * s.depth;
        for (let b = 0; b < NB; b++) {
          const i = 6 * b + s.bulbOffset;
          const bx = s.x[i];
          const by = s.y[i] + r * 1.9;
          // Encendido: onda de los clics (gaussiana que viaja y se apaga) + un titileo ambiental muy leve
          let lit = 0.12 * (0.5 + 0.5 * Math.sin(time * 0.0012 + b * 1.7 + s.phase));
          for (const p of pulses) {
            const age = now - p.t0;
            const e = (Math.hypot(bx - p.x, by - p.y) - pulse * age) / 70;
            lit += Math.exp(-e * e) * Math.exp(-age * 0.8);
          }
          // El puntero enciende las bombillas cercanas con easing: se prenden al acercarse y se apagan despacio al irse
          const near =
            hasPointer ? Math.pow(Math.max(0, 1 - Math.hypot(bx - px, by - py) / glow), 1.5) : 0;
          s.glow[b] += (near - s.glow[b]) * (near > s.glow[b] ? 0.18 : 0.05);
          lit = Math.min(1, lit + s.glow[b]);
          ctx!.beginPath();
          ctx!.moveTo(s.x[i], s.y[i]);
          ctx!.lineTo(bx, by - r * 0.7);
          setAlpha(a);
          ctx!.stroke();
          const rr = r * (1 + 0.3 * lit);
          if (!multicolor) {
            ctx!.fillStyle = "#fff";
            ctx!.beginPath();
            ctx!.arc(bx, by, rr * 2.4, 0, Math.PI * 2);
            setAlpha(a * 0.06);
            ctx!.fill();
            ctx!.beginPath();
            ctx!.arc(bx, by, rr, 0, Math.PI * 2);
            setAlpha(a * 0.12);
            ctx!.fill();
          } else {
            const hue = (b * 40 + time * 0.12) % 360;
            const shimmer = 0.5 + 0.5 * Math.sin(time * 0.006 + b + s.phase);
            const bulbColor = `hsl(${hue}, 90%, ${35 + 30 * shimmer}%)`;
            ctx!.fillStyle = bulbColor;
            ctx!.beginPath();
            ctx!.arc(bx, by, rr * (2.4 + lit), 0, Math.PI * 2);
            setAlpha(a * (0.2 + 0.3 * shimmer + 0.5 * lit));
            ctx!.fill();
            ctx!.beginPath();
            ctx!.arc(bx, by, rr, 0, Math.PI * 2);
            setAlpha(a * (0.45 + 0.35 * shimmer + 0.2 * lit));
            ctx!.fill();
            ctx!.strokeStyle = bulbColor;
            setAlpha(a);
            ctx!.stroke();
            if (lit > 0.05) {
              ctx!.beginPath();
              ctx!.arc(bx, by, rr * (1.8 + 1.4 * lit), 0, Math.PI * 2);
              setAlpha(a * 0.6 * lit);
              ctx!.stroke();
            }
            ctx!.strokeStyle = ink;
          }
        }
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onMove(e.touches[0].clientX, e.touches[0].clientY);
    const onDownEvt = (e: PointerEvent) => onDown(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("pointerdown", onDownEvt);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("pointerdown", onDownEvt);
    };
  }, [
    strands,
    bulbs,
    multicolor,
    weight,
    tension,
    size,
    wind,
    damping,
    glow,
    pulse,
    radius,
    alpha,
    lineWidth,
    color,
  ]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--lights-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
