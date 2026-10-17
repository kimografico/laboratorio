import { useEffect, useRef } from "react";

export interface KoiBackgroundIIProps {
  /** Carpas cercanas: grandes, con contorno, manchas y aletas */
  near?: number;
  /** Carpas lejanas: pequeñas y muy tenues, solo una silueta */
  far?: number;
  /** Longitud de la carpa más cercana (px) */
  size?: number;
  /** Velocidad de nado (px por fotograma) */
  speed?: number;
  /** Distancia a la que notan el puntero y se acercan a verlo despacio (px) */
  curiosity?: number;
  /** Distancia a la que se quedan del puntero, dando vueltas a su alrededor (px) */
  keep?: number;
  /** Opacidad del contorno de las cercanas (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color de las carpas. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Pt = { x: number; y: number };
type Koi = {
  pts: Pt[];
  h: number; // rumbo
  L: number;
  seg: number;
  depth: number;
  far: boolean;
  speed: number;
  phase: number; // fase del movimiento de cola
  side: number; // sentido en el que da vueltas alrededor del puntero
  spots: { s: number; off: number; r: number }[];
};

const N = 18; // segmentos del cuerpo
const diff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export default function KoiBackgroundII({
  near = 4,
  far = 4,
  size = 190,
  speed = 0.7,
  curiosity = 460,
  keep = 120,
  alpha = 0.3,
  lineWidth = 1.2,
  color,
  className,
}: KoiBackgroundIIProps) {
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
    let fish: Koi[] = [];
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const kinds: boolean[] = [...Array(near).fill(false), ...Array(far).fill(true)];
      fish = kinds
        .map((isFar) => {
          const depth = isFar ? 0.3 + 0.15 * Math.random() : 0.65 + 0.35 * Math.random();
          const L = size * (0.35 + 0.65 * depth) * (0.85 + 0.3 * Math.random());
          const hd = Math.random() * Math.PI * 2;
          const x = Math.random() * w;
          const y = Math.random() * h;
          const seg = L / N;
          return {
            pts: Array.from({ length: N + 1 }, (_, i) => ({ x: x - Math.cos(hd) * seg * i, y: y - Math.sin(hd) * seg * i })),
            h: hd,
            L,
            seg,
            depth,
            far: isFar,
            speed: speed * (0.55 + 0.6 * depth),
            phase: Math.random() * Math.PI * 2,
            side: Math.random() < 0.5 ? -1 : 1,
            spots: Array.from({ length: 3 }, () => ({ s: 0.12 + 0.6 * Math.random(), off: (Math.random() - 0.5) * 0.9, r: 0.45 + 0.55 * Math.random() })),
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

    function update(f: Koi, time: number) {
      const head = f.pts[0];
      // Rumbo: vaivén tranquilo, curiosidad por el puntero (se acercan despacio y, al llegar, dan vueltas
      // a su alrededor sin tocarlo) y giro suave en los bordes
      let turn = Math.sin(time * 0.00041 + f.phase * 1.7) * 0.012 + Math.sin(time * 0.00093 + f.phase) * 0.006;
      if (hasPointer) {
        const dx = px - head.x;
        const dy = py - head.y;
        const d = Math.hypot(dx, dy);
        if (d < curiosity * (0.5 + 0.5 * f.depth)) {
          let ang = Math.atan2(dy, dx);
          if (d < keep) ang += f.side * (Math.PI / 2);
          turn += diff(f.h, ang) * 0.022;
        }
      }
      const m = 90;
      if (head.x < m || head.x > w - m || head.y < m || head.y > h - m) {
        turn += diff(f.h, Math.atan2(h / 2 - head.y, w / 2 - head.x)) * 0.03;
      }
      f.h += Math.max(-0.045, Math.min(0.045, turn));
      const v = f.speed * (0.85 + 0.15 * Math.sin(time * 0.001 + f.phase));
      head.x += Math.cos(f.h) * v;
      head.y += Math.sin(f.h) * v;
      f.phase += 0.09 + v * 0.07; // la cola bate más rápido al acelerar
      // El cuerpo es una cadena: cada segmento sigue al anterior a distancia fija
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

    function draw(f: Koi) {
      const a = alpha * mul * (0.12 + 0.88 * Math.pow(f.depth, 1.5));
      // Columna del cuerpo con la ondulación de nado (crece hacia la cola)
      const xs: number[] = [];
      const ys: number[] = [];
      const hw: number[] = [];
      const nx: number[] = [];
      const ny: number[] = [];
      const W = f.L * 0.095;
      for (let i = 0; i <= N; i++) {
        const p0 = f.pts[Math.max(0, i - 1)];
        const p1 = f.pts[Math.min(N, i + 1)];
        const dx = p0.x - p1.x; // dirección hacia delante (de la cola a la cabeza)
        const dy = p0.y - p1.y;
        const d = Math.hypot(dx, dy) || 1;
        const s = i / N;
        const wob = Math.sin(f.phase - i * 0.5) * Math.pow(s, 1.1) * f.seg * 1.1;
        nx.push(-dy / d);
        ny.push(dx / d);
        xs.push(f.pts[i].x - (dy / d) * wob);
        ys.push(f.pts[i].y + (dx / d) * wob);
        hw.push(W * Math.pow(Math.sin(Math.PI * (0.2 + 0.72 * s)), 0.7) * (1 - 0.4 * s));
      }
      ctx!.lineWidth = lineWidth * (0.5 + 0.5 * f.depth);

      // Aletas pectorales (solo las cercanas): hojas que baten de forma alterna
      if (!f.far) {
        const i = 3;
        const fl = f.L * 0.15;
        for (const side of [-1, 1]) {
          const bxp = xs[i] + nx[i] * hw[i] * side;
          const byp = ys[i] + ny[i] * hw[i] * side;
          const fx = (xs[i - 1] - xs[i + 1]) / (2 * f.seg); // dirección hacia delante
          const fy = (ys[i - 1] - ys[i + 1]) / (2 * f.seg);
          const flap = 0.65 + 0.35 * Math.sin(f.phase * 0.8 + side * 1.2);
          const tipx = bxp - fx * fl * 0.9 + nx[i] * side * fl * 0.9 * flap;
          const tipy = byp - fy * fl * 0.9 + ny[i] * side * fl * 0.9 * flap;
          ctx!.beginPath();
          ctx!.moveTo(bxp, byp);
          ctx!.quadraticCurveTo(bxp - fx * fl * 0.2 + nx[i] * side * fl * 0.8, byp - fy * fl * 0.2 + ny[i] * side * fl * 0.8, tipx, tipy);
          ctx!.quadraticCurveTo(bxp - fx * fl * 0.7, byp - fy * fl * 0.7, bxp - fx * fl * 0.1, byp - fy * fl * 0.1);
          ctx!.closePath();
          setAlpha(a * 0.3);
          ctx!.fill();
          setAlpha(a * 0.8);
          ctx!.stroke();
        }
      }

      // Cola: dos lóbulos que ondean detrás del cuerpo
      {
        const e = N;
        const fx = (xs[e - 1] - xs[e]) / f.seg; // hacia delante
        const fy = (ys[e - 1] - ys[e]) / f.seg;
        const lf = f.L * 0.3;
        const sway = Math.sin(f.phase - N * 0.5 + 0.9) * lf * 0.32;
        const bx0 = xs[e];
        const by0 = ys[e];
        const wid = lf * 0.42;
        ctx!.beginPath();
        ctx!.moveTo(bx0 + nx[e] * hw[e], by0 + ny[e] * hw[e]);
        ctx!.quadraticCurveTo(bx0 - fx * lf * 0.5 + nx[e] * wid * 0.9 + nx[e] * sway, by0 - fy * lf * 0.5 + ny[e] * wid * 0.9 + ny[e] * sway, bx0 - fx * lf + nx[e] * wid + nx[e] * sway * 1.6, by0 - fy * lf + ny[e] * wid + ny[e] * sway * 1.6);
        ctx!.quadraticCurveTo(bx0 - fx * lf * 0.72 + nx[e] * sway, by0 - fy * lf * 0.72 + ny[e] * sway, bx0 - fx * lf + -nx[e] * wid + nx[e] * sway * 1.6, by0 - fy * lf + -ny[e] * wid + ny[e] * sway * 1.6);
        ctx!.quadraticCurveTo(bx0 - fx * lf * 0.5 - nx[e] * wid * 0.9 + nx[e] * sway, by0 - fy * lf * 0.5 - ny[e] * wid * 0.9 + ny[e] * sway, bx0 - nx[e] * hw[e], by0 - ny[e] * hw[e]);
        setAlpha(a * 0.25);
        ctx!.fill(); // el relleno cierra la forma por la base...
        if (!f.far) {
          setAlpha(a * 0.7);
          ctx!.stroke(); // ...pero el trazo se queda abierto: así no se ve una línea cortando el cuerpo
        }
      }

      // Cuerpo: contorno afinado hacia la cola y cabeza redondeada (semicírculo entre ambos lados)
      ctx!.beginPath();
      ctx!.moveTo(xs[0] + nx[0] * hw[0], ys[0] + ny[0] * hw[0]);
      for (let i = 1; i <= N; i++) ctx!.lineTo(xs[i] + nx[i] * hw[i], ys[i] + ny[i] * hw[i]);
      for (let i = N; i >= 0; i--) ctx!.lineTo(xs[i] - nx[i] * hw[i], ys[i] - ny[i] * hw[i]);
      const headAng = Math.atan2(-nx[0], ny[0]); // dirección hacia delante: la normal izquierda girada -90°
      ctx!.arc(xs[0], ys[0], hw[0], headAng - Math.PI / 2, headAng + Math.PI / 2, false);
      ctx!.closePath();
      setAlpha(a * (f.far ? 0.5 : 0.28));
      ctx!.fill();
      if (!f.far) {
        setAlpha(a);
        ctx!.stroke();
        // Manchas del lomo: lo que hace que parezca una carpa koi
        for (const sp of f.spots) {
          const i = Math.round(sp.s * N);
          ctx!.beginPath();
          const ang = Math.atan2(ys[i - 1] - ys[Math.min(N, i + 1)], xs[i - 1] - xs[Math.min(N, i + 1)]);
          ctx!.ellipse(xs[i] + nx[i] * hw[i] * sp.off, ys[i] + ny[i] * hw[i] * sp.off, hw[i] * 1.5 * sp.r, hw[i] * 0.7 * sp.r, ang, 0, Math.PI * 2);
          setAlpha(a * 0.4);
          ctx!.fill();
        }
      }
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--koi-color").trim() || style.color;
      const k = style.getPropertyValue("--koi-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      for (const f of fish) {
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
  }, [near, far, size, speed, curiosity, keep, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--koi-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
