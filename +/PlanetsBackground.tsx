import { useEffect, useRef } from "react";

export interface PlanetsBackgroundProps {
  /** Número de planetas (cada uno con su órbita) */
  orbits?: number;
  /** Semieje mayor de la órbita más cercana (px) */
  minRadius?: number;
  /** Separación media entre órbitas (px) */
  gap?: number;
  /** Excentricidad preferida máxima (0 = círculo, 0.7 = muy alargada) */
  eccentricity?: number;
  /** Masa del cursor: cuanto mayor, más rápido orbitan los planetas */
  gravity?: number;
  /** Fuerza con la que cada planeta vuelve a su órbita tras una perturbación (0 = nunca) */
  grip?: number;
  /** Velocidad del tiempo */
  speed?: number;
  /** Suavizado de la gravedad cerca del cursor (px): evita lanzamientos al pasar muy cerca */
  soft?: number;
  /** Suavizado con el que el cursor (la masa) sigue al puntero: más bajo, más inercia */
  sunEase?: number;
  /** Radio del planeta más grande (px) */
  planet?: number;
  lineWidth?: number;
  /** Color de las elipses */
  color?: string;
  /** Color de los planetas y del cursor */
  planetColor?: string;
  background?: string;
  className?: string;
}

type Planet = {
  a: number;
  e0: number;
  r: number;
  eps0: number;
  l0: number;
  leash: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const TAU = Math.PI * 2;
const SUB = 4;

export default function PlanetsBackground({
  orbits = 7,
  minRadius = 60,
  gap = 42,
  eccentricity = 0.35,
  gravity = 300,
  grip = 0.06,
  speed = 1,
  soft = 14,
  sunEase = 0.25,
  planet = 3.5,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.18)",
  planetColor = "rgba(0, 0, 0, 0.7)",
  background = "#e0dad5",
  className,
}: PlanetsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mu = gravity;
    const soft2 = soft * soft;

    let width = 0;
    let height = 0;
    let sx = 0;
    let sy = 0;
    let svx = 0;
    let svy = 0;
    let tx = 0;
    let ty = 0;
    let pointer = false;
    let last = -1;
    let list: Planet[] = [];
    let raf = 0;

    // Coloca el planeta en el periastro de su órbita preferida, con una orientación al azar
    function place(p: Planet) {
      const th = Math.random() * TAU;
      const rp = p.a * (1 - p.e0);
      const vp = Math.sqrt((mu * (1 + p.e0)) / rp);
      p.x = sx + Math.cos(th) * rp;
      p.y = sy + Math.sin(th) * rp;
      p.vx = svx - Math.sin(th) * vp;
      p.vy = svy + Math.cos(th) * vp;
    }

    function build() {
      list = Array.from({ length: orbits }, (_, i) => {
        const a = minRadius + i * gap * (0.85 + Math.random() * 0.3);
        const e0 = Math.random() * eccentricity;
        const p: Planet = {
          a,
          e0,
          r: planet * (0.45 + 0.55 * Math.random()),
          eps0: -mu / (2 * a),
          l0: Math.sqrt(mu * a * (1 - e0 * e0)),
          leash: 1.6 * a,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
        };
        place(p);
        return p;
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

    function animate(time: number) {
      const scale = last < 0 ? 1 : Math.min(time - last, 50) / 16.67;
      last = time;

      if (!pointer) {
        tx = width / 2;
        ty = height / 2;
      }
      const x0 = sx;
      const y0 = sy;
      const k = Math.min(1, sunEase * scale);
      sx += (tx - sx) * k;
      sy += (ty - sy) * k;
      svx = (sx - x0) / scale;
      svy = (sy - y0) / scale;

      const h = (speed * scale) / SUB;

      for (let step = 1; step <= SUB; step++) {
        const ux = x0 + ((sx - x0) * step) / SUB;
        const uy = y0 + ((sy - y0) * step) / SUB;

        for (const p of list) {
          const dx = ux - p.x;
          const dy = uy - p.y;
          const d2 = dx * dx + dy * dy;
          const s2 = d2 + soft2;
          const s = Math.sqrt(s2);
          const inv = mu / (s2 * s);
          let ax = dx * inv;
          let ay = dy * inv;

          // Velocidad y posición relativas al cursor
          const rvx = p.vx - svx;
          const rvy = p.vy - svy;
          const v2 = rvx * rvx + rvy * rvy;
          const sp = Math.sqrt(v2);
          const d = Math.sqrt(d2);

          if (grip > 0) {
            // Devuelve la energía de la órbita a la de su elipse preferida (acelera o frena a lo largo de la velocidad).
            // Más allá de 2a esa energía es inalcanzable: de ahí se encarga la correa
            if (sp > 0.02 && s < 2 * p.a) {
              const eps = v2 / 2 - mu / s;
              const f = Math.max(-0.15, Math.min(0.15, (grip * (p.eps0 - eps)) / sp));
              ax += (rvx / sp) * f;
              ay += (rvy / sp) * f;
            }
            // Devuelve el momento angular al de su elipse preferida (empuja de lado respecto al cursor)
            const rx = -dx;
            const ry = -dy;
            const L = rx * rvy - ry * rvx;
            const dd = Math.max(d, 20);
            const ft = Math.max(-0.15, Math.min(0.15, (grip * (p.l0 - L)) / dd));
            ax += (-ry / dd) * ft;
            ay += (rx / dd) * ft;
          }

          // Correa: si un planeta se aleja demasiado de su órbita, una fuerza elástica lo trae de vuelta
          if (d > p.leash) {
            const pull = 0.04 * (d - p.leash);
            ax += (dx / d) * pull;
            ay += (dy / d) * pull;
            // Amortiguación crítica (2·√0.04): el planeta vuelve sin pasarse de largo
            p.vx -= rvx * 0.4 * h;
            p.vy -= rvy * 0.4 * h;
          }

          p.vx += ax * h;
          p.vy += ay * h;
          p.x += p.vx * h;
          p.y += p.vy * h;
        }
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.beginPath();

      for (const p of list) {
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.vx) || !Number.isFinite(p.vy)) {
          place(p);
          continue;
        }
        // Elipse osculadora: la órbita kepleriana que seguiría el planeta ahora mismo alrededor del cursor
        const rx = p.x - sx;
        const ry = p.y - sy;
        const vx = p.vx - svx;
        const vy = p.vy - svy;
        const r = Math.hypot(rx, ry);
        const v2 = vx * vx + vy * vy;
        const inv = 2 / r - v2 / mu;
        if (r < 1e-3 || inv <= 1e-6) continue;
        const a = 1 / inv;
        const rv = rx * vx + ry * vy;
        const ex = ((v2 - mu / r) * rx - rv * vx) / mu;
        const ey = ((v2 - mu / r) * ry - rv * vy) / mu;
        const e = Math.hypot(ex, ey);
        if (e >= 0.97 || a > 4000) continue;
        const b = a * Math.sqrt(1 - e * e);
        const w = Math.atan2(ey, ex);
        const cx = sx - a * ex;
        const cy = sy - a * ey;
        ctx!.moveTo(cx + a * Math.cos(w), cy + a * Math.sin(w));
        ctx!.ellipse(cx, cy, a, b, w, 0, TAU);
      }

      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.stroke();

      ctx!.beginPath();
      for (const p of list) {
        ctx!.moveTo(p.x + p.r, p.y);
        ctx!.arc(p.x, p.y, p.r, 0, TAU);
      }
      ctx!.moveTo(sx + planet * 0.8, sy);
      ctx!.arc(sx, sy, planet * 0.8, 0, TAU);
      ctx!.fillStyle = planetColor;
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
  }, [orbits, minRadius, gap, eccentricity, gravity, grip, speed, soft, sunEase, planet, lineWidth, color, planetColor]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
