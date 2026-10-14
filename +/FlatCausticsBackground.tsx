import { useEffect, useRef } from "react";

export interface FlatCausticsBackgroundProps {
  /** Tamaño medio de las celdas (px) */
  scale?: number;
  /** Velocidad del movimiento (1 = normal, 0 = estático) */
  speed?: number;
  /** Separación entre celdas (px): el canal por el que se ve el fondo */
  gap?: number;
  /** Redondeo de las esquinas (0 = polígonos angulosos, 1-3 = cada vez más orgánicas) */
  smooth?: number;
  /** Cuánto aparta el puntero las celdas a su alrededor (px) */
  push?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Opacidad del tono más intenso (0-1). Los otros dos usan el 35% y el 65% de este valor */
  alpha?: number;
  /** Opcional: fija el color de las celdas. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

// Tres tonos planos: la intensidad (opacidad) de cada celda es fija y no hay degradados ni brillos
const TIERS = [0.35, 0.65, 1];

const hash = (i: number, j: number, s: number) => {
  const x = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453;
  return x - Math.floor(x);
};

// Buffers compartidos para recortar polígonos sin crear arrays en cada fotograma
const bufA = new Float64Array(1024);
const bufB = new Float64Array(1024);

// Recorta un polígono convexo con el semiplano  nx·x + ny·y <= c  (Sutherland–Hodgman)
function clip(src: Float64Array, n: number, dst: Float64Array, nx: number, ny: number, c: number) {
  let m = 0;
  for (let k = 0; k < n; k++) {
    const k2 = (k + 1) % n;
    const ax = src[2 * k], ay = src[2 * k + 1];
    const bx = src[2 * k2], by = src[2 * k2 + 1];
    const da = nx * ax + ny * ay - c;
    const db = nx * bx + ny * by - c;
    if (da <= 0) {
      dst[2 * m] = ax;
      dst[2 * m + 1] = ay;
      m++;
    }
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db);
      dst[2 * m] = ax + (bx - ax) * t;
      dst[2 * m + 1] = ay + (by - ay) * t;
      m++;
    }
  }
  return m;
}

// Una pasada de corte de esquinas (Chaikin): cada vértice se sustituye por dos puntos a 1/4 de cada arista
function chaikin(src: Float64Array, n: number, dst: Float64Array) {
  for (let k = 0; k < n; k++) {
    const k2 = (k + 1) % n;
    const ax = src[2 * k], ay = src[2 * k + 1];
    const bx = src[2 * k2], by = src[2 * k2 + 1];
    dst[4 * k] = ax * 0.75 + bx * 0.25;
    dst[4 * k + 1] = ay * 0.75 + by * 0.25;
    dst[4 * k + 2] = ax * 0.25 + bx * 0.75;
    dst[4 * k + 3] = ay * 0.25 + by * 0.75;
  }
  return n * 2;
}

export default function FlatCausticsBackground({
  scale = 100,
  speed = 1,
  gap = 9,
  smooth = 3,
  push = 45,
  radius = 200,
  alpha = 0.2,
  color,
  className,
}: FlatCausticsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color, los tonos y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    const I0 = -2; // la malla de semillas empieza 2 celdas fuera del contenedor
    const passes = Math.min(4, Math.max(0, Math.round(smooth))); // los buffers admiten hasta 4 pasadas de suavizado
    let mul = 1;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let ax = new Float32Array(0); // aleatorios fijos por semilla (órbita)
    let ay = new Float32Array(0);
    let xs = new Float32Array(0); // posición actual de cada semilla
    let ys = new Float32Array(0);
    let tone = new Uint8Array(0); // tono fijo de cada celda (0, 1 o 2)
    let shown = new Float32Array(0); // intensidad extra por cercanía del puntero, suavizada
    let hasPointer = false;
    let tx = 0;
    let ty = 0;
    let bx = 0; // posición suavizada del puntero
    let by = 0;
    let amp = 0;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / scale) + 4;
      rows = Math.ceil(h / scale) + 4;
      const n = cols * rows;
      ax = new Float32Array(n);
      ay = new Float32Array(n);
      xs = new Float32Array(n);
      ys = new Float32Array(n);
      shown = new Float32Array(n);
      tone = new Uint8Array(n);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          ax[k] = hash(i, j, 1);
          ay[k] = hash(i, j, 12);
          tone[k] = Math.min(2, Math.floor(hash(i, j, 3) * 3));
        }
      }
      bx = w / 2;
      by = h / 2;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (!hasPointer) {
        bx = tx;
        by = ty;
      }
      hasPointer = true;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color, tonos y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--flat-caustics-color").trim() || style.color;
      const k = style.getPropertyValue("--flat-caustics-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      // Paleta opcional: tres colores sólidos definidos por la página (por ejemplo, uno por tema)
      const palette = [1, 2, 3].map((n) => style.getPropertyValue(`--flat-caustics-tone-${n}`).trim());
      const hasPalette = palette.every(Boolean);

      bx += (tx - bx) * 0.08;
      by += (ty - by) * 0.08;
      amp += ((hasPointer ? 1 : 0) - amp) * 0.03;
      const R2 = radius * radius;
      const t = time * 0.0004 * speed * 4;

      // Semillas: orbitan despacio alrededor de su sitio y el puntero las aparta
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const n = j * cols + i;
          let x = (i + I0 + 0.5 + 0.38 * Math.sin(t * (0.6 + ax[n]) + 6.283 * ay[n])) * scale;
          let y = (j + I0 + 0.5 + 0.38 * Math.sin(t * (0.6 + ay[n]) + 6.283 * ax[n])) * scale;
          const dx = x - bx;
          const dy = y - by;
          const d = Math.hypot(dx, dy) || 1;
          const f = amp * Math.exp(-(d * d) / R2);
          x += (dx / d) * f * push;
          y += (dy / d) * f * push;
          xs[n] = x;
          ys[n] = y;
          shown[n] += (f - shown[n]) * 0.1;
        }
      }

      // Cada celda es el recinto de Voronoi de su semilla: se parte de un cuadrado y se recorta con la
      // mediatriz de cada vecina, desplazada gap/2 hacia dentro para dejar un canal uniforme
      const half = scale * 2.2;
      for (let j = 1; j < rows - 1; j++) {
        for (let i = 1; i < cols - 1; i++) {
          const n = j * cols + i;
          const x = xs[n];
          const y = ys[n];
          if (x < -scale || x > w + scale || y < -scale || y > h + scale) continue;

          let src = bufA;
          let dst = bufB;
          let m = 4;
          src[0] = x - half; src[1] = y - half;
          src[2] = x + half; src[3] = y - half;
          src[4] = x + half; src[5] = y + half;
          src[6] = x - half; src[7] = y + half;
          for (let dj = -2; dj <= 2 && m >= 3; dj++) {
            const jj = Math.min(rows - 1, Math.max(0, j + dj));
            for (let di = -2; di <= 2 && m >= 3; di++) {
              if (di === 0 && dj === 0) continue;
              const q = jj * cols + Math.min(cols - 1, Math.max(0, i + di));
              const nx = xs[q] - x;
              const ny = ys[q] - y;
              const len = Math.hypot(nx, ny);
              if (len === 0) continue;
              const c = nx * ((x + xs[q]) / 2) + ny * ((y + ys[q]) / 2) - (gap / 2) * len;
              m = clip(src, m, dst, nx, ny, c);
              const tmp = src; src = dst; dst = tmp;
            }
          }
          if (m < 3) continue;
          for (let s = 0; s < passes; s++) {
            m = chaikin(src, m, dst);
            const tmp = src; src = dst; dst = tmp;
          }

          ctx!.beginPath();
          ctx!.moveTo(src[0], src[1]);
          for (let p = 1; p < m; p++) ctx!.lineTo(src[2 * p], src[2 * p + 1]);
          ctx!.closePath();
          // Color plano: un tono de la paleta de la página o el color heredado con tres opacidades
          if (hasPalette) {
            ctx!.fillStyle = palette[tone[n]];
            setAlpha(mul * (1 + 0.6 * shown[n]));
          } else {
            ctx!.fillStyle = ink;
            setAlpha(alpha * mul * TIERS[tone[n]] * (1 + 0.9 * shown[n]));
          }
          ctx!.fill();
        }
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
  }, [scale, speed, gap, smooth, push, radius, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--flat-caustics-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
