import { useEffect, useRef } from "react";

export interface FacetBackgroundProps {
  /** Lado de cada triángulo (px) */
  size?: number;
  /** Altura de las olas del relieve (px): más alto, facetas más contrastadas */
  height?: number;
  /** Velocidad del relieve (1 = normal, 0 = quieto) */
  speed?: number;
  /** Cuánto levanta el puntero el relieve a su alrededor (px) */
  lift?: number;
  /** Radio de la colina que levanta el puntero (px) */
  radius?: number;
  /** Irregularidad de los vértices (0-1): rompe la regularidad de las olas y hace que se vea cada triángulo */
  rough?: number;
  /** Número de tonos planos en que se reparte la iluminación de las facetas */
  tones?: number;
  /** Invierte la iluminación (útil para tinta blanca sobre fondo oscuro, si prefieres que lo iluminado sea más claro) */
  invert?: boolean;
  /** Opacidad de la faceta más iluminada (0-1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

// Dirección de la luz (normalizada): llega desde arriba a la izquierda
const LX = -0.45;
const LY = -0.55;
const LZ = 0.7;
const LL = Math.hypot(LX, LY, LZ);

export default function FacetBackground({
  size = 64,
  height = 34,
  speed = 1,
  lift = 70,
  radius = 220,
  rough = 0.45,
  tones = 8,
  invert = false,
  alpha = 0.16,
  color,
  className,
}: FacetBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    const rowH = size * 0.866; // altura de una fila de triángulos equiláteros
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let Z = new Float32Array(0); // altura de cada vértice
    let J = new Float32Array(0); // irregularidad fija de cada vértice (-1 a 1)
    let buckets: Float32Array[] = []; // triángulos agrupados por tono: 6 números por triángulo
    let counts: number[] = [];
    let hasPointer = false;
    let tx = 0;
    let ty = 0;
    let bx = 0;
    let by = 0;
    let amp = 0;
    let frame = 0;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / size) + 3;
      rows = Math.ceil(h / rowH) + 3;
      Z = new Float32Array(cols * rows);
      J = new Float32Array(cols * rows).map(() => Math.random() * 2 - 1);
      const maxTris = (cols - 1) * (rows - 1) * 2;
      buckets = Array.from({ length: tones }, () => new Float32Array(maxTris * 6));
      counts = new Array(tones).fill(0);
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

    // Posición en pantalla de un vértice (las filas impares van desplazadas medio lado)
    const vx = (i: number, j: number) => (i - 1 + (j & 1) * 0.5) * size;
    const vy = (j: number) => (j - 1) * rowH;

    // Reparte un triángulo en el cubo de su tono según cómo lo ilumine la luz
    function tri(a: number, b: number, c: number, ia: number, ja: number, ib: number, jb: number, ic: number, jc: number) {
      const ax = vx(ia, ja), ay = vy(ja);
      const e1x = vx(ib, jb) - ax, e1y = vy(jb) - ay, e1z = Z[b] - Z[a];
      const e2x = vx(ic, jc) - ax, e2y = vy(jc) - ay, e2z = Z[c] - Z[a];
      let nx = e1y * e2z - e1z * e2y;
      let ny = e1z * e2x - e1x * e2z;
      let nz = e1x * e2y - e1y * e2x;
      if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      const nl = Math.hypot(nx, ny, nz) || 1;
      let t = ((nx * LX + ny * LY + nz * LZ) / (nl * LL) - 0.35) / 0.65; // 0 = en sombra, 1 = muy iluminada
      t = Math.min(1, Math.max(0, t));
      if (invert) t = 1 - t;
      const q = Math.round(t * (tones - 1));
      const arr = buckets[q];
      const o = counts[q] * 6;
      arr[o] = ax; arr[o + 1] = ay;
      arr[o + 2] = vx(ib, jb); arr[o + 3] = vy(jb);
      arr[o + 4] = vx(ic, jc); arr[o + 5] = vy(jc);
      counts[q]++;
    }

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      // El relieve se mueve despacio: se calcula a 30 fps y los fotogramas impares conservan el dibujo anterior
      if (frame++ % 2 === 1) return;
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--facet-color").trim() || style.color;
      const k = style.getPropertyValue("--facet-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;

      bx += (tx - bx) * 0.08;
      by += (ty - by) * 0.08;
      amp += ((hasPointer ? 1 : 0) - amp) * 0.03;
      const t = time * 0.0005 * speed;
      const r2 = radius * radius;

      // Relieve: tres olas lentas sobre la malla + la colina que sigue al puntero
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = vx(i, j);
          const y = vy(j);
          let z = height * (0.5 * Math.sin(0.0105 * x + 0.0062 * y + t) + 0.4 * Math.sin(0.0071 * y - 0.0094 * x - t * 0.8 + 1.4) + 0.25 * Math.sin(0.021 * x + 0.017 * y + t * 1.7));
          const dx = x - bx;
          const dy = y - by;
          z += amp * lift * Math.exp(-(dx * dx + dy * dy) / r2);
          Z[j * cols + i] = z + J[j * cols + i] * height * rough;
        }
      }

      counts.fill(0);
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const a = j * cols + i;
          if (j & 1) {
            // fila impar (desplazada): triángulo con el vértice hacia abajo y otro hacia arriba
            tri(a, a + 1, a + cols + 1, i, j, i + 1, j, i + 1, j + 1);
            tri(a, a + cols + 1, a + cols, i, j, i + 1, j + 1, i, j + 1);
          } else {
            tri(a, a + 1, a + cols, i, j, i + 1, j, i, j + 1);
            tri(a + cols, a + 1, a + cols + 1, i, j + 1, i + 1, j, i + 1, j + 1);
          }
        }
      }

      ctx!.fillStyle = ink;
      for (let q = 0; q < tones; q++) {
        if (!counts[q]) continue;
        const arr = buckets[q];
        ctx!.beginPath();
        for (let n = 0; n < counts[q]; n++) {
          const o = n * 6;
          ctx!.moveTo(arr[o], arr[o + 1]);
          ctx!.lineTo(arr[o + 2], arr[o + 3]);
          ctx!.lineTo(arr[o + 4], arr[o + 5]);
          ctx!.closePath();
        }
        const lvl = tones > 1 ? q / (tones - 1) : 1;
        ctx!.globalAlpha = Math.min(1, alpha * mul * (0.12 + 0.88 * lvl));
        ctx!.fill();
      }
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
  }, [size, height, speed, lift, radius, rough, tones, invert, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--facet-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
