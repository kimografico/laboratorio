import { useEffect, useRef } from "react";

export interface WhaleBackgroundProps {
  /** Ballenas cercanas: grandes, con aletas, cola y detalles */
  near?: number;
  /** Ballenas lejanas: más pequeñas y muy tenues, solo una silueta */
  far?: number;
  /** Longitud de la ballena más cercana (px) */
  size?: number;
  /** Velocidad de nado (px por fotograma): son lentas */
  speed?: number;
  /** Distancia a la que notan el puntero: se sumergen (se desvanecen y encogen) y se apartan despacio (px) */
  dive?: number;
  /** Rapidez de la inmersión y la emersión al notar el puntero (mayor = más rápido) */
  sink?: number;
  /** Opacidad del contorno de las cercanas (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Pt = { x: number; y: number };
type Whale = {
  pts: Pt[];
  h: number;
  L: number;
  seg: number;
  depth: number;
  far: boolean;
  speed: number;
  phase: number;
  sub: number; // inmersión actual (0 = en superficie, 1 = sumergida), suavizada
};

const N = 24; // segmentos del cuerpo
const diff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export default function WhaleBackground({
  near = 2,
  far = 1,
  size = 300,
  speed = 1,
  dive = 250,
  sink = 0.012,
  alpha = 0.3,
  lineWidth = 1.3,
  color,
  className,
}: WhaleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let mul = 1;
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let hasPointer = false;
    let whales: Whale[] = [];
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const kinds: boolean[] = [...Array(near).fill(false), ...Array(far).fill(true)];
      whales = kinds
        .map((isFar) => {
          const depth = isFar ? 0.3 + 0.15 * Math.random() : 0.7 + 0.3 * Math.random();
          const L = size * (0.3 + 0.7 * depth) * (0.9 + 0.2 * Math.random());
          const hd = Math.random() * Math.PI * 2;
          const x = Math.random() * w;
          const y = Math.random() * h;
          const seg = L / N;
          return {
            pts: Array.from({ length: N + 1 }, (_, i) => ({ x: x - Math.cos(hd) * seg * i, y: y - Math.sin(hd) * seg * i })),
            h: hd, L, seg, depth, far: isFar,
            speed: speed * (0.5 + 0.7 * depth),
            phase: Math.random() * Math.PI * 2,
            sub: 0,
          };
        })
        .sort((a, b) => a.depth - b.depth); // las lejanas se dibujan primero
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      hasPointer = true;
    }

    function update(f: Whale, time: number) {
      const head = f.pts[0];
      // Rumbo: giros muy lentos. Si el puntero se acerca, la ballena se aparta con suavidad y se sumerge
      let turn = Math.sin(time * 0.00017 + f.phase * 1.3) * 0.0035 + Math.sin(time * 0.00043 + f.phase) * 0.002;
      let targetSub = 0;
      if (hasPointer) {
        const mid = f.pts[Math.floor(N / 2)];
        const d = Math.min(Math.hypot(head.x - px, head.y - py), Math.hypot(mid.x - px, mid.y - py));
        const R = dive * (0.6 + 0.4 * f.depth) + f.L * 0.25;
        if (d < R) {
          targetSub = Math.pow(1 - d / R, 0.8);
          turn += diff(f.h, Math.atan2(head.y - py, head.x - px)) * 0.012 * targetSub;
        }
      }
      f.sub += (targetSub - f.sub) * sink; // se hunde y emerge con easing
      const m = f.L * 0.35;
      if (head.x < m || head.x > w - m || head.y < m * 0.6 || head.y > h - m * 0.6) {
        turn += diff(f.h, Math.atan2(h / 2 - head.y, w / 2 - head.x)) * 0.008;
      }
      f.h += Math.max(-0.012, Math.min(0.012, turn));
      const v = f.speed * (0.9 + 0.1 * Math.sin(time * 0.0006 + f.phase));
      head.x += Math.cos(f.h) * v;
      head.y += Math.sin(f.h) * v;
      f.phase += 0.016 + v * 0.02;
      // Cuerpo: cadena de segmentos a distancia fija
      for (let i = 1; i <= N; i++) {
        const a = f.pts[i - 1];
        const p = f.pts[i];
        const ex = p.x - a.x;
        const ey = p.y - a.y;
        const len = Math.hypot(ex, ey) || 1;
        p.x = a.x + (ex / len) * f.seg;
        p.y = a.y + (ey / len) * f.seg;
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function draw(f: Whale) {
      // Al sumergirse, la ballena se desvanece y se encoge sobre su propio centro
      const a = alpha * mul * (0.12 + 0.88 * Math.pow(f.depth, 1.5)) * (1 - 0.8 * f.sub);
      const shrink = 1 - 0.42 * f.sub;
      const c = f.pts[Math.floor(N / 2)];
      ctx!.save();
      ctx!.translate(c.x, c.y);
      ctx!.scale(shrink, shrink);
      ctx!.translate(-c.x, -c.y);
      const xs: number[] = [];
      const ys: number[] = [];
      const hw: number[] = [];
      const nx: number[] = [];
      const ny: number[] = [];
      const W = f.L * 0.11;
      for (let i = 0; i <= N; i++) {
        const p0 = f.pts[Math.max(0, i - 1)];
        const p1 = f.pts[Math.min(N, i + 1)];
        const dx = p0.x - p1.x;
        const dy = p0.y - p1.y;
        const d = Math.hypot(dx, dy) || 1;
        const s = i / N;
        const wob = Math.sin(f.phase - i * 0.3) * Math.pow(s, 1.4) * f.seg * 0.9; // ondulación lenta
        nx.push(-dy / d);
        ny.push(dx / d);
        xs.push(f.pts[i].x - (dy / d) * wob);
        ys.push(f.pts[i].y + (dx / d) * wob);
        // Perfil: cabeza roma, el punto más ancho a un 30% y pedúnculo muy fino antes de la cola
        hw.push(s < 0.3 ? W * (0.62 + 0.38 * Math.sin((Math.PI / 2) * (s / 0.3))) : W * (1 - 0.88 * Math.pow((s - 0.3) / 0.7, 1.3)));
      }
      ctx!.lineWidth = lineWidth * (0.5 + 0.5 * f.depth);

      // Aletas pectorales: largas y echadas hacia atrás
      if (!f.far) {
        const i = 7;
        const fl = f.L * 0.2;
        const fx = (xs[i - 1] - xs[i + 1]) / (2 * f.seg);
        const fy = (ys[i - 1] - ys[i + 1]) / (2 * f.seg);
        for (const side of [-1, 1]) {
          const bx = xs[i] + nx[i] * hw[i] * side;
          const by = ys[i] + ny[i] * hw[i] * side;
          const flap = 0.85 + 0.15 * Math.sin(f.phase * 0.7 + side);
          const tx = bx - fx * fl * 0.75 + nx[i] * side * fl * 0.55 * flap;
          const ty = by - fy * fl * 0.75 + ny[i] * side * fl * 0.55 * flap;
          ctx!.beginPath();
          ctx!.moveTo(bx + fx * fl * 0.12, by + fy * fl * 0.12);
          ctx!.quadraticCurveTo(bx + nx[i] * side * fl * 0.5, by + ny[i] * side * fl * 0.5, tx, ty);
          ctx!.quadraticCurveTo(bx - fx * fl * 0.5 + nx[i] * side * fl * 0.1, by - fy * fl * 0.5 + ny[i] * side * fl * 0.1, bx - fx * fl * 0.2, by - fy * fl * 0.2);
          ctx!.closePath();
          setAlpha(a * 0.28);
          ctx!.fill();
          setAlpha(a * 0.8);
          ctx!.stroke();
        }
      }

      // Cola: dos lóbulos en forma de media luna que baten despacio
      {
        const e = N;
        const fx = (xs[e - 1] - xs[e]) / f.seg;
        const fy = (ys[e - 1] - ys[e]) / f.seg;
        const lf = f.L * 0.16;
        const wid = f.L * 0.17;
        const sway = Math.sin(f.phase - N * 0.3 + 0.8) * lf * 0.35;
        const bx0 = xs[e];
        const by0 = ys[e];
        ctx!.beginPath();
        ctx!.moveTo(bx0 + nx[e] * hw[e], by0 + ny[e] * hw[e]);
        ctx!.quadraticCurveTo(bx0 - fx * lf * 0.3 + nx[e] * wid * 0.7 + nx[e] * sway, by0 - fy * lf * 0.3 + ny[e] * wid * 0.7 + ny[e] * sway, bx0 - fx * lf * 0.9 + nx[e] * wid + nx[e] * sway * 1.5, by0 - fy * lf * 0.9 + ny[e] * wid + ny[e] * sway * 1.5);
        ctx!.quadraticCurveTo(bx0 - fx * lf * 0.15 + nx[e] * wid * 0.45 + nx[e] * sway, by0 - fy * lf * 0.15 + ny[e] * wid * 0.45 + ny[e] * sway, bx0 + fx * lf * 0.05 + nx[e] * sway, by0 + fy * lf * 0.05 + ny[e] * sway);
        ctx!.quadraticCurveTo(bx0 - fx * lf * 0.15 - nx[e] * wid * 0.45 + nx[e] * sway, by0 - fy * lf * 0.15 - ny[e] * wid * 0.45 + ny[e] * sway, bx0 - fx * lf * 0.9 - nx[e] * wid + nx[e] * sway * 1.5, by0 - fy * lf * 0.9 - ny[e] * wid + ny[e] * sway * 1.5);
        ctx!.quadraticCurveTo(bx0 - fx * lf * 0.3 - nx[e] * wid * 0.7 + nx[e] * sway, by0 - fy * lf * 0.3 - ny[e] * wid * 0.7 + ny[e] * sway, bx0 - nx[e] * hw[e], by0 - ny[e] * hw[e]);
        setAlpha(a * 0.25);
        ctx!.fill();
        if (!f.far) {
          setAlpha(a * 0.75);
          ctx!.stroke();
        }
      }

      // Cuerpo: contorno con cabeza redondeada
      ctx!.beginPath();
      ctx!.moveTo(xs[0] + nx[0] * hw[0], ys[0] + ny[0] * hw[0]);
      for (let i = 1; i <= N; i++) ctx!.lineTo(xs[i] + nx[i] * hw[i], ys[i] + ny[i] * hw[i]);
      for (let i = N; i >= 0; i--) ctx!.lineTo(xs[i] - nx[i] * hw[i], ys[i] - ny[i] * hw[i]);
      const headAng = Math.atan2(-nx[0], ny[0]); // dirección hacia delante (la normal izquierda girada -90°)
      ctx!.arc(xs[0], ys[0], hw[0], headAng - Math.PI / 2, headAng + Math.PI / 2, false);
      ctx!.closePath();
      setAlpha(a * (f.far ? 0.5 : 0.24));
      ctx!.fill();
      if (!f.far) {
        setAlpha(a);
        ctx!.stroke();
        // Línea dorsal y pequeños tubérculos en la cabeza
        ctx!.beginPath();
        ctx!.moveTo(xs[3], ys[3]);
        for (let i = 4; i <= Math.floor(N * 0.85); i++) ctx!.lineTo(xs[i], ys[i]);
        setAlpha(a * 0.35);
        ctx!.stroke();
        ctx!.beginPath();
        for (let k = 0; k < 4; k++) {
          const i = 1 + (k >> 1);
          const side = k % 2 === 0 ? -1 : 1;
          const x = xs[i] + nx[i] * hw[i] * 0.55 * side;
          const y = ys[i] + ny[i] * hw[i] * 0.55 * side;
          ctx!.moveTo(x + f.L * 0.006, y);
          ctx!.arc(x, y, f.L * 0.006, 0, Math.PI * 2);
        }
        setAlpha(a * 0.8);
        ctx!.fill();
      }
      ctx!.restore();
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--whale-color").trim() || style.color;
      const k = style.getPropertyValue("--whale-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      for (const f of whales) {
        update(f, time);
        draw(f);
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
  }, [near, far, size, speed, dive, sink, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--whale-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
