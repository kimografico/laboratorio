import { useEffect, useRef } from "react";

export interface PlanetsOrbitsBackgroundProps {
  /** Número de órbitas (cada una con su planeta) */
  orbits?: number;
  /** Semieje mayor de la órbita más cercana (px) */
  minRadius?: number;
  /** Separación media entre órbitas (px) */
  gap?: number;
  /** Excentricidad máxima (0 = círculo, 0.8 = muy alargada) */
  eccentricity?: number;
  /** Cuánto se retrasan las órbitas lejanas al seguir al puntero: más alto, más elástico */
  lag?: number;
  /** Rigidez base con la que cada órbita sigue al Sol (el puntero) */
  stiffness?: number;
  /** Velocidad del tiempo */
  speed?: number;
  /** Radio del planeta más grande (px) */
  planet?: number;
  lineWidth?: number;
  /** Opacidad de las elipses (0-1) */
  alpha?: number;
  /** Opcional: fija el color de las elipses. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  /** Color de los planetas y del Sol (tono de la paleta; la página puede sobrescribirlo) */
  planetColor?: string;
  className?: string;
}

type Orbit = {
  a: number;
  e: number;
  w: number;
  m0: number;
  period: number;
  r: number;
  stiff: number;
  fx: number;
  fy: number;
  vx: number;
  vy: number;
};

const TAU = Math.PI * 2;

export default function PlanetsOrbitsBackground({
  orbits = 8,
  minRadius = 75,
  gap = 80,
  eccentricity = 0.6,
  lag = 2,
  stiffness = 0.01,
  speed = 1,
  planet = 3.5,
  lineWidth = 1,
  alpha = 0.18,
  color,
  planetColor = "rgba(0, 0, 0, 0.7)",
  className,
}: PlanetsOrbitsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let sx = 0;
    let sy = 0;
    let tx = 0;
    let ty = 0;
    let pointer = false;
    let list: Orbit[] = [];
    let raf = 0;

    function build() {
      list = Array.from({ length: orbits }, (_, i) => {
        const a = minRadius + i * gap * (0.85 + Math.random() * 0.3);
        return {
          a,
          e: Math.random() * eccentricity,
          w: Math.random() * TAU,
          m0: Math.random() * TAU,
          period: 9000 * Math.pow(a / 100, 1.5),
          r: planet * (0.45 + 0.55 * Math.random()),
          stiff: stiffness / (1 + i * lag),
          fx: sx,
          fy: sy,
          vx: 0,
          vy: 0,
        };
      });
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      if (!pointer) {
        sx = tx = width / 2;
        sy = ty = height / 2;
      }
      build();
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      pointer = true;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function kepler(M: number, e: number) {
      let E = M;
      for (let i = 0; i < 5; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      return E;
    }

    function animate(time: number) {
      if (!pointer) {
        tx = width / 2 + Math.cos(time * 0.0002) * width * 0.1;
        ty = height / 2 + Math.sin(time * 0.00028) * height * 0.1;
      }
      sx += (tx - sx) * 0.15;
      sy += (ty - sy) * 0.15;

      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();

      for (const o of list) {
        o.vx = (o.vx + (sx - o.fx) * o.stiff) * 0.86;
        o.vy = (o.vy + (sy - o.fy) * o.stiff) * 0.86;
        o.fx += o.vx;
        o.fy += o.vy;

        const b = o.a * Math.sqrt(1 - o.e * o.e);
        const cw = Math.cos(o.w);
        const sw = Math.sin(o.w);
        const cx = o.fx - o.a * o.e * cw;
        const cy = o.fy - o.a * o.e * sw;
        ctx!.moveTo(cx + o.a * cw, cy + o.a * sw);
        ctx!.ellipse(cx, cy, o.a, b, o.w, 0, TAU);
      }

      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--planets-orbits-color").trim() || style.color;
      const k = style.getPropertyValue("--planets-orbits-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      setAlpha(alpha * mul);
      ctx!.lineWidth = lineWidth;
      ctx!.stroke();

      ctx!.beginPath();
      for (const o of list) {
        const E = kepler(o.m0 + (TAU * speed * time) / o.period, o.e);
        const b = o.a * Math.sqrt(1 - o.e * o.e);
        const rx = o.a * (Math.cos(E) - o.e);
        const ry = b * Math.sin(E);
        const cw = Math.cos(o.w);
        const sw = Math.sin(o.w);
        const x = o.fx + rx * cw - ry * sw;
        const y = o.fy + rx * sw + ry * cw;
        ctx!.moveTo(x + o.r, y);
        ctx!.arc(x, y, o.r, 0, TAU);
      }
      ctx!.moveTo(sx + planet * 0.8, sy);
      ctx!.arc(sx, sy, planet * 0.8, 0, TAU);
      ctx!.fillStyle = planetColor;
      setAlpha(mul);
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
  }, [orbits, minRadius, gap, eccentricity, lag, stiffness, speed, planet, lineWidth, alpha, planetColor]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--planets-orbits-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
