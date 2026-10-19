import { useEffect, useId, useRef } from "react";

export interface TrendilBackgroundProps {
  /** Número aproximado de terminaciones pegadas a las paredes */
  anchors?: number;
  /** Número aproximado de nodos internos adicionales */
  inner?: number;
  /** Probabilidad de descartar una conexión válida (0-1) */
  sparsity?: number;
  /** Longitud máxima de un zarcillo, como fracción de la diagonal (0-1) */
  span?: number;
  /** Fracción de zarcillos lejanos: más finos y tenues (0-1) */
  far?: number;
  /** Grosor en los extremos del zarcillo más largo (px) */
  thick?: number;
  /** Grosor en el centro, en reposo (px). Con el suavizado conviene que no sea demasiado fino */
  thin?: number;
  /** Amplitud de la ondulación a lo largo del zarcillo (0-1, fracción de su longitud) */
  wave?: number;
  /** Multiplicador de la velocidad de la animación (1 = normal) */
  speed?: number;
  /** Hundimiento de la curva respecto a la recta entre nodos (0-1, fracción de la longitud) */
  sag?: number;
  /** Deriva ambiental de los nodos internos (px) */
  drift?: number;
  /** Radio de influencia del puntero sobre los zarcillos (px) */
  radius?: number;
  /** Fuerza con la que el puntero atrae los zarcillos (0-1) */
  pull?: number;
  /** Rigidez del muelle que recupera los nodos (0-1) */
  stiffness?: number;
  /** Amortiguación de la velocidad de los nodos (0-1; más alto, más inercia) */
  damping?: number;
  /** Impulso por fotograma que transmite el movimiento del puntero (0-1) */
  kick?: number;
  /** Ojos de gato en los nodos más grandes (0 = sin ojos); la pupila se mueve en horizontal y vertical */
  eyes?: number;
  /** Opacidad de los zarcillos cercanos; los lejanos usan el 40% de este valor. Se aplica a la capa entera */
  alpha?: number;
  /** Radio de la esfera detrás de cada ojo, relativo al nodo (2.2 = más del doble). Se funde con la red por el filtro */
  eyeSphere?: number;
  /** Suavizado de uniones con feGaussianBlur + feColorMatrix */
  goo?: boolean;
  /** Desenfoque del filtro (px) */
  blur?: number;
  /** Contraste del alfa tras el desenfoque */
  contrast?: number;
  /** Umbral del alfa: más alto, la materia se retrae y los hilos finos se cortan antes */
  cut?: number;
  /** Color de la tinta. Sobrescribe la variable CSS --trendil-color del contenedor */
  color?: string;
  /** Clases extra para el contenedor */
  className?: string;
}

type Edge = {
  a: number; b: number; len: number; n: number; path: number;
  seed: number; scale: number; bow: number; wv: number; far: boolean;
  wgt: number; tgx: number; tgy: number;
  ox: number; oy: number; vx: number; vy: number;
  tn: number; tA: number; tB: number;
  sx: Float32Array; sy: Float32Array;
};
type Graph = {
  bx: number[]; by: number[]; wall: boolean[]; deg: number[];
  edges: Edge[]; cross: { e: Edge; u: number }[];
  nodeX: Float32Array; nodeY: Float32Array;
  nox: Float32Array; noy: Float32Array; nvx: Float32Array; nvy: Float32Array;
  acx: Float32Array; acy: Float32Array; akx: Float32Array; aky: Float32Array;
  blob: Float32Array; // escala del zarcillo cercano más grueso que llega a cada nodo (en esta versión los nudos son círculos)
};

const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const smooth = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = smooth(x - xi), fy = smooth(y - yi);
  const a = hash(xi + yi * 57.3), b = hash(xi + 1 + yi * 57.3), c = hash(xi + (yi + 1) * 57.3), d = hash(xi + 1 + (yi + 1) * 57.3);
  const top = a + (b - a) * fx;
  return (top + (c + (d - c) * fx - top) * fy) * 2 - 1;
}
const ccw = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
const crossSeg = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number, dx: number, dy: number) =>
  ccw(ax, ay, cx, cy, dx, dy) !== ccw(bx, by, cx, cy, dx, dy) && ccw(ax, ay, bx, by, cx, cy) !== ccw(ax, ay, bx, by, dx, dy);
