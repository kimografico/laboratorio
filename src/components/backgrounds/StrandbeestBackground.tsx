import { useEffect, useRef } from "react";

export interface StrandbeestBackgroundProps {
  /** Bestias (1-2): la segunda es más pequeña, más lenta y se coloca más arriba para no montarse con la grande */
  beasts?: number;
  /** Patas por bestia; van desfasadas en la manivela para que siempre haya pies en el suelo */
  legs?: number;
  /** Altura de la pata de la bestia más cercana, del pivote al suelo (px) */
  size?: number;
  /** Cuánto avanzan por unidad de viento (1 = normal) */
  speed?: number;
  /** Partículas de aire que muestran el viento (0 = ninguna) */
  particles?: number;
  /** Zona muerta alrededor del centro de la pantalla donde no hay viento (fracción del semiancho, 0-0.5) */
  calm?: number;
  /** Viento suave de vaivén cuando no hay puntero (0 = calma total, 1 = viento fuerte) */
  idleWind?: number;
  /** Opacidad de las barras (0-1); las partículas usan algo menos */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

// Los "números sagrados" de Theo Jansen (unidades del mecanismo): cada pata es un mecanismo plano de 11 barras
const N = { a: 38.0, b: 41.5, c: 39.3, d: 40.1, e: 55.8, f: 39.4, g: 36.7, h: 65.7, i: 49.0, j: 50.0, k: 61.9, l: 7.8, m: 15.0 };

type P = [number, number];
// Intersección de dos círculos (s elige una de las dos soluciones)
function inter(p0: P, r0: number, p1: P, r1: number, s: number): P | null {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const D = Math.hypot(dx, dy);
  if (D > r0 + r1 || D < Math.abs(r0 - r1) || D < 1e-9) return null;
  const A = (r0 * r0 - r1 * r1 + D * D) / (2 * D);
  const H = Math.sqrt(Math.max(0, r0 * r0 - A * A));
  return [p0[0] + (dx * A) / D - (s * dy * H) / D, p0[1] + (dy * A) / D + (s * dx * H) / D];
}

type Joints = { O: P; Q: P; R: P; P2: P; P3: P; P4: P; P5: P; P6: P };
// Cinemática de una pata con la manivela a ángulo t. Ramas y asignación de barras elegidas por búsqueda numérica
// para que el pie dibuje la "D" característica (parte inferior casi plana) sin saltos en toda la vuelta
function solve(t: number): Joints | null {
  const O: P = [0, 0];
  const Q: P = [N.a, N.l];
  const R: P = [Q[0] + N.m * Math.cos(t), Q[1] + N.m * Math.sin(t)];
  const P2 = inter(O, N.j, R, N.b, 1);
  if (!P2) return null;
  const P3 = inter(O, N.d, R, N.k, 1);
  if (!P3) return null;
  const P4 = inter(O, N.e, P2, N.c, 1);
  if (!P4) return null;
  const P5 = inter(P3, N.f, P4, N.g, -1);
  if (!P5) return null;
  const P6 = inter(P3, N.h, P5, N.i, 1);
  if (!P6) return null;
  return { O, Q, R, P2, P3, P4, P5, P6 };
}

// om: velocidad angular suavizada de la manivela (la bestia tiene inercia y tarda en arrancar o frenar)
type Beast = { x: number; om: number; theta: number; depth: number };
type Air = { x: number; y: number; z: number; ph: number };

export default function StrandbeestBackground({
  beasts = 2,
  legs = 6,
  size = 210,
  speed = 1,
  particles = 150,
  calm = 0.08,
  idleWind = 0.3,
  alpha = 0.34,
  lineWidth = 1,
  color,
  className,
}: StrandbeestBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const NL = Math.max(2, Math.round(legs));

    // Análisis previo de la trayectoria del pie: altura al suelo y velocidad horizontal del pie mientras pisa.
    // Con eso el cuerpo avanza a la velocidad exacta del pie en el suelo y no patina
    const M = 240;
    const path: P[] = [];
    let topUnits = 0; // lo que sobresale el mecanismo por encima del pivote (para colocar la bestia pequeña sin montarse)
    for (let i = 0; i < M; i++) {
      const j = solve((i / M) * Math.PI * 2);
      path.push(j?.P6 ?? [0, 0]);
      if (j) topUnits = Math.max(topUnits, -Math.min(j.P2[1], j.P3[1], j.P4[1], j.R[1], j.Q[1] - N.m));
    }
    const ys = path.map((p) => p[1]);
    const maxY = Math.max(...ys);
    const minY = Math.min(...ys);
    let stanceSum = 0;
    let stanceN = 0;
    for (let i = 0; i < M; i++) {
      if (path[i][1] > maxY - 0.12 * (maxY - minY)) {
        // Derivada central: Δx / (2·Δθ)
        stanceSum += (path[(i + 1) % M][0] - path[(i + M - 1) % M][0]) / (2 * ((2 * Math.PI) / M));
        stanceN++;
      }
    }
    const dxdt = stanceSum / Math.max(1, stanceN); // unidades por radián, con signo
    const crankSign = dxdt > 0 ? -1 : 1; // sentido de giro con el que el cuerpo avanza hacia la derecha

    let w = 0;
    let h = 0;
    // En pantallas bajas las bestias se encogen para que las dos quepan una sobre otra sin montarse
    let sizeEff = size;
    let last = 0;
    let px = -9999;
    let hasPointer = false;
    let windS = 0; // viento suavizado, de -1 (sopla a la izquierda) a 1 (sopla a la derecha)
    let list: Beast[] = [];
    let air: Air[] = [];
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      sizeEff = Math.min(size, h * 0.4);
      // La pequeña se apoya justo por encima de la copa de la grande; si no cabe, se encoge
      const sN = sizeEff / maxY;
      const nearTop = h - 24 - sizeEff - topUnits * sN;
      const farGround = nearTop - 16;
      const full = sizeEff * (1 + topUnits / maxY);
      const dFar = Math.max(0.25, Math.min(0.55, (farGround - 14) / full));
      list = Array.from({ length: Math.max(1, Math.min(2, Math.round(beasts))) }, (_, k) => ({
        x: w * (0.15 + 0.35 * k),
        om: 0,
        theta: Math.random() * Math.PI * 2,
        depth: k === 0 ? 1 : dFar,
      }));
      air = Array.from({ length: Math.max(0, Math.round(particles)) }, () => ({ x: Math.random() * w, y: Math.random() * h, z: 0.3 + 0.7 * Math.random(), ph: Math.random() * Math.PI * 2 }));
    }

