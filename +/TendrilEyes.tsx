import { useEffect, useId, useRef } from "react";

export interface TendrilV10Props {
  /** Terminaciones aproximadas pegadas a las paredes */
  anchors?: number;
  /** Nodos internos aproximados */
  inner?: number;
  /** Hilos largos extra que cruzan de pared a pared */
  strands?: number;
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
  wave?: number;
  speed?: number;
  sag?: number;
  /** Deriva ambiental de los nodos internos (px) */
  drift?: number;
  radius?: number;
  pull?: number;
  stiffness?: number;
  damping?: number;
  kick?: number;
  /** Ojos de gato en los nodos más grandes (0 = sin ojos); la pupila solo se mueve en horizontal */
  eyes?: number;
  /** Opacidad de los zarcillos cercanos; los lejanos usan el 40% de este valor. Se aplica a la capa entera */
  alpha?: number;
  /** Suavizado de uniones con feGaussianBlur + feColorMatrix */
  goo?: boolean;
  /** Desenfoque del filtro (px) */
  blur?: number;
  /** Contraste del alfa tras el desenfoque */
  contrast?: number;
  /** Umbral del alfa: más alto, la materia se retrae y los hilos finos se cortan antes */
  cut?: number;
  color?: string;
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

export default function TendrilV10({
  anchors = 20, inner = 12, strands = 6, sparsity = 0.2, span = 0.55, far = 0.3, thick = 11, thin = 3, wave = 0.1,
  speed = 1, sag = 0.04, drift = 10, radius = 200, pull = 0.4, stiffness = 0.06, damping = 0.9, kick = 0.05,
  eyes = 0, alpha = 0.5, goo = true, blur = 3, contrast = 20, cut = 4, color, className,
}: TendrilV10Props) {
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
    let look = new Float32Array(0); // por ojo: desplazamiento horizontal suavizado de la pupila (-1 a 1)
    const lx = new Float32Array(MAXSEG + 1), ly = new Float32Array(MAXSEG + 1);
    const rx = new Float32Array(MAXSEG + 1), ry = new Float32Array(MAXSEG + 1);
    const m = 5;

    const endF = (G: Graph, i: number) => (G.wall[i] ? 1.15 : 0.8);
    const mkEdge = (bx: number[], by: number[], a: number, b: number, path: number): Edge => {
      const len = Math.hypot(bx[a] - bx[b], by[a] - by[b]);
      const n = Math.max(8, Math.min(MAXSEG, Math.ceil(len / 25)));
      return {
        a, b, len, n, path, seed: Math.random() * 100, scale: 1,
        bow: (Math.random() < 0.5 ? -1 : 1) * (0.4 + 1.6 * Math.random()), wv: 0.6 + Math.random(), far: Math.random() < far,
        wgt: 0, tgx: 0, tgy: 0, ox: 0, oy: 0, vx: 0, vy: 0, tn: thin, tA: thick, tB: thick,
        sx: new Float32Array(n + 1), sy: new Float32Array(n + 1),
      };
    };
    const pack = (bx: number[], by: number[], wall: boolean[], edges: Edge[], cross: { e: Edge; u: number }[]): Graph => {
      const n = bx.length;
      const deg = new Array<number>(n).fill(0);
      for (const e of edges) { deg[e.a]++; deg[e.b]++; }
      const F = (k: number) => new Float32Array(k);
      const G: Graph = { bx, by, wall, deg, edges, cross, nodeX: F(n), nodeY: F(n), nox: F(n), noy: F(n), nvx: F(n), nvy: F(n), acx: F(n), acy: F(n), akx: F(n), aky: F(n) };
      G.nodeX.set(bx); G.nodeY.set(by);
      return G;
    };

    // Triangulación voraz (como V2) (de la arista más corta a la más larga, sin cruces y con grado acotado)
    function buildGreedy(): Graph {
      const v2 = true;
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
      return pack(bx, by, side.map((s) => s >= 0), edges, []);
    }


    function resize() {
      w = front.clientWidth; h = front.clientHeight;
      for (const c of [front, back2, eye]) if (c) { c.width = w; c.height = h; }
      layers = [buildGreedy()];
      const G = layers[0];
      const rad = new Float32Array(G.bx.length);
      for (const e of G.edges)
        for (const i of [e.a, e.b]) if (!e.far && !G.wall[i]) rad[i] = Math.max(rad[i], (thick * e.scale * endF(G, i)) / 2);
      eyeNode = [...Array(G.bx.length).keys()].filter((i) => rad[i] > 0).sort((p, q) => rad[q] - rad[p]).slice(0, Math.max(0, Math.round(eyes)));
      eyeR = eyeNode.map((i) => rad[i]);
      look = new Float32Array(eyeNode.length);
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
        const c = G.deg[i] || 1;
        G.nvx[i] = (G.nvx[i] + (0.7 * (G.acx[i] / c) - G.nox[i]) * stiffness + G.akx[i] / c) * damping;
        G.nvy[i] = (G.nvy[i] + (0.7 * (G.acy[i] / c) - G.noy[i]) * stiffness + G.aky[i] / c) * damping;
        G.nox[i] += G.nvx[i]; G.noy[i] += G.nvy[i];
        G.nodeX[i] = G.bx[i] + noise(i * 1.7, time * 0.00012 * speed) * drift + G.nox[i];
        G.nodeY[i] = G.by[i] + noise(i * 1.7 + 31.7, time * 0.00012 * speed) * drift + G.noy[i];
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
        e.tA = thick * e.scale * endF(G, e.a);
        e.tB = thick * e.scale * endF(G, e.b);
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
    function drawEdges(c: CanvasRenderingContext2D, G: Graph, farOnes: boolean, ink: string) {
      c.clearRect(0, 0, w, h);
      c.globalAlpha = 1;
      c.fillStyle = ink;
      c.beginPath();
      for (const e of G.edges) {
        if (e.far !== farOnes) continue;
        sides(e);
        poly(c, 0, e.n);
        // Tapas redondeadas en ambos extremos, como en V2
        for (const i of [0, e.n]) {
          const hw = Math.hypot(lx[i] - rx[i], ly[i] - ry[i]) / 2;
          c.moveTo(e.sx[i] + hw, e.sy[i]);
          c.arc(e.sx[i], e.sy[i], hw, 0, Math.PI * 2, true);
        }
      }
      c.fill();
    }

    function animate(time: number) {
      const ink = style.getPropertyValue("--tendril-color").trim() || style.color;
      const k0 = style.getPropertyValue("--tendril-opacity").trim();
      const mul = k0 !== "" && Number.isFinite(Number(k0)) ? Number(k0) : 1;
      pvx *= 0.85; pvy *= 0.85;
      for (const G of layers) updateGraph(G, time);
      drawEdges(cF!, layers[0], false, ink);
      if (cB) drawEdges(cB, layers[0], true, ink);
      const fo = Math.min(1, alphaRef.current * mul);
      front.style.opacity = String(fo);
      eye.style.opacity = String(fo);
      if (back2) back2.style.opacity = String(Math.min(1, alphaRef.current * mul * 0.4));

      // Ojos: se recorta un hueco en la capa delantera y se dibujan en su propio canvas, fuera del filtro.
      // La pupila solo se desplaza en horizontal hacia el puntero
      cE!.clearRect(0, 0, w, h);
      cE!.fillStyle = ink; cE!.strokeStyle = ink;
      const F = layers[0];
      cF!.globalCompositeOperation = "destination-out";
      const holes: string[] = [];
      for (let k = 0; k < eyeNode.length; k++) {
        const i = eyeNode[k], R = eyeR[k] * 0.78, x = F.nodeX[i], y = F.nodeY[i];
        const tx = hasPointer ? Math.max(-1, Math.min(1, (px - x) / 150)) : 0;
        look[k] += (tx - look[k]) * 0.12;
        cF!.beginPath(); cF!.arc(x, y, R, 0, Math.PI * 2); cF!.fill(); // respaldo si el navegador no soporta máscaras
        holes.push(`radial-gradient(circle ${(R + 1).toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px,transparent ${R.toFixed(1)}px,#000 ${(R + 0.8).toFixed(1)}px)`);
        cE!.lineWidth = Math.max(1, R * 0.08);
        cE!.beginPath(); cE!.arc(x, y, R, 0, Math.PI * 2); cE!.stroke();
        cE!.beginPath(); cE!.ellipse(x + look[k] * R * 0.55, y, R * 0.13, R * 0.62, 0, 0, Math.PI * 2); cE!.fill();
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
  }, [anchors, inner, strands, sparsity, span, far, thick, thin, wave, speed, sag, drift, radius, pull, stiffness, damping, kick, eyes]);

  const cv: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" };
  const gooStyle: React.CSSProperties = goo ? { filter: `url(#${fid})` } : {};
  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ isolation: "isolate", pointerEvents: "none", ...(color ? { "--tendril-color": color } : {}) } as React.CSSProperties}>
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
