import { useEffect, useRef } from "react";

export interface TruchetBackgroundProps {
  /** Tamaño de cada azulejo (px) */
  size?: number;
  /** Grosor de las bandas, como fracción del azulejo */
  band?: number;
  /** Alcance del puntero (px): los azulejos que toca giran 90° y se quedan */
  radius?: number;
  /** Giros espontáneos por segundo (permanentes) */
  idle?: number;
  /** Opacidad de las bandas (0-1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

export default function TruchetBackground({
  size = 36,
  band = 0.17,
  radius = 20,
  idle = 12,
  alpha = 0.1,
  color,
  className,
}: TruchetBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let base = new Uint8Array(0);
    let shown = new Float32Array(0);
    let lastX = -1;
    let lastY = -1;
    let frame = 0;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / size) + 1;
      rows = Math.ceil(h / size) + 1;
      const n = cols * rows;
      base = new Uint8Array(n).map(() => (Math.random() < 0.5 ? 0 : 1));
      shown = new Float32Array(n);
      for (let i = 0; i < n; i++) shown[i] = base[i];
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const x0 = lastX < 0 ? x : lastX;
      const y0 = lastY < 0 ? y : lastY;
      lastX = x;
      lastY = y;
      const sx = x - x0;
      const sy = y - y0;
      const len2 = sx * sx + sy * sy;
      const c0 = Math.max(0, Math.floor((Math.min(x, x0) - radius) / size));
      const c1 = Math.min(cols - 1, Math.ceil((Math.max(x, x0) + radius) / size));
      const r0 = Math.max(0, Math.floor((Math.min(y, y0) - radius) / size));
      const r1 = Math.min(rows - 1, Math.ceil((Math.max(y, y0) + radius) / size));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const cx = (c + 0.5) * size;
          const cy = (r + 0.5) * size;
          const t = len2 > 0 ? Math.min(1, Math.max(0, ((cx - x0) * sx + (cy - y0) * sy) / len2)) : 0;
          const d = Math.hypot(cx - (x0 + t * sx), cy - (y0 + t * sy));
          if (d < radius) {
            const i = r * cols + c;
            base[i] = 1 - base[i];
          }
        }
      }
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      if (frame++ % 2 === 1) return;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--truchet-color").trim() || style.color;
      const k = style.getPropertyValue("--truchet-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.lineWidth = size * band;
      ctx!.lineCap = "butt";

      const spont = idle / 30;
      for (let n = Math.floor(spont) + (Math.random() < spont % 1 ? 1 : 0); n > 0; n--) {
        const i = Math.floor(Math.random() * base.length);
        base[i] = 1 - base[i];
      }

      const half = size / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          shown[i] += (base[i] - shown[i]) * 0.18;
          const s = shown[i];
          const ang = s * (Math.PI / 2);
          const cs = Math.cos(ang);
          const sn = Math.sin(ang);
          ctx!.setTransform(cs, sn, -sn, cs, (c + 0.5) * size, (r + 0.5) * size);
          ctx!.beginPath();
          ctx!.arc(-half, -half, half, 0, Math.PI / 2);
          ctx!.moveTo(0, half);
          ctx!.arc(half, half, half, Math.PI, Math.PI * 1.5);
          ctx!.globalAlpha = Math.min(1, alpha * mul * (1 + 0.9 * Math.sin(Math.PI * Math.min(1, s))));
          ctx!.stroke();
        }
      }
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
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
  }, [size, band, radius, idle, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--truchet-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}