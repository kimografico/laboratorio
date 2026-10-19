import { useEffect, useRef } from "react";

export interface CrackBackgroundProps {
  /** Segundos entre impactos ambientales sin clic (0 = solo salen al hacer clic) */
  interval?: number;
  /** Alcance de las grietas principales (px) */
  size?: number;
  /** Grietas radiales por impacto */
  rays?: number;
  /** Anillos concéntricos fragmentados (0-5), como en un cristal astillado */
  rings?: number;
  /** Probabilidad de ramificación (0-1) */
  branch?: number;
  /** Velocidad de propagación (1 = normal) */
  speed?: number;
  /** Segundos que tarda cada impacto en desvanecerse */
  life?: number;
  /** Opacidad de las grietas principales (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

// Cada polilínea guarda la distancia radial de sus puntos al impacto: así la grieta "crece" mostrando solo hasta g
type Poly = { xs: number[]; ys: number[]; ds: number[]; depth: number };
type Ring = { pts: number[]; r: number };
type Shard = { pts: number[]; r: number };
type Crack = { born: number; size: number; polys: Poly[]; rings: Ring[]; shards: Shard[] };

export default function CrackBackground({
  interval = 0,
  size = 260,
  rays = 9,
  rings = 3,
  branch = 0.3,
  speed = 1,
  life = 14,
  alpha = 0.3,
  lineWidth = 1,
  color,
  className,
}: CrackBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let now = 0;
    let nextAmbient = 0;
    let cracks: Crack[] = [];
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
    }

    // Camino aleatorio con deriva: las ramas nacen de él con ángulo abierto y longitud menor
    function walk(cx: number, cy: number, x0: number, y0: number, ang: number, len: number, depth: number, out: Poly[]) {
      const poly: Poly = { xs: [x0], ys: [y0], ds: [Math.hypot(x0 - cx, y0 - cy)], depth };
      out.push(poly);
      const pending: [number, number, number, number][] = [];
      let x = x0;
      let y = y0;
      let a = ang;
      let l = 0;
      while (l < len) {
        const step = 8 + Math.random() * 10;
        a += (Math.random() - 0.5) * (depth === 0 ? 0.26 : 0.5);
        x += Math.cos(a) * step;
        y += Math.sin(a) * step;
        l += step;
        poly.xs.push(x);
        poly.ys.push(y);
        poly.ds.push(Math.hypot(x - cx, y - cy));
        if (depth < 2 && Math.random() < (branch * step) / 40) {
          const side = Math.random() < 0.5 ? -1 : 1;
          pending.push([x, y, a + side * (0.45 + Math.random() * 0.7), (len - l) * (0.35 + 0.35 * Math.random())]);
        }
      }
      for (const [bx, by, ba, bl] of pending) if (bl > 14) walk(cx, cy, bx, by, ba, bl, depth + 1, out);
    }

    // Punto de una grieta radial a distancia r del impacto (para anclar los anillos a las radiales)
    function at(p: Poly, r: number): [number, number] | null {
      for (let i = 1; i < p.ds.length; i++) {
        if (p.ds[i] >= r) {
          const t = (r - p.ds[i - 1]) / (p.ds[i] - p.ds[i - 1] || 1);
          return [p.xs[i - 1] + (p.xs[i] - p.xs[i - 1]) * t, p.ys[i - 1] + (p.ys[i] - p.ys[i - 1]) * t];
        }
      }
      return null;
    }

    function spawn(x: number, y: number) {
      const n = Math.max(3, Math.round(rays));
      const sz = size * (0.8 + 0.4 * Math.random());
      const base = Math.random() * Math.PI * 2;
      const polys: Poly[] = [];
      for (let i = 0; i < n; i++) {
        const ang = base + ((i + (Math.random() - 0.5) * 0.5) * Math.PI * 2) / n;
        walk(x, y, x, y, ang, sz * (0.55 + 0.6 * Math.random()), 0, polys);
      }
      // Las radiales son las de profundidad 0, en el orden en que se crearon (alrededor del impacto)
      const mains = polys.filter((p) => p.depth === 0);
      const rg: Ring[] = [];
      for (let k = 0; k < Math.min(5, Math.round(rings)); k++) {
        const r = sz * (0.15 + 0.3 * k) * (0.9 + 0.2 * Math.random());
        if (r > sz * 0.9) break;
        for (let i = 0; i < n; i++) {
          if (Math.random() < 0.28) continue;
          const p1 = at(mains[i], r);
          const p2 = at(mains[(i + 1) % n], r);
          if (!p1 || !p2) continue;
          const jit = () => (Math.random() - 0.5) * r * 0.08;
          rg.push({
            r,
            pts: [p1[0], p1[1], p1[0] + (p2[0] - p1[0]) * 0.33 + jit(), p1[1] + (p2[1] - p1[1]) * 0.33 + jit(), p1[0] + (p2[0] - p1[0]) * 0.66 + jit(), p1[1] + (p2[1] - p1[1]) * 0.66 + jit(), p2[0], p2[1]],
          });
        }
      }
      // Un par de facetas con un tinte casi invisible: da la sensación de cristal sin luces
      const sh: Shard[] = [];
      for (let s = 0; s < 3; s++) {
        const i = Math.floor(Math.random() * n);
        const r = sz * (0.35 + 0.3 * Math.random());
        const p1 = at(mains[i], r);
        const p2 = at(mains[(i + 1) % n], r);
        if (p1 && p2) sh.push({ r, pts: [x, y, p1[0], p1[1], p2[0], p2[1]] });
      }
      cracks.push({ born: now, size: sz, polys, rings: rg, shards: sh });
      if (cracks.length > 8) cracks.shift();
    }

    // Un clic (o toque) abre un impacto justo bajo el puntero; los clics fuera del lienzo se ignoran
    function onDown(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      spawn(x, y);
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    // Dibuja una polilínea solo hasta el radio g, interpolando el último tramo para que crezca sin saltos
    function addPoly(p: Poly, g: number) {
      ctx!.moveTo(p.xs[0], p.ys[0]);
      for (let i = 1; i < p.xs.length; i++) {
        if (p.ds[i] <= g) ctx!.lineTo(p.xs[i], p.ys[i]);
        else {
          const t = (g - p.ds[i - 1]) / (p.ds[i] - p.ds[i - 1] || 1);
          if (t > 0) ctx!.lineTo(p.xs[i - 1] + (p.xs[i] - p.xs[i - 1]) * t, p.ys[i - 1] + (p.ys[i] - p.ys[i - 1]) * t);
          break;
        }
      }
    }

    function animate(time: number) {
      now = time * 0.001;
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--crack-color").trim() || style.color;
      const k = style.getPropertyValue("--crack-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      if (interval > 0 && now >= nextAmbient) {
        spawn(w * (0.1 + 0.8 * Math.random()), h * (0.1 + 0.8 * Math.random()));
        nextAmbient = now + interval * (0.7 + 0.6 * Math.random());
      }
      cracks = cracks.filter((c) => now - c.born < life);

      for (const c of cracks) {
        const age = now - c.born;
        // La grieta avanza rápido al principio y se frena, como un impacto real
        const g = c.size * 1.5 * (1 - Math.exp(-age * 3 * speed));
        const f = age < life * 0.6 ? 1 : Math.max(0, 1 - (age - life * 0.6) / (life * 0.4));
        const a = alpha * mul * f;

        ctx!.beginPath();
        for (const s of c.shards) {
          if (s.r > g) continue;
          ctx!.moveTo(s.pts[0], s.pts[1]);
          ctx!.lineTo(s.pts[2], s.pts[3]);
          ctx!.lineTo(s.pts[4], s.pts[5]);
          ctx!.closePath();
        }
        setAlpha(a * 0.16);
        ctx!.fill();

        const widths = [1.2, 0.8, 0.5];
        for (let d = 0; d < 3; d++) {
          ctx!.beginPath();
          for (const p of c.polys) if (p.depth === d) addPoly(p, g);
          ctx!.lineWidth = lineWidth * widths[d];
          setAlpha(a * (d === 0 ? 1 : 0.8));
          ctx!.stroke();
        }
        ctx!.lineWidth = lineWidth * 0.6;
        for (const r of c.rings) {
          const ramp = Math.min(1, Math.max(0, (g - r.r) / 50));
          if (ramp <= 0) continue;
          ctx!.beginPath();
          ctx!.moveTo(r.pts[0], r.pts[1]);
          for (let i = 2; i < r.pts.length; i += 2) ctx!.lineTo(r.pts[i], r.pts[i + 1]);
          setAlpha(a * 0.7 * ramp);
          ctx!.stroke();
        }
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // pointerdown cubre ratón, táctil y lápiz con un solo listener; en window para que funcione aunque haya contenido encima
    const onDownEvt = (e: PointerEvent) => onDown(e.clientX, e.clientY);
    window.addEventListener("pointerdown", onDownEvt);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointerdown", onDownEvt);
    };
  }, [interval, size, rays, rings, branch, speed, life, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--crack-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}