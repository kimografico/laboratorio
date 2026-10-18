import { useEffect, useRef } from "react";

export interface CobwebBackgroundProps {
  /** Esquina de la que cuelga la telaraña: llega hasta la esquina opuesta */
  corner?: "tl" | "tr" | "bl" | "br";
  /** Hilos que salen de la esquina */
  spokes?: number;
  /** Uniones entre hilos vecinos, por cada par */
  links?: number;
  /** Segundos que tarda la araña en construirla (0 = ya construida) */
  build?: number;
  /** Cuánto cuelgan las uniones por su peso (fracción de su longitud) */
  sag?: number;
  /** Probabilidad de que una unión lleve una gota de rocío (0-1) */
  dew?: number;
  /** Cuánto empuja el puntero a los hilos, según su velocidad */
  kick?: number;
  /** Cuánto se transmite la vibración a lo largo de un hilo (0-0.4): bajo, solo vibra lo más cercano al puntero */
  tension?: number;
  /** Persistencia de la vibración (0.85 se apaga enseguida – 0.97 vibra mucho rato) */
  damping?: number;
  /** Alcance del puntero (px) */
  radius?: number;
  /** Amplitud de la brisa ambiental (px) */
  breeze?: number;
  /** Opacidad de los hilos (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Link = { a: number; b: number; ta: number; tb: number; dew: boolean };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Perfil 0 en los extremos y 1 en medio: la brisa solo mueve lo que no está anclado
const bow = (t: number) => 4 * t * (1 - t);
// Separación entre nudos de un hilo (px): cada hilo es una cuerda con muchos nudos, no un péndulo rígido
const NODE = 40;

export default function CobwebBackground({
  corner = "tl",
  spokes = 11,
  links = 14,
  build = 30,
  sag = 0.05,
  dew = 0.3,
  kick = 0.1,
  tension = 0.15,
  damping = 0.9,
  radius = 90,
  breeze = 8,
  alpha = 0.3,
  lineWidth = 1,
  color,
  className,
}: CobwebBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const N = Math.max(3, spokes);
    let w = 0;
    let h = 0;
    let hx = 0;
    let hy = 0;
    let px = -9999;
    let py = -9999;
    let hasPointer = false;
    let birth = -1;
    let raf = 0;
    const ex = new Float32Array(N);
    const ey = new Float32Array(N);
    const nx = new Float32Array(N);
    const ny = new Float32Array(N);
    const phase = new Float32Array(N);
    const delay = new Float32Array(N);
    const segs = new Int32Array(N); // tramos de cada hilo (nudos = tramos + 1)
    const off = new Int32Array(N + 1); // posición del primer nudo de cada hilo en d/v/acc
    let d = new Float32Array(0); // desplazamiento lateral de cada nudo
    let v = new Float32Array(0);
    let acc = new Float32Array(0);
    let list: Link[] = [];

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      birth = -1;
      const m = 8;
      const sx = corner === "tl" || corner === "bl" ? 1 : -1;
      const sy = corner === "tl" || corner === "tr" ? 1 : -1;
      hx = sx > 0 ? -m : w + m;
      hy = sy > 0 ? -m : h + m;
      // Los hilos salen de la esquina en abanico y terminan siempre en el borde opuesto (derecho/inferior para "tl"),
      // un poco fuera de la pantalla: toda la tela está anclada, no queda ningún hilo en el aire
      for (let s = 0; s < N; s++) {
        const th = ((s + 0.3 * (Math.random() - 0.5) * (s > 0 && s < N - 1 ? 1 : 0)) / (N - 1)) * (Math.PI / 2);
        const ux = sx * Math.cos(th);
        const uy = sy * Math.sin(th);
        const tx = ux !== 0 ? (sx > 0 ? w + m - hx : -m - hx) / ux : Infinity;
        const ty = uy !== 0 ? (sy > 0 ? h + m - hy : -m - hy) / uy : Infinity;
        const t = Math.min(tx, ty);
        ex[s] = hx + ux * t;
        ey[s] = hy + uy * t;
        nx[s] = -uy;
        ny[s] = ux;
        phase[s] = Math.random() * Math.PI * 2;
        delay[s] = ((s * 0.618) % 1) * 0.12; // los hilos se tienden en orden salteado
        segs[s] = Math.max(4, Math.round(Math.hypot(ex[s] - hx, ey[s] - hy) / NODE));
        off[s + 1] = off[s] + segs[s] + 1;
      }
      d = new Float32Array(off[N]);
      v = new Float32Array(off[N]);
      acc = new Float32Array(off[N]);
      list = [];
      // Uniones irregulares entre hilos vecinos (y algunas saltando uno), con jitter de posición
      for (let s = 0; s < N - 1; s++) {
        for (let j = 0; j < links; j++) {
          const ta = 0.03 + (0.95 * (j + Math.random())) / links;
          list.push({ a: s, b: s + 1, ta, tb: clamp01(ta + (Math.random() - 0.5) * 0.05), dew: Math.random() < dew });
        }
        if (s < N - 2) {
          for (let j = 0; j < 3; j++) {
            const ta = 0.1 + 0.8 * Math.random();
            list.push({ a: s, b: s + 2, ta, tb: clamp01(ta + (Math.random() - 0.5) * 0.04), dew: false });
          }
        }
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const qx = clientX - rect.left;
      const qy = clientY - rect.top;
      if (hasPointer) {
        const vx = Math.max(-40, Math.min(40, qx - px));
        const vy = Math.max(-40, Math.min(40, qy - py));
        // El empujón solo llega a los nudos que están al alcance del puntero: la vibración nace ahí
        for (let s = 0; s < N; s++) {
          const m = segs[s];
          for (let j = 1; j < m; j++) {
            const t = j / m;
            const i = off[s] + j;
            const x = hx + (ex[s] - hx) * t + nx[s] * d[i];
            const y = hy + (ey[s] - hy) * t + ny[s] * d[i];
            const dist = Math.hypot(x - qx, y - qy);
            if (dist >= radius) continue;
            v[i] += (vx * nx[s] + vy * ny[s]) * kick * (1 - dist / radius) ** 2;
          }
        }
      }
      px = qx;
      py = qy;
      hasPointer = true;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--cobweb-color").trim() || style.color;
      const k0 = style.getPropertyValue("--cobweb-opacity").trim();
      const mul = k0 !== "" && Number.isFinite(Number(k0)) ? Number(k0) : 1;
      if (birth < 0) birth = time;
      // Progreso de la construcción: primero los hilos principales (40%), después las uniones de dentro hacia fuera
      const P = build <= 0 ? 1 : clamp01((time - birth) / (build * 1000));
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";

      // Cada hilo es una cuerda anclada en la esquina y en el borde: muelle hacia su reposo (movido por la brisa) +
      // difusión entre nudos vecinos. Con poca tensión y amortiguación alta la onda muere cerca de donde nace.
      // Aceleraciones y posiciones en dos pasadas (si no, el sistema se vuelve inestable)
      for (let s = 0; s < N; s++) {
        const m = segs[s];
        for (let j = 1; j < m; j++) {
          const i = off[s] + j;
          const target = breeze * Math.sin(time * 0.0005 + phase[s]) * bow(j / m);
          acc[i] = 0.02 * (target - d[i]) + tension * (d[i - 1] + d[i + 1] - 2 * d[i]);
        }
      }
      for (let s = 0; s < N; s++) {
        for (let j = 1; j < segs[s]; j++) {
          const i = off[s] + j;
          v[i] = (v[i] + acc[i]) * damping;
          d[i] += v[i];
        }
      }
      // Desplazamiento de un punto del hilo en t (interpolado entre nudos)
      const disp = (s: number, t: number) => {
        const f = t * segs[s];
        const j = Math.min(segs[s] - 1, Math.floor(f));
        return d[off[s] + j] + (d[off[s] + j + 1] - d[off[s] + j]) * (f - j);
      };
      const X = (s: number, t: number) => hx + (ex[s] - hx) * t + nx[s] * disp(s, t);
      const Y = (s: number, t: number) => hy + (ey[s] - hy) * t + ny[s] * disp(s, t);

      const a = alpha * mul;
      ctx!.beginPath();
      for (let s = 0; s < N; s++) {
        const g = clamp01((P - delay[s]) / 0.28);
        if (g <= 0) continue;
        ctx!.moveTo(hx, hy);
        // Se dibuja pasando por los nudos, así se ve la curvatura local de la vibración
        const m = segs[s];
        const full = Math.floor(g * m);
        for (let j = 1; j <= full; j++) ctx!.lineTo(X(s, j / m), Y(s, j / m));
        if (full < m && g * m > full) ctx!.lineTo(X(s, g), Y(s, g));
      }
      setAlpha(a);
      ctx!.stroke();

      // Uniones: aparecen por orden de distancia a la esquina, creciendo de un hilo al vecino; cuelgan por gravedad
      ctx!.beginPath();
      const drops: number[] = [];
      for (const l of list) {
        const q = clamp01((P - (0.3 + 0.7 * l.ta)) / 0.04);
        if (q <= 0) continue;
        const x0 = X(l.a, l.ta);
        const y0 = Y(l.a, l.ta);
        const x1 = x0 + (X(l.b, l.tb) - x0) * q;
        const y1 = y0 + (Y(l.b, l.tb) - y0) * q;
        const len = Math.hypot(x1 - x0, y1 - y0);
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2 + len * sag * 2;
        ctx!.moveTo(x0, y0);
        ctx!.quadraticCurveTo(cx, cy, x1, y1);
        if (l.dew && q >= 1) drops.push(0.25 * x0 + 0.5 * cx + 0.25 * x1, 0.25 * y0 + 0.5 * cy + 0.25 * y1);
      }
      setAlpha(a * 0.6);
      ctx!.stroke();
      ctx!.beginPath();
      for (let i = 0; i < drops.length; i += 2) {
        ctx!.moveTo(drops[i] + 1.6, drops[i + 1]);
        ctx!.arc(drops[i], drops[i + 1], 1.6, 0, Math.PI * 2);
      }
      setAlpha(a * 0.9);
      ctx!.fill();
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
  }, [corner, spokes, links, build, sag, dew, kick, tension, damping, radius, breeze, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--cobweb-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