const MAXSEG = 64;

export default function TrendilBackground({
  anchors = 60, inner = 6, sparsity = 0.8, span = 0.3, far = 0.3, thick = 25, thin = 1.5, wave = 0.05,
  speed = 1, sag = 0.05, drift = 30, radius = 200, pull = 0.8, stiffness = 0.06, damping = 0.9, kick = 0.05,
  eyes = 3, eyeSphere = 3, alpha = 0.8, goo = true, blur = 3, contrast = 60, cut = 3, color, className,
}: TrendilBackgroundProps) {
  const strands = 0; // esta versión no tiene hilos largos extra
  const fid = "goo" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const frontRef = useRef<HTMLCanvasElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const eyeRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef(alpha);
  alphaRef.current = alpha; // la opacidad cambia sin regenerar la red

  useEffect(() => {
    const front = frontRef.current!;
    const back2 = backRef.current;
    const eye = eyeRef.current!;
    const wrap = wrapRef.current;
    const cF = front.getContext("2d");
    const cB = back2 ? back2.getContext("2d") : null;
    const cE = eye.getContext("2d");
    if (!cF || !cE) return;
    const style = getComputedStyle(front);
    let w = 0, h = 0, px = -9999, py = -9999, pvx = 0, pvy = 0, hasPointer = false, raf = 0;
    let layers: Graph[] = [];
    let eyeNode: number[] = [];
    let eyeR: number[] = [];
    let eyeShape: number[][] = [];
    let look = new Float32Array(0); // por ojo: hacia dónde mira (x, y suavizados, de -1 a 1)
    const lx = new Float32Array(MAXSEG + 1), ly = new Float32Array(MAXSEG + 1);
    const rx = new Float32Array(MAXSEG + 1), ry = new Float32Array(MAXSEG + 1);
    const m = 5;

    const endF = () => 1; // los dos extremos tienen el mismo grosor
    const mkEdge = (bx: number[], by: number[], a: number, b: number, path: number): Edge => {
      const len = Math.hypot(bx[a] - bx[b], by[a] - by[b]);
      const n = Math.max(8, Math.min(MAXSEG, Math.ceil(len / 25)));
      return {
        a, b, len, n, path, seed: Math.random() * 100, scale: 1,
        bow: Math.random() < 0.5 ? -1 : 1, wv: 1, far: Math.random() < far,
        wgt: 0, tgx: 0, tgy: 0, ox: 0, oy: 0, vx: 0, vy: 0, tn: thin, tA: thick, tB: thick,
        sx: new Float32Array(n + 1), sy: new Float32Array(n + 1),
      };
    };
    const pack = (bx: number[], by: number[], wall: boolean[], edges: Edge[], cross: { e: Edge; u: number }[]): Graph => {
      const n = bx.length;
      const deg = new Array<number>(n).fill(0);
      for (const e of edges) { deg[e.a]++; deg[e.b]++; }
      const F = (k: number) => new Float32Array(k);
      const G: Graph = { bx, by, wall, deg, edges, cross, nodeX: F(n), nodeY: F(n), nox: F(n), noy: F(n), nvx: F(n), nvy: F(n), acx: F(n), acy: F(n), akx: F(n), aky: F(n), blob: F(n) };
      G.nodeX.set(bx); G.nodeY.set(by);
      return G;
    };

    // Triangulación voraz (de la arista más corta a la más larga, sin cruces y con grado acotado)
    function buildGreedy(): Graph {
      const v2 = false;
      const bx: number[] = [], by: number[] = [], side: number[] = [];
      const P = 2 * (w + h);
      for (let i = 0; i < anchors; i++) {
        const s = v2 ? (((i + 1.5 * Math.random() - 0.25) / anchors) * P + P) % P : ((i + 0.15 + 0.7 * Math.random()) / anchors) * P;
        if (s < w) { bx.push(s); by.push(-m); side.push(0); }
        else if (s < w + h) { bx.push(w + m); by.push(s - w); side.push(1); }
        else if (s < 2 * w + h) { bx.push(w - (s - w - h)); by.push(h + m); side.push(2); }
        else { bx.push(-m); by.push(h - (s - 2 * w - h)); side.push(3); }
      }
      for (let i = 0; i < inner; i++) {
        let best = 0, X = 0, Y = 0;
        for (let c = 0; c < (v2 ? 3 : 12); c++) {
          const x = w * (v2 ? 0.05 + 0.9 * Math.random() : 0.08 + 0.84 * Math.random());
          const y = h * (v2 ? 0.06 + 0.88 * Math.random() : 0.1 + 0.8 * Math.random());
          let dmin = Infinity;
          for (let k = 0; k < bx.length; k++) dmin = Math.min(dmin, Math.hypot(bx[k] - x, by[k] - y));
          if (dmin > best) { best = dmin; X = x; Y = y; }
        }
        bx.push(X); by.push(Y); side.push(-1);
      }
      const n = bx.length;
      const maxLen = span * Math.hypot(w, h);
      const pairs: { a: number; b: number; len: number }[] = [];
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
        if (side[a] >= 0 && side[a] === side[b]) continue;
        const len = Math.hypot(bx[a] - bx[b], by[a] - by[b]);
        if (len <= maxLen) pairs.push({ a, b, len });
      }
      const key = new Map(pairs.map((p) => [p, v2 ? p.len * (0.5 + Math.random()) : p.len]));
      pairs.sort((p, q) => key.get(p)! - key.get(q)!);
      const deg = new Array<number>(n).fill(0);
      const cap = Array.from({ length: n }, () => (v2 ? 2 + Math.floor(Math.random() * 4) : 5));
      const list: { a: number; b: number }[] = [];
      const crosses = (a: number, b: number) => list.some((e) => e.a !== a && e.a !== b && e.b !== a && e.b !== b && crossSeg(bx[a], by[a], bx[b], by[b], bx[e.a], by[e.a], bx[e.b], by[e.b]));
      const add = (a: number, b: number) => { list.push({ a, b }); deg[a]++; deg[b]++; };
      for (const p of pairs) {
        if (deg[p.a] >= cap[p.a] || deg[p.b] >= cap[p.b] || Math.random() < sparsity || crosses(p.a, p.b)) continue;
        add(p.a, p.b);
      }
      for (let a = 0; a < anchors; a++) {
        if (deg[a] > 0) continue;
        const cand = [...Array(n).keys()].filter((b) => b !== a && side[b] !== side[a])
          .sort((p, q) => Math.hypot(bx[p] - bx[a], by[p] - by[a]) - Math.hypot(bx[q] - bx[a], by[q] - by[a]));
        const b = cand.find((c) => !crosses(a, c));
        if (b !== undefined) add(a, b);
      }
      if (v2) {
        for (let k = 0; k < strands; k++) {
          const a = Math.floor(Math.random() * anchors);
          let best = -1, bl = 0;
          for (let t = 0; t < 6; t++) {
            const b = Math.floor(Math.random() * n);
            const l = Math.hypot(bx[a] - bx[b], by[a] - by[b]);
            if (b !== a && side[b] !== side[a] && l > bl) { bl = l; best = b; }
          }
          if (best >= 0) list.push({ a, b: best });
        }
      }
      const edges = list.map((e, i) => mkEdge(bx, by, e.a, e.b, i));
      const longest = Math.max(1, ...edges.map((e) => e.len));
      for (const e of edges) e.scale = v2 ? (0.28 + 1.25 * (e.len / longest) ** 1.3) * (0.85 + 0.3 * Math.random()) : 0.55 + 0.9 * Math.random();
      const G = pack(bx, by, side.map((s) => s >= 0), edges, []);
      for (const e of edges) if (!e.far) for (const i of [e.a, e.b]) G.blob[i] = Math.max(G.blob[i], e.scale);
      return G;
    }


    function resize() {
      w = front.clientWidth; h = front.clientHeight;
      for (const c of [front, back2, eye]) if (c) { c.width = w; c.height = h; }
      layers = [buildGreedy()];
      const G = layers[0];
      // Ojos en los nodos internos más grandes, a más del 10% de la pantalla del borde. Detrás de cada ojo se dibuja
      // una esfera mayor que el nudo (eyeSphere), para que el ojo sea grande sin engordar los zarcillos
      const rad = new Float32Array(G.bx.length);
      const inside = (i: number) => G.bx[i] >= w * 0.1 && G.bx[i] <= w * 0.9 && G.by[i] >= h * 0.1 && G.by[i] <= h * 0.9;
      for (let i = 0; i < rad.length; i++) if (!G.wall[i] && G.blob[i] > 0 && inside(i)) rad[i] = thick * G.blob[i] * 0.42;
      eyeNode = [...Array(rad.length).keys()].filter((i) => rad[i] > 0).sort((p, q) => rad[q] - rad[p]).slice(0, Math.max(0, Math.round(eyes)));
      eyeR = eyeNode.map((i) => rad[i] * eyeSphere);
      look = new Float32Array(eyeNode.length * 2);
      eyeShape = eyeNode.map(() => [0.1 + 0.08 * Math.random(), 0.08 + 0.08 * Math.random(), 0.04 + 0.04 * Math.random(), Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28]);
    }

    function onPointer(cx: number, cy: number) {
      const rect = front.getBoundingClientRect();
      const qx = cx - rect.left, qy = cy - rect.top;
      if (hasPointer) { pvx = Math.max(-40, Math.min(40, qx - px)); pvy = Math.max(-40, Math.min(40, qy - py)); }
      px = qx; py = qy; hasPointer = true;
    }
    const halfW = (e: Edge, u: number) => (e.tn + (Math.max(e.tA + (e.tB - e.tA) * u, e.tn) - e.tn) * Math.abs(1 - 2 * u) ** 2.4) / 2;

    function pointerPull(G: Graph, e: Edge) {
      e.wgt = 0; e.tgx = 0; e.tgy = 0;
      if (!hasPointer) return;
      const x0 = G.nodeX[e.a], y0 = G.nodeY[e.a];
      const dx = G.nodeX[e.b] - x0, dy = G.nodeY[e.b] - y0;
      const len = Math.hypot(dx, dy) || 1;
      const u = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / (len * len)));
      const cx = x0 + dx * u, cy = y0 + dy * u;
      const wgt = (1 - Math.min(1, Math.hypot(px - cx, py - cy) / radius)) ** 2;
      e.wgt = wgt; e.tgx = (px - cx) * pull * wgt; e.tgy = (py - cy) * pull * wgt;
      for (const i of [e.a, e.b]) { G.acx[i] += e.tgx; G.acy[i] += e.tgy; G.akx[i] += pvx * kick * wgt; G.aky[i] += pvy * kick * wgt; }
    }

    function updateGraph(G: Graph, time: number) {
      G.acx.fill(0); G.acy.fill(0); G.akx.fill(0); G.aky.fill(0);
      for (const e of G.edges) pointerPull(G, e);
      // Los nodos interiores siguen la fuerza media de los zarcillos que llegan a ellos (con muelle: vibran)
      for (let i = 0; i < G.bx.length; i++) {
        if (G.wall[i]) continue;
        G.nodeX[i] = G.bx[i] + noise(i * 1.7, time * 0.00012 * speed) * drift;
        G.nodeY[i] = G.by[i] + noise(i * 1.7 + 31.7, time * 0.00012 * speed) * drift;
      }
      for (const e of G.edges) {
        const x0 = G.nodeX[e.a], y0 = G.nodeY[e.a], x1 = G.nodeX[e.b], y1 = G.nodeY[e.b];
        const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;
        let tgx = e.tgx, tgy = e.tgy;
        const lim = len * 0.3, tm = Math.hypot(tgx, tgy);
        if (tm > lim) { tgx *= lim / tm; tgy *= lim / tm; }
        e.vx = (e.vx + (tgx - e.ox) * stiffness + pvx * kick * e.wgt) * damping;
        e.vy = (e.vy + (tgy - e.oy) * stiffness + pvy * kick * e.wgt) * damping;
        e.ox += e.vx; e.oy += e.vy;
        const cxc = (x0 + x1) / 2 + nx * len * sag * e.bow * 2 + e.ox * 2;
        const cyc = (y0 + y1) / 2 + ny * len * sag * e.bow * 2 + e.oy * 2;
        const t = time * 0.00035 * speed;
        for (let i = 0; i <= e.n; i++) {
          const u = i / e.n, q = 1 - u;
          const k = (noise(e.seed + u * 2.6, t) + 0.5 * noise(e.seed * 1.7 + u * 6, t * 1.9 + 9)) * wave * e.wv * len * Math.sin(Math.PI * u);
          e.sx[i] = q * q * x0 + 2 * q * u * cxc + u * u * x1 + nx * k;
          e.sy[i] = q * q * y0 + 2 * q * u * cyc + u * u * y1 + ny * k;
        }
        e.tn = (thin * Math.min(1.6, e.scale)) / (1 + (Math.hypot(e.ox, e.oy) / len) * 6);
        e.tA = thick * e.scale * endF();
        e.tB = thick * e.scale * endF();
      }
    }

    // Bordes izquierdo y derecho de la cinta de un zarcillo (extremos cortados en recto)
    function sides(e: Edge) {
      const n = e.n;
      for (let i = 0; i <= n; i++) {
        const i0 = Math.max(0, i - 1), i1 = Math.min(n, i + 1);
        const ddx = e.sx[i1] - e.sx[i0], ddy = e.sy[i1] - e.sy[i0], dd = Math.hypot(ddx, ddy) || 1;
        const hw = halfW(e, i / n);
        lx[i] = e.sx[i] - (ddy / dd) * hw; ly[i] = e.sy[i] + (ddx / dd) * hw;
        rx[i] = e.sx[i] + (ddy / dd) * hw; ry[i] = e.sy[i] - (ddx / dd) * hw;
      }
    }
    function poly(c: CanvasRenderingContext2D, i0: number, i1: number) {
      c.moveTo(lx[i0], ly[i0]);
      for (let i = i0 + 1; i <= i1; i++) c.lineTo(lx[i], ly[i]);
      for (let i = i1; i >= i0; i--) c.lineTo(rx[i], ry[i]);
      c.closePath();
    }

    // Cada grupo (cercanos / lejanos) se dibuja opaco en su canvas; el filtro y la opacidad se aplican después
    function drawEdges(c: CanvasRenderingContext2D, G: Graph, farOnes: boolean, ink: string, spheres?: number[][][]) {
      c.clearRect(0, 0, w, h);
      c.globalAlpha = 1;
      c.fillStyle = ink;
      c.beginPath();
      for (const e of G.edges) {
        if (e.far !== farOnes) continue;
        sides(e);
        poly(c, 0, e.n);
      }
      if (!farOnes) {
        // En esta versión los nudos son círculos del grosor de sus zarcillos
        for (let i = 0; i < G.bx.length; i++) {
          if (G.blob[i] <= 0) continue;
          const r = thick * G.blob[i] * (G.wall[i] ? 0.62 : 0.42);
          c.moveTo(G.nodeX[i] + r, G.nodeY[i]); c.arc(G.nodeX[i], G.nodeY[i], r, 0, Math.PI * 2, true);
        }
        // Esferas detrás de los ojos: en la misma capa, así que el filtro las funde con la red
        if (spheres) for (const ring of spheres) {
          const n = ring.length;
          c.moveTo((ring[n - 1][0] + ring[0][0]) / 2, (ring[n - 1][1] + ring[0][1]) / 2);
          for (let q = 0; q < n; q++) { const a = ring[q], b = ring[(q + 1) % n]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
          c.closePath();
        }
      }
      c.fill();
    }

    // Pupila rasgada sobre una esfera: gira hacia el puntero (hasta ~54° en horizontal) y se inclina hasta 35° en
    // vertical. La rendija es un meridiano de la esfera proyectado, así que se curva hacia donde mira y se estrecha
    // al girar (efecto 3D)
    function drawPupil(c: CanvasRenderingContext2D, x: number, y: number, R: number, lookX: number, lookY: number) {
      const yaw = lookX * 0.95, pitch = (lookY * 35 * Math.PI) / 180;
      const sY = Math.sin(yaw), cY = Math.cos(yaw), sP = Math.sin(pitch), cP = Math.cos(pitch);
      const rho = R * 0.88, lamMax = 1.0, N = 14;
      const px2: number[] = [], py2: number[] = [], hw: number[] = [];
      for (let s = 0; s <= N; s++) {
        const lam = (-1 + (2 * s) / N) * lamMax;
        const x1 = Math.cos(lam) * sY, y1 = Math.sin(lam), z1 = Math.cos(lam) * cY;
        const y2 = y1 * cP + z1 * sP, z2 = -y1 * sP + z1 * cP;
        px2.push(x + x1 * rho); py2.push(y + y2 * rho);
        hw.push(R * 0.17 * Math.max(0.3, z2) * Math.sqrt(Math.max(0, 1 - (lam / lamMax) ** 2)));
      }
      const L: number[][] = [], Rt: number[][] = [];
      for (let s = 0; s <= N; s++) {
        const a = Math.max(0, s - 1), b = Math.min(N, s + 1);
        const tx = px2[b] - px2[a], ty = py2[b] - py2[a], d = Math.hypot(tx, ty) || 1;
        L.push([px2[s] - (ty / d) * hw[s], py2[s] + (tx / d) * hw[s]]);
        Rt.push([px2[s] + (ty / d) * hw[s], py2[s] - (tx / d) * hw[s]]);
      }
      c.beginPath();
      c.moveTo(L[0][0], L[0][1]);
      for (let s = 1; s <= N; s++) c.lineTo(L[s][0], L[s][1]);
      for (let s = N; s >= 0; s--) c.lineTo(Rt[s][0], Rt[s][1]);
      c.closePath();
      c.fill();
    }

    // Forma irregular de la esfera de cada ojo: tres armónicos con fase propia que derivan despacio, normalizados para
    // que el radio mínimo sea el de la esfera (así el ojo, al 80%, siempre cabe dentro)
    const blobRing = (cx: number, cy: number, r0: number, sh: number[], t: number) => {
      const N = 28, f: number[] = [];
      let mn = Infinity;
      for (let q = 0; q < N; q++) {
        const th = -(q / N) * Math.PI * 2;
        const v = 1 + sh[0] * Math.sin(2 * th + sh[3] + t * 0.0003) + sh[1] * Math.sin(3 * th + sh[4] - t * 0.0004) + sh[2] * Math.sin(5 * th + sh[5] + t * 0.0005);
        f.push(v); mn = Math.min(mn, v);
      }
      return f.map((v, q) => { const th = -(q / N) * Math.PI * 2; return [cx + Math.cos(th) * (r0 * v) / mn, cy + Math.sin(th) * (r0 * v) / mn]; });
    };

    function animate(time: number) {
      const ink = style.getPropertyValue("--trendil-color").trim() || style.color;
      const k0 = style.getPropertyValue("--trendil-opacity").trim();
      const mul = k0 !== "" && Number.isFinite(Number(k0)) ? Number(k0) : 1;
      pvx *= 0.85; pvy *= 0.85;
      for (const G of layers) updateGraph(G, time);
      const F0 = layers[0];
      const spheres = eyeNode.map((i, k) => blobRing(F0.nodeX[i], F0.nodeY[i], eyeR[k], eyeShape[k], time));
      drawEdges(cF!, F0, false, ink, spheres);
      if (cB) drawEdges(cB, layers[0], true, ink);
      const fo = Math.min(1, alphaRef.current * mul);
      front.style.opacity = String(fo);
      eye.style.opacity = String(fo);
      if (back2) back2.style.opacity = String(Math.min(1, alphaRef.current * mul * 0.4));

      // Ojos: se recorta un hueco en la capa delantera y se dibujan en su propio canvas, fuera del filtro.
      // La pupila se desplaza hacia el puntero en horizontal y vertical
      cE!.clearRect(0, 0, w, h);
      cE!.fillStyle = ink; cE!.strokeStyle = ink;
      const F = layers[0];
      cF!.globalCompositeOperation = "destination-out";
      const holes: string[] = [];
      for (let k = 0; k < eyeNode.length; k++) {
        const i = eyeNode[k], R = eyeR[k] * 0.8, x = F.nodeX[i], y = F.nodeY[i];
        const tx = hasPointer ? Math.max(-1, Math.min(1, (px - x) / 150)) : 0;
        const ty = hasPointer ? Math.max(-1, Math.min(1, (py - y) / 150)) : 0;
        look[2 * k] += (tx - look[2 * k]) * 0.12;
        look[2 * k + 1] += (ty - look[2 * k + 1]) * 0.12;
        cF!.beginPath(); cF!.arc(x, y, R, 0, Math.PI * 2); cF!.fill(); // respaldo si el navegador no soporta máscaras
        holes.push(`radial-gradient(circle ${(R + 1).toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px,transparent ${R.toFixed(1)}px,#000 ${(R + 0.8).toFixed(1)}px)`);
        cE!.lineWidth = Math.max(1, R * 0.08);
        cE!.beginPath(); cE!.arc(x, y, R, 0, Math.PI * 2); cE!.stroke();
        drawPupil(cE!, x, y, R, look[2 * k], look[2 * k + 1]);
      }
      cF!.globalCompositeOperation = "source-over";
      // El hueco de los ojos se hace con una máscara CSS sobre el contenedor de los zarcillos. La máscara se aplica
      // después del filtro, así que el suavizado no puede rellenar el hueco ni desenfocar su borde
      if (wrap) {
        const ws = wrap.style as unknown as Record<string, string>;
        const img = holes.length ? holes.join(",") : "none";
        ws.maskImage = img; ws.webkitMaskImage = img;
        ws.maskComposite = "intersect"; ws.webkitMaskComposite = "source-in";
      }
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(front);
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onPointer(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    resize();
    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("mousemove", onMouse); window.removeEventListener("touchmove", onTouch);
    };
  }, [anchors, inner, sparsity, span, eyeSphere, far, thick, thin, wave, speed, sag, drift, radius, pull, stiffness, damping, kick, eyes]);

  const cv: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" };
  const gooStyle: React.CSSProperties = goo ? { filter: `url(#${fid})` } : {};
  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ background: "var(--panel)", isolation: "isolate", pointerEvents: "none", ...(color ? { "--trendil-color": color } : {}) } as React.CSSProperties}>
      {goo && (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <filter id={fid} colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="b" />
              <feColorMatrix in="b" mode="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${-cut}`} />
            </filter>
          </defs>
        </svg>
      )}
      <div ref={wrapRef} style={{ ...cv, zIndex: 1, pointerEvents: "none" }}>
        <canvas ref={backRef} style={{ ...cv, ...gooStyle }} />
        <canvas ref={frontRef} style={{ ...cv, ...gooStyle }} />
      </div>
      <canvas ref={eyeRef} style={{ ...cv, zIndex: 2, pointerEvents: "none" }} />
    </div>
  );
}
