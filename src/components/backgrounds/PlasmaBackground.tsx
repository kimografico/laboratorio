import { useEffect, useRef } from "react";

export interface PlasmaBackgroundProps {
  /** Número máximo de rayos que salen del puntero hacia el borde */
  lines?: number;
  /** Polos repartidos por el perímetro del contenedor que atraen los rayos */
  poles?: number;
  /** Puntos invisibles repartidos al azar por el fondo: se mueven despacio y desvían los rayos */
  points?: number;
  /** Intensidad con la que los puntos invisibles desvían los rayos (0 = no influyen) */
  strength?: number;
  /** Fracción de rayos que puede apagarse a la vez: con lines = 20 y dropout = 0.35 hay entre 13 y 20 rayos visibles */
  dropout?: number;
  /** Longitud de cada paso de integración (px): más corto, trazado más fino */
  step?: number;
  /** Pasos máximos por rayo: limita su longitud */
  length?: number;
  /** Amplitud del zigzag eléctrico (px) */
  jag?: number;
  /** Proporción de rayos que ramifican (0-1) */
  branch?: number;
  /** Velocidad del parpadeo y del zigzag */
  speed?: number;
  /** Velocidad de giro de los rayos alrededor del puntero */
  spin?: number;
  /** Suavizado con el que el polo del puntero lo sigue (1 = instantáneo) */
  ease?: number;
  lineWidth?: number;
  /** Opacidad de los rayos (0-1) */
  alpha?: number;
  /** Opcional: fija el color de los rayos. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Branch = { u: number; side: number; len: number; seed: number };
type Bolt = { jit: number; seed: number; fs: number; env: number; rolled: boolean; branches: Branch[] };
type Point = {
  fx: number;
  fy: number;
  ax: number;
  ay: number;
  w1: number;
  w2: number;
  p1: number;
  p2: number;
  s0: number;
  c: number;
  rw: number;
  rp: number;
  vw: number;
  vp: number;
  vs: number;
};

const TAU = Math.PI * 2;
const BSEGS = 7;
const GAIN = 1.6;

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function vnoise(a: number, t: number) {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  return hash(a * 31.7 + i) * (1 - u) + hash(a * 31.7 + i + 1) * u;
}

export default function PlasmaBackground({
  lines = 26,
  poles = 48,
  points = 8,
  strength = 1,
  dropout = 0.35,
  step = 8,
  length = 240,
  jag = 8,
  branch = 0.5,
  speed = 1,
  spin = 0.00006,
  ease = 0.25,
  lineWidth = 1,
  alpha = 0.5,
  color,
  className,
}: PlasmaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const OFF = -9999;
    const kx = new Float32Array(poles);
    const ky = new Float32Array(poles);
    const kq = new Float32Array(poles);
    const gx = new Float32Array(points);
    const gy = new Float32Array(points);
    const gs2 = new Float32Array(points);
    const gr = new Float32Array(points);
    const gv = new Float32Array(points);
    const raw = new Float32Array((length + 2) * 2);
    const jp = new Float32Array((length + 2) * 2);

    let width = 0;
    let height = 0;
    let px = OFF;
    let py = OFF;
    let tx = OFF;
    let ty = OFF;
    let ex = 0;
    let ey = 0;
    let bolts: Bolt[] = [];
    let spots: Point[] = [];
    let last = -1;
    let raf = 0;

    function build() {
      spots = Array.from({ length: points }, () => {
        const s0 = 60 + Math.random() * 50;
        return {
          fx: Math.random(),
          fy: Math.random(),
          ax: 0.05 + Math.random() * 0.1,
          ay: 0.05 + Math.random() * 0.1,
          w1: 0.05 + Math.random() * 0.12,
          w2: 0.05 + Math.random() * 0.12,
          p1: Math.random() * TAU,
          p2: Math.random() * TAU,
          s0,
          c: (0.4 + Math.random() * 0.8) * s0 * s0 * 8e-5,
          rw: 0.1 + Math.random() * 0.2,
          rp: Math.random() * TAU,
          vw: 0.15 + Math.random() * 0.3,
          vp: Math.random() * TAU,
          vs: Math.random() < 0.5 ? -1 : 1,
        };
      });
      bolts = Array.from({ length: lines }, () => ({
        jit: (Math.random() - 0.5) * 0.9,
        seed: Math.random() * 1000,
        fs: 5 + Math.random() * 6,
        env: Math.random() < 1 - dropout * 0.5 ? 1 : 0,
        rolled: false,
        branches: Array.from({ length: 2 }, () => ({
          u: 0.2 + Math.random() * 0.55,
          side: Math.random() < 0.5 ? -1 : 1,
          len: 0.06 + Math.random() * 0.16,
          seed: Math.random() * 1000,
        })).filter(() => Math.random() < branch),
      }));
    }

    function layoutPoles() {
      const P = 2 * (width + height);
      for (let i = 0; i < poles; i++) {
        const s = ((i + 0.5) * P) / poles;
        let x: number;
        let y: number;
        if (s < width) {
          x = s;
          y = 0;
        } else if (s < width + height) {
          x = width;
          y = s - width;
        } else if (s < 2 * width + height) {
          x = width - (s - width - height);
          y = height;
        } else {
          x = 0;
          y = height - (s - 2 * width - height);
        }
        kx[i] = x;
        ky[i] = y;
      }
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      layoutPoles();
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (px === OFF) {
        px = tx;
        py = ty;
      }
    }

    function field(x: number, y: number, cx: number, cy: number) {
      let dx = x - cx;
      let dy = y - cy;
      let d2 = dx * dx + dy * dy + 1;
      let inv = 1 / (d2 * Math.sqrt(d2));
      let fx = dx * inv;
      let fy = dy * inv;
      for (let k = 0; k < poles; k++) {
        dx = x - kx[k];
        dy = y - ky[k];
        d2 = dx * dx + dy * dy + 1;
        inv = kq[k] / (d2 * Math.sqrt(d2));
        fx -= dx * inv;
        fy -= dy * inv;
      }
      for (let p = 0; p < points; p++) {
        dx = x - gx[p];
        dy = y - gy[p];
        d2 = dx * dx + dy * dy + gs2[p];
        inv = 1 / (d2 * Math.sqrt(d2));
        fx += (dx * gr[p] - dy * gv[p]) * inv;
        fy += (dy * gr[p] + dx * gv[p]) * inv;
      }
      ex = fx;
      ey = fy;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      if (px === OFF) {
        tx = width / 2 + Math.cos(time * 0.0003) * width * 0.12;
        ty = height / 2 + Math.sin(time * 0.0004) * height * 0.12;
      }
      const sx = px === OFF ? tx : px;
      const sy = px === OFF ? ty : py;
      if (px !== OFF) {
        px += (tx - px) * ease;
        py += (ty - py) * ease;
      }

      const ts = time * 0.001 * speed;
      const dtMs = last < 0 ? 16.67 : Math.min(time - last, 100);
      last = time;
      const fadeK = 1 - Math.exp(-dtMs / 90);
      const reach = Math.min(width, height) * 0.5;
      const sc = Math.min(width, height) / 700;

      let sum = 0;
      for (let i = 0; i < poles; i++) {
        kq[i] = 0.35 + 1.3 * vnoise(i * 13.7 + 5, ts * 0.15);
        sum += kq[i];
      }
      for (let i = 0; i < poles; i++) kq[i] /= sum;

      for (let i = 0; i < points; i++) {
        const sp = spots[i];
        gx[i] = width * (sp.fx + sp.ax * Math.sin(ts * sp.w1 + sp.p1));
        gy[i] = height * (sp.fy + sp.ay * Math.sin(ts * sp.w2 + sp.p2));
        gs2[i] = sp.s0 * sc * sp.s0 * sc;
        gr[i] = strength * sp.c * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(ts * sp.rw + sp.rp)));
        gv[i] = strength * sp.c * 0.9 * sp.vs * Math.sin(ts * sp.vw + sp.vp);
      }

      const nAct = Math.min(1, Math.max(0, (vnoise(777, ts * 0.4) - 0.3) / 0.4));
      const activeFrac = 1 - dropout + dropout * nAct;

      ctx!.clearRect(0, 0, width, height);
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--plasma-color").trim() || style.color;
      const k = style.getPropertyValue("--plasma-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;

      for (let l = 0; l < bolts.length; l++) {
        const bolt = bolts[l];
        const on = (l * 0.61803 + ts * 0.05) % 1 < activeFrac;
        bolt.env += ((on ? 1 : 0) - bolt.env) * fadeK;
        if (on) bolt.rolled = false;
        if (!on && bolt.env < 0.02) {
          if (!bolt.rolled) {
            bolt.jit = (Math.random() - 0.5) * 0.9;
            bolt.seed = Math.random() * 1000;
            bolt.rolled = true;
          }
          continue;
        }
        const th = ((l + 0.5 + bolt.jit) * TAU) / lines + time * spin;

        let x = sx + Math.cos(th) * 4;
        let y = sy + Math.sin(th) * 4;
        raw[0] = sx;
        raw[1] = sy;
        raw[2] = x;
        raw[3] = y;
        let hit = false;
        let n = 2;
        for (let s = 0; s < length; s++) {
          field(x, y, sx, sy);
          let m = Math.hypot(ex, ey) || 1;
          field(x + (ex / m) * step * 0.5, y + (ey / m) * step * 0.5, sx, sy);
          m = Math.hypot(ex, ey) || 1;
          x += (ex / m) * step;
          y += (ey / m) * step;
          const dl = x;
          const dr = width - x;
          const dt = y;
          const db = height - y;
          const dm = Math.min(dl, dr, dt, db);
          const out = dm < step * 0.6;
          if (out) {
            if (dm === dl) x = 0;
            else if (dm === dr) x = width;
            else if (dm === dt) y = 0;
            else y = height;
            x = Math.min(width, Math.max(0, x));
            y = Math.min(height, Math.max(0, y));
          }
          raw[2 * n] = x;
          raw[2 * n + 1] = y;
          n++;
          if (out) {
            hit = true;
            break;
          }
        }

        const bright = (0.45 + 0.55 * vnoise(bolt.seed, ts * bolt.fs)) * bolt.env;
        ctx!.beginPath();
        ctx!.moveTo(raw[0], raw[1]);
        jp[0] = raw[0];
        jp[1] = raw[1];
        for (let k = 1; k < n; k++) {
          const u = k / (n - 1);
          const k0 = Math.max(0, k - 1);
          const k1 = Math.min(n - 1, k + 1);
          const tx2 = raw[2 * k1] - raw[2 * k0];
          const ty2 = raw[2 * k1 + 1] - raw[2 * k0 + 1];
          const tl = Math.hypot(tx2, ty2) || 1;
          const off = (vnoise(bolt.seed + k * 7.13, ts * 12) - 0.5) * 2 * GAIN * jag * Math.pow(Math.sin(Math.PI * u), 0.5);
          const jx = raw[2 * k] - (ty2 / tl) * off;
          const jy = raw[2 * k + 1] + (tx2 / tl) * off;
          jp[2 * k] = jx;
          jp[2 * k + 1] = jy;
          ctx!.lineTo(jx, jy);
        }

        for (const b of bolt.branches) {
          const j = Math.max(1, Math.min(n - 2, Math.floor(b.u * (n - 1))));
          const bx0 = jp[2 * j];
          const by0 = jp[2 * j + 1];
          const a = Math.atan2(raw[2 * (j + 1) + 1] - raw[2 * (j - 1) + 1], raw[2 * (j + 1)] - raw[2 * (j - 1)]) + b.side * (0.5 + 0.6 * hash(b.seed));
          const bl = b.len * reach * 2;
          const cx = Math.cos(a);
          const cy = Math.sin(a);
          ctx!.moveTo(bx0, by0);
          for (let k = 1; k <= BSEGS; k++) {
            const u = k / BSEGS;
            const off = (vnoise(b.seed + k * 3.7, ts * 12) - 0.5) * 2 * GAIN * jag * 0.9 * Math.min(1, u * 3);
            ctx!.lineTo(bx0 + cx * bl * u - cy * off, by0 + cy * bl * u + cx * off);
          }
        }

        setAlpha(bright * 0.1 * alpha * mul);
        ctx!.lineWidth = lineWidth * 6;
        ctx!.stroke();
        setAlpha(bright * 0.28 * alpha * mul);
        ctx!.lineWidth = lineWidth * 2.6;
        ctx!.stroke();
        setAlpha(bright * alpha * mul);
        ctx!.lineWidth = lineWidth;
        ctx!.stroke();

        if (hit) {
          setAlpha(bright * 0.8 * alpha * mul);
          ctx!.beginPath();
          ctx!.arc(raw[2 * (n - 1)], raw[2 * (n - 1) + 1], 1.5 + lineWidth, 0, TAU);
          ctx!.fill();
        }
      }

      // Núcleo luminoso en el puntero
      for (let i = 0; i < 5; i++) {
        setAlpha(0.07 * alpha * mul);
        ctx!.beginPath();
        ctx!.arc(sx, sy, 4 + i * 5, 0, TAU);
        ctx!.fill();
      }
      setAlpha(1 * alpha * mul);
      ctx!.beginPath();
      ctx!.arc(sx, sy, 2.5, 0, TAU);
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
    build();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [lines, poles, points, strength, dropout, step, length, jag, branch, speed, spin, ease, lineWidth, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--plasma-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