    function onMove(clientX: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      hasPointer = true;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function drawBeast(b: Beast, dt: number, mul: number, wind: number, groundY: number) {
      const s = (sizeEff * b.depth) / maxY; // px por unidad del mecanismo
      const sx = sizeEff * b.depth * 0.5; // separación entre patas
      const bodyLen = (NL - 1) * sx + 100 * s;
      const oy = groundY - maxY * s;

      // El viento mueve la manivela (con inercia) y el cuerpo avanza lo mismo que retrocede el pie en el suelo
      const target = 2.2 * speed * b.depth * wind * crankSign;
      b.om += (target - b.om) * Math.min(1, dt * 1.2);
      b.theta += b.om * dt;
      b.x += -dxdt * s * b.om * dt;
      if (b.x > w + 30) b.x = -bodyLen - 30;
      if (b.x < -bodyLen - 30) b.x = w + 30;

      const a = alpha * mul * (0.35 + 0.65 * b.depth);
      ctx!.lineWidth = lineWidth * (0.6 + 0.4 * b.depth);
      // Suelo
      ctx!.beginPath();
      ctx!.moveTo(0, groundY + 3);
      ctx!.lineTo(w, groundY + 3);
      setAlpha(a * 0.25);
      ctx!.stroke();

      const pts: Joints[] = [];
      for (let i = 0; i < NL; i++) {
        const j = solve(b.theta + (i * Math.PI * 2) / NL);
        if (j) pts.push(j);
      }
      const map = (i: number, p: P): P => [b.x + i * sx + p[0] * s, oy + p[1] * s];

      // Barras de cada pata: el pivote fijo O, la manivela y los tres triángulos que llevan el pie
      ctx!.beginPath();
      pts.forEach((j, i) => {
        const O = map(i, j.O);
        const Q = map(i, j.Q);
        const R = map(i, j.R);
        const P2 = map(i, j.P2);
        const P3 = map(i, j.P3);
        const P4 = map(i, j.P4);
        const P5 = map(i, j.P5);
        const P6 = map(i, j.P6);
        const link = (u: P, v: P) => {
          ctx!.moveTo(u[0], u[1]);
          ctx!.lineTo(v[0], v[1]);
        };
        link(O, P2); link(R, P2); link(O, P3); link(R, P3); link(O, P4); link(P2, P4);
        link(P3, P5); link(P4, P5); link(P3, P6); link(P5, P6); link(Q, R);
      });
      setAlpha(a * 0.8);
      ctx!.stroke();

      // Bastidor (pivotes y ejes de manivela), articulaciones y pies
      ctx!.beginPath();
      const first = map(0, [0, 0]);
      const lastO = map(NL - 1, [0, 0]);
      ctx!.moveTo(first[0] - 14 * s, first[1]);
      ctx!.lineTo(lastO[0] + 14 * s, lastO[1]);
      const q0 = map(0, [N.a, N.l]);
      const q1 = map(NL - 1, [N.a, N.l]);
      ctx!.moveTo(q0[0], q0[1]);
      ctx!.lineTo(q1[0], q1[1]);
      setAlpha(a);
      ctx!.stroke();
      ctx!.beginPath();
      pts.forEach((j, i) => {
        for (const p of [j.O, j.P2, j.P3, j.P4, j.P5]) {
          const m = map(i, p);
          ctx!.moveTo(m[0] + 1.8 * s, m[1]);
          ctx!.arc(m[0], m[1], 1.8 * s, 0, Math.PI * 2);
        }
        const q = map(i, j.Q);
        ctx!.moveTo(q[0] + N.m * s, q[1]);
        ctx!.arc(q[0], q[1], N.m * s, 0, Math.PI * 2);
      });
      setAlpha(a * 0.45);
      ctx!.stroke();
      ctx!.beginPath();
      pts.forEach((j, i) => {
        const f = map(i, j.P6);
        const u = map(i, j.P3);
        const v = map(i, j.P5);
        ctx!.moveTo(u[0], u[1]);
        ctx!.lineTo(v[0], v[1]);
        ctx!.lineTo(f[0], f[1]);
        ctx!.closePath();
        ctx!.moveTo(f[0] + 2.6 * s, f[1]);
        ctx!.arc(f[0], f[1], 2.6 * s, 0, Math.PI * 2);
      });
      setAlpha(a * 0.14);
      ctx!.fill();
    }

    // Partículas de aire: se desplazan con el viento (más rápido y con estela más larga cuanto más sopla)
    function drawAir(time: number, dt: number, mul: number) {
      const sp = Math.abs(windS);
      const bands: [number, number][] = [[0, 0.5], [0.5, 0.75], [0.75, 1.01]];
      for (const [lo, hi] of bands) {
        ctx!.beginPath();
        for (const p of air) {
          if (p.z < lo || p.z >= hi) continue;
          // Deriva ambiental pequeña + empuje del viento; con viento aparece algo de turbulencia vertical
          const vx = windS * 520 * p.z * speed + Math.sin(time * 0.0004 + p.ph) * 8 * p.z;
          const vy = Math.sin(time * 0.0007 + p.ph * 2) * (10 + 40 * sp) * p.z;
          p.x += vx * dt;
          p.y += vy * dt;
          if (p.x > w + 20) p.x = -20;
          else if (p.x < -20) p.x = w + 20;
          if (p.y > h + 10) p.y = -10;
          else if (p.y < -10) p.y = h + 10;
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x - vx * 0.05, p.y - vy * 0.05);
        }
        ctx!.lineWidth = 0.6 + 1.4 * ((lo + hi) / 2);
        setAlpha(alpha * mul * 0.5 * (0.5 + 0.5 * sp) * (0.4 + 0.6 * ((lo + hi) / 2)));
        ctx!.stroke();
      }
    }

