import { useEffect, useRef } from "react";

export interface CoralBackgroundProps {
  /** Píxeles por celda de la simulación: más alto = más ligero y trazos más gruesos */
  res?: number;
  /** Pasos de simulación por fotograma de cálculo: más alto = el coral crece más rápido */
  steps?: number;
  /** Parámetros de Gray-Scott. Con los valores por defecto crecen ramas y laberintos como un coral */
  feed?: number;
  kill?: number;
  /** Mortandad extra (0-0.002): más alto, el coral cubre menos superficie y queda más fino */
  erode?: number;
  /** Radio (en celdas) del claro que abre el puntero a su paso; el coral vuelve a crecer desde ahí */
  brush?: number;
  /** Opacidad del contorno (0-1); el relleno usa la mitad */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color del coral. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

// Convierte cualquier color CSS a [r, g, b] pintándolo en un píxel
const rgbCache = new Map<string, [number, number, number]>();
function rgbOf(ink: string): [number, number, number] {
  const hit = rgbCache.get(ink);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const g = c.getContext("2d")!;
  g.fillStyle = ink;
  g.fillRect(0, 0, 1, 1);
  const d = g.getImageData(0, 0, 1, 1).data;
  const rgb: [number, number, number] = [d[0], d[1], d[2]];
  rgbCache.set(ink, rgb);
  return rgb;
}

// Un paso de "marching squares": segmentos de la curva de nivel L dentro de una celda
function march(out: number[], cell: number, x0: number, y0: number, a: number, b: number, c: number, d: number, L: number) {
  const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
  if (idx === 0 || idx === 15) return;
  const x1 = x0 + cell;
  const y1 = y0 + cell;
  const tx = x0 + (cell * (L - a)) / (b - a);
  const ry = y0 + (cell * (L - b)) / (c - b);
  const bx = x0 + (cell * (L - d)) / (c - d);
  const ly = y0 + (cell * (L - a)) / (d - a);
  switch (idx) {
    case 1: case 14: out.push(x0, ly, bx, y1); break;
    case 2: case 13: out.push(bx, y1, x1, ry); break;
    case 3: case 12: out.push(x0, ly, x1, ry); break;
    case 4: case 11: out.push(tx, y0, x1, ry); break;
    case 6: case 9: out.push(tx, y0, bx, y1); break;
    case 7: case 8: out.push(tx, y0, x0, ly); break;
    case 5: out.push(tx, y0, x0, ly, bx, y1, x1, ry); break;
    case 10: out.push(tx, y0, x1, ry, x0, ly, bx, y1); break;
  }
}

export default function CoralBackground({
  res = 3,
  steps = 5,
  feed = 0.0545,
  kill = 0.062,
  erode = 0.0006,
  brush = 4,
  alpha = 0.2,
  lineWidth = 1.2,
  color,
  className,
}: CoralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let cw = 0;
    let ch = 0;
    let U = new Float32Array(0); // sustrato
    let V = new Float32Array(0); // coral
    let U2 = new Float32Array(0);
    let V2 = new Float32Array(0);
    let buf: HTMLCanvasElement | null = null;
    let bctx: CanvasRenderingContext2D | null = null;
    let img: ImageData | null = null;
    let lastX = -1;
    let lastY = -1;
    let frame = 0;
    let raf = 0;
    const seg1: number[] = [];
    const seg2: number[] = [];

    // Siembra un punto de coral (y consume sustrato a su alrededor)
    function seed(cx: number, cy: number, r: number) {
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          const xx = cx + x;
          const yy = cy + y;
          if (xx < 0 || yy < 0 || xx >= cw || yy >= ch || x * x + y * y > r * r) continue;
          V[yy * cw + xx] = 0.9;
          U[yy * cw + xx] = 0.3;
        }
      }
    }

    // Un paso de Gray-Scott (difusión + reacción) con bordes reflectantes
    function step() {
      for (let y = 0; y < ch; y++) {
        const yu = (y > 0 ? y - 1 : 0) * cw;
        const yc = y * cw;
        const yd = (y < ch - 1 ? y + 1 : ch - 1) * cw;
        for (let x = 0; x < cw; x++) {
          const xl = x > 0 ? x - 1 : 0;
          const xr = x < cw - 1 ? x + 1 : cw - 1;
          const i = yc + x;
          const u = U[i];
          const v = V[i];
          const lu = -u + 0.2 * (U[yu + x] + U[yd + x] + U[yc + xl] + U[yc + xr]) + 0.05 * (U[yu + xl] + U[yu + xr] + U[yd + xl] + U[yd + xr]);
          const lv = -v + 0.2 * (V[yu + x] + V[yd + x] + V[yc + xl] + V[yc + xr]) + 0.05 * (V[yu + xl] + V[yu + xr] + V[yd + xl] + V[yd + xr]);
          const uvv = u * v * v;
          U2[i] = u + (lu - uvv + feed * (1 - u));
          V2[i] = v + (0.5 * lv + uvv - (kill + feed) * v - erode * v);
        }
      }
      let t = U; U = U2; U2 = t;
      t = V; V = V2; V2 = t;
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      cw = Math.ceil(w / res);
      ch = Math.ceil(h / res);
      const n = cw * ch;
      U = new Float32Array(n).fill(1);
      V = new Float32Array(n);
      U2 = new Float32Array(n);
      V2 = new Float32Array(n);
      buf = document.createElement("canvas");
      buf.width = cw;
      buf.height = ch;
      bctx = buf.getContext("2d");
      img = bctx ? bctx.createImageData(cw, ch) : null;
      // Colonias iniciales repartidas por el contenedor y un pequeño avance para que no arranque vacío
      const colonies = Math.max(6, Math.round((cw * ch) / 900));
      for (let i = 0; i < colonies; i++) seed(Math.floor(Math.random() * cw), Math.floor(Math.random() * ch), 2);
      for (let i = 0; i < 400; i++) step();
    }

    // El puntero abre un claro a su paso (el coral desaparece de él) y deja una semilla en el centro:
    // desde ahí el coral vuelve a crecer y se reencuentra con el de alrededor
    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / res;
      const y = (clientY - rect.top) / res;
      const x0 = lastX < 0 ? x : lastX;
      const y0 = lastY < 0 ? y : lastY;
      const n = Math.max(1, Math.ceil(Math.hypot(x - x0, y - y0) / 2)); // se interpola el tramo recorrido
      for (let s = 1; s <= n; s++) {
        const cx = Math.round(x0 + ((x - x0) * s) / n);
        const cy = Math.round(y0 + ((y - y0) * s) / n);
        for (let dy = -brush; dy <= brush; dy++) {
          for (let dx = -brush; dx <= brush; dx++) {
            const xx = cx + dx;
            const yy = cy + dy;
            if (xx < 0 || yy < 0 || xx >= cw || yy >= ch || dx * dx + dy * dy > brush * brush) continue;
            V[yy * cw + xx] = 0;
            U[yy * cw + xx] = 1;
          }
        }
        if (s === n) seed(cx, cy, 1);
      }
      lastX = x;
      lastY = y;
    }

    function strokeSegments(seg: number[]) {
      ctx!.beginPath();
      for (let i = 0; i < seg.length; i += 4) {
        ctx!.moveTo(seg[i], seg[i + 1]);
        ctx!.lineTo(seg[i + 2], seg[i + 3]);
      }
      ctx!.stroke();
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      // El coral crece despacio: se calcula a 30 fps y los fotogramas impares conservan el dibujo anterior
      if (frame++ % 2 === 1 || !img || !bctx || !buf) return;

      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--coral-color").trim() || style.color;
      const k = style.getPropertyValue("--coral-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      const [r, g, b] = rgbOf(ink);

      for (let i = 0; i < steps; i++) step();

      // Relleno suave del coral (una capa tenue) a baja resolución, ampliada con suavizado
      const data = img.data;
      const fillA = alpha * 0.5 * mul * 255;
      for (let i = 0, o = 0; i < V.length; i++) {
        const t = Math.min(1, Math.max(0, (V[i] - 0.16) / 0.1));
        data[o++] = r;
        data[o++] = g;
        data[o++] = b;
        data[o++] = t * t * (3 - 2 * t) * fillA;
      }
      bctx.putImageData(img, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "high";
      ctx!.drawImage(buf, 0, 0, cw * res, ch * res);

      // Contornos nítidos (vectoriales) a dos niveles: borde del coral y un halo exterior más tenue
      seg1.length = 0;
      seg2.length = 0;
      for (let y = 0; y < ch - 1; y++) {
        for (let x = 0; x < cw - 1; x++) {
          const a = V[y * cw + x];
          const bb = V[y * cw + x + 1];
          const d = V[(y + 1) * cw + x];
          const c = V[(y + 1) * cw + x + 1];
          const hi = Math.max(a, bb, c, d);
          if (hi < 0.08) continue;
          const lo = Math.min(a, bb, c, d);
          if (lo < 0.2 && hi > 0.2) march(seg1, res, x * res, y * res, a, bb, c, d, 0.2);
          if (lo < 0.1 && hi > 0.1) march(seg2, res, x * res, y * res, a, bb, c, d, 0.1);
        }
      }
      ctx!.strokeStyle = ink;
      ctx!.lineCap = "round";
      ctx!.lineWidth = lineWidth;
      ctx!.globalAlpha = Math.min(1, alpha * mul);
      strokeSegments(seg1);
      ctx!.lineWidth = lineWidth * 0.8;
      ctx!.globalAlpha = Math.min(1, alpha * mul * 0.4);
      strokeSegments(seg2);
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
  }, [res, steps, feed, kill, erode, brush, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--coral-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
