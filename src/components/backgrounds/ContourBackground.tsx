import { useEffect, useRef } from "react";

export interface ContourBackgroundProps {
  /** Tamaño de celda de la rejilla (px) */
  cell?: number;
  /** Separación entre isolíneas */
  spacing?: number;
  /** Cada cuántas líneas se dibuja una "índice" más marcada */
  indexEvery?: number;
  /** Fuerza del abultamiento bajo el puntero */
  lift?: number;
  /** Radio del abultamiento (px) */
  radius?: number;
  /** Velocidad de evolución del campo */
  flow?: number;
  /** Opacidad de las líneas */
  alpha?: number;
  /** Grosor del trazo */
  lineWidth?: number;
  /** Color de las líneas */
  color?: string;
  /** Color de fondo */
  background?: string;
  className?: string;
}

/**
 * Marching squares: empuja los segmentos de una isolínea a `out` como pares
 * de puntos (x1, y1, x2, y2) según los valores `a, b, c, d` de las esquinas.
 */
function marchingSquares(
  out: number[],
  cell: number,
  x: number,
  y: number,
  a: number,
  b: number,
  c: number,
  d: number,
  level: number
) {
  const idx =
    (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
  if (idx === 0 || idx === 15) return;

  const x1 = x + cell;
  const y1 = y + cell;
  const top = x + (cell * (level - a)) / (b - a);
  const right = y + (cell * (level - b)) / (c - b);
  const bottom = x + (cell * (level - d)) / (c - d);
  const left = y + (cell * (level - a)) / (d - a);

  switch (idx) {
    case 1:
    case 14:
      out.push(x, left, bottom, y1);
      break;
    case 2:
    case 13:
      out.push(bottom, y1, x1, right);
      break;
    case 3:
    case 12:
      out.push(x, left, x1, right);
      break;
    case 4:
    case 11:
      out.push(top, y, x1, right);
      break;
    case 6:
    case 9:
      out.push(top, y, bottom, y1);
      break;
    case 7:
    case 8:
      out.push(top, y, x, left);
      break;
    case 5:
      out.push(top, y, x, left, bottom, y1, x1, right);
      break;
    case 10:
      out.push(top, y, x1, right, x, left, bottom, y1);
      break;
  }
}

export default function ContourBackground({
  cell = 14,
  spacing = 0.22,
  indexEvery = 5,
  lift = 1.1,
  radius = 220,
  flow = 1,
  alpha = 0.16,
  lineWidth = 1,
  color = "#000000",
  background = "#e0dad5",
  className,
}: ContourBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);
    let hasPointer = false;
    let pointerX = 0;
    let pointerY = 0;
    let centerX = 0;
    let centerY = 0;
    let liftAmount = 0;
    let raf = 0;
    const regular: number[] = [];
    const index: number[] = [];

    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const noise = (x: number, y: number, t: number) =>
      Math.sin(x * 0.007 + t * 0.00021 * flow) * Math.cos(y * 0.006 - t * 0.00017 * flow) +
      0.5 * Math.sin((x + y) * 0.0045 + t * 0.0003 * flow) +
      0.35 * Math.sin(x * 0.013 - y * 0.011 - t * 0.00026 * flow);

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
      field = new Float32Array((cols + 1) * (rows + 1));
      centerX = width / 2;
      centerY = height / 2;
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      pointerX = clientX - rect.left;
      pointerY = clientY - rect.top;
      if (!hasPointer) {
        centerX = pointerX;
        centerY = pointerY;
      }
      hasPointer = true;
    }

    function stroke(segments: number[]) {
      ctx!.beginPath();
      for (let i = 0; i < segments.length; i += 4) {
        ctx!.moveTo(segments[i], segments[i + 1]);
        ctx!.lineTo(segments[i + 2], segments[i + 3]);
      }
      ctx!.stroke();
    }

    function animate(t: number) {
      ctx!.clearRect(0, 0, width, height);
      centerX += (pointerX - centerX) * 0.08;
      centerY += (pointerY - centerY) * 0.08;
      liftAmount += ((hasPointer ? lift : 0) - liftAmount) * 0.03;

      const radius2 = radius * radius;
      const stride = cols + 1;
      for (let row = 0; row <= rows; row++) {
        const ry = row * cell;
        for (let col = 0; col <= cols; col++) {
          const cx = col * cell;
          const dx = cx - centerX;
          const dy = ry - centerY;
          field[row * stride + col] =
            noise(cx, ry, t) + liftAmount * Math.exp(-(dx * dx + dy * dy) / radius2);
        }
      }

      regular.length = 0;
      index.length = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const a = field[row * stride + col];
          const b = field[row * stride + col + 1];
          const c = field[(row + 1) * stride + col + 1];
          const d = field[(row + 1) * stride + col];
          const lo = Math.min(a, b, c, d);
          const hi = Math.max(a, b, c, d);
          for (let level = Math.ceil(lo / spacing); level <= Math.floor(hi / spacing); level++) {
            const isIndex = ((level % indexEvery) + indexEvery) % indexEvery === 0;
            marchingSquares(
              isIndex ? index : regular,
              cell,
              col * cell,
              row * cell,
              a,
              b,
              c,
              d,
              level * spacing
            );
          }
        }
      }

      ctx!.strokeStyle = color;
      ctx!.lineCap = "round";
      ctx!.lineWidth = lineWidth;
      ctx!.globalAlpha = clamp(alpha);
      stroke(regular);
      ctx!.lineWidth = lineWidth * 1.4;
      ctx!.globalAlpha = clamp(alpha * 1.9);
      stroke(index);
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => setPointer(e.touches[0].clientX, e.touches[0].clientY);
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
  }, [cell, spacing, indexEvery, lift, radius, flow, alpha, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