    function animate(time: number) {
      const dt = last === 0 ? 0.016 : Math.min(0.05, (time - last) / 1000);
      last = time;
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--strandbeest-color").trim() || style.color;
      const k = style.getPropertyValue("--strandbeest-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";

      // Viento según la posición horizontal del puntero: centro = calma, derecha sopla a la derecha, izquierda a la izquierda
      let target: number;
      if (hasPointer) {
        const d = (px - w / 2) / (w / 2);
        const m = Math.max(0, (Math.abs(d) - calm) / (1 - calm));
        target = Math.sign(d) * Math.pow(Math.min(1, m), 1.2);
      } else {
        target = idleWind * Math.sin(time * 0.00015) * Math.cos(time * 0.00007 + 1);
      }
      windS += (target - windS) * Math.min(1, dt * 2);

      drawAir(time, dt, mul);
      // La bestia lejana (pequeña, más arriba) se dibuja primero
      const yNear = h - 24;
      const sN = sizeEff / maxY;
      const farGround = yNear - sizeEff - topUnits * sN - 16;
      for (const b of [...list].sort((p, q) => p.depth - q.depth)) drawBeast(b, dt, mul, windS, b.depth === 1 ? yNear : farGround);
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onMove(e.clientX);
    const onTouch = (e: TouchEvent) => onMove(e.touches[0].clientX);
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
  }, [beasts, legs, size, speed, particles, calm, idleWind, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--strandbeest-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
