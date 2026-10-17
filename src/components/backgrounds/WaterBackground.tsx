import { useEffect, useRef } from "react";

export interface WaterBackgroundProps {
  /** Tamaño medio de las celdas (px) de la capa principal; la secundaria es un 28% más fina */
  scale?: number;
  /** Ancho medio de los canales de luz (px) de la capa principal */
  gap?: number;
  /** Rugosidad del borde de los canales (px de desplazamiento máximo): 0 = bordes lisos */
  roughness?: number;
  /** Tamaño de los "granos" de la rugosidad (px): más bajo = borde más áspero y fino */
  grain?: number;
  /** Radio de las esquinas de las celdas (px): constante, no depende del tamaño de la celda */
  round?: number;
  /** Altura de las olas (1 = normal, 0 = el patrón no ondula) */
  wave?: number;
  /** Velocidad de las olas (1 = normal, 0 = estático) */
  speed?: number;
  /** Cuánto se ensanchan y estrechan los canales al paso de cada ola (0-1): la luz se "concentra" */
  pulse?: number;
  /** Intensidad de la onda circular que deja el puntero al moverse (0 = desactivada) */
  ripple?: number;
  /** Alcance de la onda del puntero (px) */
  radius?: number;
  /** Opacidad de la capa principal (0-1) */
  alpha?: number;
  /** Opacidad de la segunda capa, como fracción de la principal (0-1) */
  secondary?: number;
  /** Opcional: fija el color de la luz. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Wave = { dx: number; dy: number; k: number; w: number; ph: number; A: number };

type Layer = {
  sc: number; // tamaño de celda en px
  gap: number; // ancho medio de canal en px
  amp: number; // multiplicador de la altura de las olas de esta capa
  cols: number;
  rows: number;
  hx: Float32Array; // aleatorios fijos por celda: posición, ancho de canal y órbita
  hy: Float32Array;
  hg: Float32Array;
  ox: Float32Array;
  oy: Float32Array;
  xs: Float32Array; // posición actual de cada semilla
  ys: Float32Array;
  waves: Wave[];
  fw: number; // campo de desplazamiento de las olas, muestreado en una rejilla gruesa
  fh: number;
  dxF: Float32Array;
  dyF: Float32Array;
};

const FIELD_STEP = 24; // las olas miden >200 px, así que una rejilla de 24 px y una interpolación bilineal bastan
const SEG = 9; // separación entre puntos a lo largo de los bordes rectos (para poder rugosearlos)

// Buffers compartidos: se reutilizan en cada celda para no crear arrays en cada fotograma
const bufA = new Float64Array(1024);
const bufB = new Float64Array(1024);
const nrm = new Float64Array(512); // normales de las aristas
const outBuf = new Float64Array(16384); // contorno final de una celda

// Ruido de valor 2D con teselado (64x64), un vector por nudo: da el desplazamiento rugoso del borde
const NZ = 64;
const NOISE = new Float32Array(NZ * NZ * 2).map(() => Math.random() * 2 - 1);
let jx = 0;
let jy = 0;
function addNoise(x: number, y: number, inv: number, wgt: number) {
  const fx = x * inv;
  const fy = y * inv;
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  let tx = fx - ix;
  let ty = fy - iy;
  tx = tx * tx * (3 - 2 * tx);
  ty = ty * ty * (3 - 2 * ty);
  const i0 = ix & (NZ - 1), i1 = (ix + 1) & (NZ - 1);
  const j0 = (iy & (NZ - 1)) * NZ, j1 = ((iy + 1) & (NZ - 1)) * NZ;
  const a = (j0 + i0) * 2, b = (j0 + i1) * 2, c = (j1 + i0) * 2, d = (j1 + i1) * 2;
  jx += wgt * ((NOISE[a] * (1 - tx) + NOISE[b] * tx) * (1 - ty) + (NOISE[c] * (1 - tx) + NOISE[d] * tx) * ty);
  jy += wgt * ((NOISE[a + 1] * (1 - tx) + NOISE[b + 1] * tx) * (1 - ty) + (NOISE[c + 1] * (1 - tx) + NOISE[d + 1] * tx) * ty);
}

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

// Contorno redondeado de un polígono convexo ya recortado hacia dentro una distancia r: es el mismo polígono
// "engordado" r px con esquinas circulares de radio r. A diferencia de cortar esquinas por proporción, el radio
// no depende de la longitud de las aristas, así que una arista que se acorta no deja nunca una esquina viva.
// También se insertan puntos a lo largo de los lados rectos. Devuelve el número de puntos escritos en outBuf.
function outline(src: Float64Array, m: number, r: number): number {
  // Quita vértices repetidos (en el propio buffer)
  let n = 0;
  for (let k = 0; k < m; k++) {
    const x = src[2 * k];
    const y = src[2 * k + 1];
    if (n > 0 && Math.abs(x - src[2 * n - 2]) < 1e-3 && Math.abs(y - src[2 * n - 1]) < 1e-3) continue;
    src[2 * n] = x;
    src[2 * n + 1] = y;
    n++;
  }
  if (n > 1 && Math.abs(src[0] - src[2 * n - 2]) < 1e-3 && Math.abs(src[1] - src[2 * n - 1]) < 1e-3) n--;
  if (n < 3) return 0;

  // Normales exteriores de cada arista (el polígono tiene orientación positiva)
  for (let k = 0; k < n; k++) {
    const k2 = (k + 1) % n;
    const ex = src[2 * k2] - src[2 * k];
    const ey = src[2 * k2 + 1] - src[2 * k + 1];
    const l = Math.hypot(ex, ey) || 1;
    nrm[2 * k] = ey / l;
    nrm[2 * k + 1] = -ex / l;
  }

  let o = 0;
  for (let k = 0; k < n; k++) {
    const kp = (k + n - 1) % n;
    const vx = src[2 * k];
    const vy = src[2 * k + 1];
    // Arco de radio r alrededor del vértice, entre la normal de la arista anterior y la de la siguiente
    const a0 = Math.atan2(nrm[2 * kp + 1], nrm[2 * kp]);
    const a1 = Math.atan2(nrm[2 * k + 1], nrm[2 * k]);
    let sweep = ((a1 - a0 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    if (sweep < 0) sweep = 0;
    const steps = Math.max(1, Math.ceil(sweep / 0.5));
    for (let s = 0; s <= steps; s++) {
      const a = a0 + (sweep * s) / steps;
      outBuf[2 * o] = vx + r * Math.cos(a);
      outBuf[2 * o + 1] = vy + r * Math.sin(a);
      o++;
    }
    // Lado recto hasta el siguiente vértice, con puntos intermedios
    const k2 = (k + 1) % n;
    const l = Math.hypot(src[2 * k2] - vx, src[2 * k2 + 1] - vy);
    const parts = Math.floor(l / SEG);
    for (let q = 1; q <= parts && o < 8000; q++) {
      const t = q / (parts + 1);
      outBuf[2 * o] = vx + (src[2 * k2] - vx) * t + r * nrm[2 * k];
      outBuf[2 * o + 1] = vy + (src[2 * k2 + 1] - vy) * t + r * nrm[2 * k + 1];
      o++;
    }
  }
  return o;
}

// Tres olas planas de distinta dirección, longitud y velocidad (ángulo en grados, longitud en px, rad/ms, altura en px)
const WAVE_SET: [number, number, number, number][] = [
  [20, 520, 0.0009, 14],
  [110, 330, 0.0012, 9],
  [200, 210, 0.0016, 5],
];

function makeWaves(rotate: number): Wave[] {
  return WAVE_SET.map(([deg, len, w, A]) => {
    const a = ((deg + rotate) * Math.PI) / 180;
    return { dx: Math.cos(a), dy: Math.sin(a), k: (2 * Math.PI) / len, w, ph: Math.random() * Math.PI * 2, A };
  });
}

export default function WaterBackground({
  scale = 110,
  gap = 6.5,
  roughness = 3.5,
  grain = 6,
  round = 14,
  wave = 1,
  speed = 1,
  pulse = 0.6,
  ripple = 1,
  radius = 220,
  alpha = 0.8,
  secondary = 0.4,
  color,
  className,
}: WaterBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color, los tonos y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let mul = 1;
    let w = 0;
    let h = 0;
    let layers: Layer[] = [];
    let hasPointer = false;
    let tx = 0;
    let ty = 0;
    let bx = 0; // origen de la onda del puntero, suavizado
    let by = 0;
    let rip = 0; // energía de la onda del puntero: sube al moverlo y se apaga sola
    let raf = 0;
    let frame = 0;

    function makeLayer(sc: number, gp: number, amp: number, rotate: number): Layer {
      const cols = Math.ceil(w / sc) + 4; // la malla de semillas empieza 2 celdas fuera del contenedor
      const rows = Math.ceil(h / sc) + 4;
      const n = cols * rows;
      // El campo cubre el contenedor más un margen: los vértices de las celdas de borde caen fuera de él
      const fw = Math.ceil((w + 2 * sc * 2.4) / FIELD_STEP) + 2;
      const fh = Math.ceil((h + 2 * sc * 2.4) / FIELD_STEP) + 2;
      const L: Layer = {
        sc, gap: gp, amp, cols, rows, fw, fh,
        dxF: new Float32Array(fw * fh), dyF: new Float32Array(fw * fh),
        hx: new Float32Array(n), hy: new Float32Array(n), hg: new Float32Array(n),
        ox: new Float32Array(n), oy: new Float32Array(n),
        xs: new Float32Array(n), ys: new Float32Array(n),
        waves: makeWaves(rotate),
      };
      for (let i = 0; i < n; i++) {
        L.hx[i] = Math.random();
        L.hy[i] = Math.random();
        L.hg[i] = Math.random();
        L.ox[i] = Math.random();
        L.oy[i] = Math.random();
      }
      return L;
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      // Dos capas con distinto tamaño y olas en otras direcciones: así no se mueven al unísono
      layers = [makeLayer(scale * 0.72, gap * 0.77, 1.3, 34), makeLayer(scale, gap, 1, 0)];
      bx = w / 2;
      by = h / 2;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (hasPointer) rip = Math.min(1, rip + Math.hypot(x - tx, y - ty) * 0.004);
      else {
        bx = x;
        by = y;
      }
      tx = x;
      ty = y;
      hasPointer = true;
    }

    // Dibuja una capa: se rellena todo y se vacían las celdas (relleno par-impar), así queda solo la red de canales
    function drawLayer(L: Layer, time: number, fill: string, a: number) {
      const t = time * speed;
      const { sc, cols, rows, xs, ys } = L;
      const ripOn = ripple > 0 && rip > 0.01;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const n = j * cols + i;
          // Semillas en un sitio aleatorio de su celda (más irregular), con una pequeña órbita
          xs[n] = (i - 2 + 0.08 + 0.84 * L.hx[n] + 0.14 * Math.sin(t * 0.0004 * (0.6 + L.ox[n]) + 6.283 * L.oy[n])) * sc;
          ys[n] = (j - 2 + 0.08 + 0.84 * L.hy[n] + 0.14 * Math.sin(t * 0.0004 * (0.6 + L.oy[n]) + 6.283 * L.ox[n])) * sc;
        }
      }

      // Campo de desplazamiento: tres olas planas que avanzan + la onda circular del puntero. Se calcula una vez
      // por punto de la rejilla gruesa (no por vértice) y después se interpola
      const M = sc * 2.4;
      const { fw, fh, dxF, dyF } = L;
      for (let jy = 0; jy < fh; jy++) {
        const gy = -M + jy * FIELD_STEP;
        for (let ix = 0; ix < fw; ix++) {
          const gx = -M + ix * FIELD_STEP;
          let ddx = 0;
          let ddy = 0;
          for (const wv of L.waves) {
            const th = wv.k * (wv.dx * gx + wv.dy * gy) - wv.w * t + wv.ph;
            const sn = Math.sin(th);
            const cs = Math.cos(th);
            const A = wv.A * wave * L.amp;
            ddx += A * (wv.dx * sn - wv.dy * 0.6 * cs);
            ddy += A * (wv.dy * sn + wv.dx * 0.6 * cs);
          }
          // Onda circular que deja el puntero: sale de su posición y se desvanece con la distancia
          if (ripOn) {
            const rx = gx - bx;
            const ry = gy - by;
            const d = Math.hypot(rx, ry) || 1;
            const rs = Math.exp(-d / radius) * rip * ripple * 10 * L.amp * Math.sin(0.035 * d - t * 0.004);
            ddx += (rx / d) * rs;
            ddy += (ry / d) * rs;
          }
          dxF[jy * fw + ix] = ddx;
          dyF[jy * fw + ix] = ddy;
        }
      }

      const w0 = L.waves[0];
      const half = sc * 2.2;
      const margin = sc * 1.6;
      const inv1 = 1 / (grain * 5); // tres octavas de rugosidad: ondulada, áspera y fina
      const inv2 = 1 / (grain * 1.8);
      const inv3 = 1 / grain;
      const rough = roughness * Math.sqrt(L.amp); // la capa de atrás es algo más tosca
      ctx!.beginPath();
      ctx!.rect(-50, -50, w + 100, h + 100);
      for (let j = 1; j < rows - 1; j++) {
        for (let i = 1; i < cols - 1; i++) {
          const n = j * cols + i;
          const x = xs[n];
          const y = ys[n];
          if (x < -margin || x > w + margin || y < -margin || y > h + margin) continue;

          // Distancia a la vecina más cercana: acota el ancho de canal y el radio de las esquinas para que
          // una celda nunca se colapse de golpe (eso se vería como un salto)
          let minLen = Infinity;
          for (let dj = -1; dj <= 1; dj++) {
            const jj = j + dj;
            for (let di = -1; di <= 1; di++) {
              if (di === 0 && dj === 0) continue;
              const q = jj * cols + (i + di);
              minLen = Math.min(minLen, Math.hypot(xs[q] - x, ys[q] - y));
            }
          }
          // Ancho de canal propio de cada celda, que se ensancha y estrecha al paso de la ola principal
          const ph = w0.k * (w0.dx * x + w0.dy * y) - w0.w * t + w0.ph;
          const g0 = L.gap * (0.4 + 1.4 * Math.pow(L.hg[n], 1.5)) * (1 + pulse * Math.sin(ph));
          const g = Math.min(Math.max(0.3, g0), 0.55 * minLen);
          const r = Math.min(round, 0.35 * (minLen / 2 - g / 2));
          const off = g / 2 + r; // la celda se recorta r de más y luego se redondea con radio r

          // Recinto de Voronoi de la semilla: cuadrado recortado con la mediatriz de cada vecina desplazada off
          let src = bufA;
          let dst = bufB;
          let m = 4;
          src[0] = x - half; src[1] = y - half;
          src[2] = x + half; src[3] = y - half;
          src[4] = x + half; src[5] = y + half;
          src[6] = x - half; src[7] = y + half;
          // Primero las 8 vecinas inmediatas; del segundo anillo solo las cuya mediatriz llega a tocar el polígono
          let reach2 = Infinity;
          for (let ring = 1; ring <= 2 && m >= 3; ring++) {
            if (ring === 2) {
              reach2 = 0;
              for (let p = 0; p < m; p++) {
                const ex = src[2 * p] - x;
                const ey = src[2 * p + 1] - y;
                reach2 = Math.max(reach2, ex * ex + ey * ey);
              }
            }
            for (let dj = -ring; dj <= ring && m >= 3; dj++) {
              const jj = Math.min(rows - 1, Math.max(0, j + dj));
              for (let di = -ring; di <= ring && m >= 3; di++) {
                if (Math.max(Math.abs(di), Math.abs(dj)) !== ring) continue;
                const q = jj * cols + Math.min(cols - 1, Math.max(0, i + di));
                const nx = xs[q] - x;
                const ny = ys[q] - y;
                const len = Math.hypot(nx, ny);
                if (len === 0) continue;
                const near = len / 2 - off;
                if (ring === 2 && near * near > reach2) continue; // su mediatriz queda fuera del polígono
                const c = nx * ((x + xs[q]) / 2) + ny * ((y + ys[q]) / 2) - off * len;
                m = clip(src, m, dst, nx, ny, c);
                const tmp = src; src = dst; dst = tmp;
              }
            }
          }
          if (m < 3) continue;
          const cnt = outline(src, m, r);
          if (cnt < 3) continue;

          for (let p = 0; p < cnt; p++) {
            let px = outBuf[2 * p];
            let py = outBuf[2 * p + 1];
            // Borde rugoso: desplazamiento de ruido, función de la posición (así las celdas vecinas lo comparten)
            if (rough > 0) {
              jx = 0;
              jy = 0;
              addNoise(px, py, inv1, 1);
              addNoise(px + 31.7, py + 11.3, inv2, 0.5);
              addNoise(px + 7.1, py + 53.9, inv3, 0.3);
              px += jx * rough;
              py += jy * rough;
            }
            // Olas: se interpola el campo de desplazamiento (la misma función de la posición para todas las
            // celdas, así los canales siguen unidos)
            const fx = Math.min(fw - 1.001, Math.max(0, (px + M) / FIELD_STEP));
            const fy = Math.min(fh - 1.001, Math.max(0, (py + M) / FIELD_STEP));
            const ix = Math.floor(fx);
            const iy = Math.floor(fy);
            const u = fx - ix;
            const v = fy - iy;
            const k00 = iy * fw + ix;
            const k01 = k00 + fw;
            px += (dxF[k00] * (1 - u) + dxF[k00 + 1] * u) * (1 - v) + (dxF[k01] * (1 - u) + dxF[k01 + 1] * u) * v;
            py += (dyF[k00] * (1 - u) + dyF[k00 + 1] * u) * (1 - v) + (dyF[k01] * (1 - u) + dyF[k01 + 1] * u) * v;
            if (p === 0) ctx!.moveTo(px, py);
            else ctx!.lineTo(px, py);
          }
          ctx!.closePath();
        }
      }
      ctx!.fillStyle = fill;
      ctx!.globalAlpha = Math.min(1, Math.max(0, a));
      ctx!.fill("evenodd");
    }

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      // Las olas son lentas: se calcula a 30 fps y los fotogramas impares conservan el dibujo anterior
      if (frame++ % 2 === 1) return;
      ctx!.clearRect(0, 0, w, h);
      // Tema: color, tonos y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--water-color").trim() || style.color;
      const k = style.getPropertyValue("--water-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      // Tonos opcionales: un color plano por capa, definidos por la página (por ejemplo, uno por tema)
      const tone1 = style.getPropertyValue("--water-tone-1").trim() || ink;
      const tone2 = style.getPropertyValue("--water-tone-2").trim() || ink;

      bx += (tx - bx) * 0.06;
      by += (ty - by) * 0.06;
      rip *= 0.985;

      drawLayer(layers[0], time, tone2, alpha * secondary * mul); // capa de atrás, más transparente
      drawLayer(layers[1], time, tone1, alpha * mul); // capa principal
      ctx!.globalAlpha = 1;
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
  }, [scale, gap, roughness, grain, round, wave, speed, pulse, ripple, radius, alpha, secondary]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--water-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
