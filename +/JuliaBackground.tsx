import { useEffect, useRef } from "react";

export interface JuliaBackgroundProps {
  /** Iteraciones máximas por punto: más iteraciones, bordes más finos y más costosos */
  iterations?: number;
  /** Píxeles de pantalla por cada muestra del cálculo (más alto, más rápido y menos definido) */
  scale?: number;
  /** Zoom de la vista (1 muestra el plano complejo de -1.6 a 1.6 en horizontal) */
  zoom?: number;
  /** Densidad de las líneas de nivel (curvas de igual velocidad de escape) */
  lines?: number;
  /** Finura de las líneas de nivel (1 = anchas y suaves, 12 = finas) */
  sharpness?: number;
  /** Opacidad del relleno del conjunto de Julia (0 = solo líneas) */
  fill?: number;
  /** Suavizado con el que el parámetro del fractal sigue al puntero */
  ease?: number;
  /** Opacidad general (0-1) */
  opacity?: number;
  color?: string;
  background?: string;
  className?: string;
}

function parseColor(color: string): [number, number, number] {
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.fillStyle = color;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

const LN2 = Math.LN2;

export default function JuliaBackground({
  iterations = 48,
  scale = 4,
  zoom = 1,
  lines = 0.8,
  sharpness = 6,
  fill = 0.1,
  ease = 0.06,
  opacity = 0.7,
  color = "#2f3e5c",
  background = "#e0dad5",
  className,
}: JuliaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    const [cr0, cg0, cb0] = parseColor(color);

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let img: ImageData | null = null;
    // Parámetro c del conjunto de Julia z → z² + c, y su objetivo (el puntero)
    let cr = 0.7885;
    let ci = 0;
    let tr = 0.7885;
    let ti = 0;
    let pointer = false;
    let rendered = false;
    let lastR = 0;
    let lastI = 0;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.max(8, Math.ceil(width / scale));
      rows = Math.max(8, Math.ceil(height / scale));
      off.width = cols;
      off.height = rows;
      rendered = false;
      img = octx!.createImageData(cols, rows);
      for (let i = 0; i < cols * rows; i++) {
        img.data[4 * i] = cr0;
        img.data[4 * i + 1] = cg0;
        img.data[4 * i + 2] = cb0;
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (clientX - rect.left) / width));
      const ny = Math.min(1, Math.max(0, (clientY - rect.top) / height));
      // El puntero recorre la zona del plano de parámetros donde los conjuntos de Julia son más interesantes
      tr = -1.0 + 1.3 * nx;
      ti = -0.75 + 1.5 * ny;
      pointer = true;
    }

    function render() {
      const d = img!.data;
      const wc = 3.2 / zoom;
      const hc = (wc * rows) / cols;
      const x0 = -wc / 2;
      const y0 = -hc / 2;
      const dx = wc / cols;
      const dy = hc / rows;
      const freq = lines * Math.PI;
      for (let j = 0; j < rows; j++) {
        const zi0 = y0 + j * dy;
        for (let i = 0; i < cols; i++) {
          let zr = x0 + i * dx;
          let zi = zi0;
          let x2 = zr * zr;
          let y2 = zi * zi;
          let n = 0;
          while (n < iterations && x2 + y2 <= 256) {
            zi = 2 * zr * zi + ci;
            zr = x2 - y2 + cr;
            x2 = zr * zr;
            y2 = zi * zi;
            n++;
          }
          let a: number;
          if (n >= iterations) {
            a = fill;
          } else {
            // Iteración continua: líneas de nivel suaves, más tenues cuanto más tardan en escapar
            const nu = n + 1 - Math.log(Math.log(x2 + y2) / 2 / LN2) / LN2;
            a = Math.pow(0.5 + 0.5 * Math.cos(nu * freq), sharpness) * Math.exp(-nu * 0.05);
          }
          d[4 * (j * cols + i) + 3] = a * opacity * 255;
        }
      }
    }

    function animate(time: number) {
      if (!pointer) {
        // En reposo el parámetro recorre una circunferencia de radio 0.7885, donde el conjunto cambia de forma sin romperse
        const a = time * 0.00015;
        tr = 0.7885 * Math.cos(a);
        ti = 0.7885 * Math.sin(a);
      }
      cr += (tr - cr) * ease;
      ci += (ti - ci) * ease;

      // Si el parámetro apenas ha cambiado (puntero quieto) la imagen sería la misma: no se recalcula
      if (!rendered || Math.abs(cr - lastR) + Math.abs(ci - lastI) > 2e-5) {
        render();
        octx!.putImageData(img!, 0, 0);
        ctx!.clearRect(0, 0, width, height);
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = "high";
        ctx!.drawImage(off, 0, 0, cols, rows, 0, 0, width, height);
        lastR = cr;
        lastI = ci;
        rendered = true;
      }

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
  }, [iterations, scale, zoom, lines, sharpness, fill, ease, opacity, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
