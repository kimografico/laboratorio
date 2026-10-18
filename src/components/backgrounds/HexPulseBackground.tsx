import { useEffect, useRef } from "react";

export interface HexPulseBackgroundProps {
  /** Radio de cada celda hexagonal (px) */
  size?: number;
  /** Fuentes de onda autónomas */
  sources?: number;
  /** Velocidad de las ondas */
  speed?: number;
  /** Grosor del contorno (px) */
  width?: number;
  /** Intensidad del encendido (0 = solo contorno) */
  glow?: number;
  /** Opacidad general (0-1) */
  alpha?: number;
  color?: string;
  className?: string;
}

export default function HexPulseBackground({
  size = 34,
  sources = 2,
  speed = 1,
  width = 1,
  glow = 0.5,
  alpha = 0.35,
  color,
  className,
}: HexPulseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = -1;
    let count = 0;
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let buckets = new Uint8Array(0);
    let src: { fx: number; fy: number; ph: number; sf: number }[] = [];
    let hasPointer = false;
    let tx = 0;
    let ty = 0;
    let sx = 0;
    let sy = 0;
    let idle = 0;
    let pAmp = 0;
    let travel = 0;
    let lastX = -1e4;
    let lastY = -1e4;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const dx = Math.sqrt(3) * size;
      const dy = size * 1.5;
      const cols = Math.ceil(w / dx) + 2;
      const rows = Math.ceil(h / dy) + 2;
      count = cols * rows;
      xs = new Float32Array(count);
      ys = new Float32Array(count);
      buckets = new Uint8Array(count);
      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          xs[i] = c * dx + (r % 2 ? dx / 2 : 0) - dx / 2;
          ys[i] = r * dy - dy / 2;
          i++;
        }
      }
      src = Array.from({ length: sources }, (_, s) => ({
        fx: 0.15 + ((s * 0.37) % 0.7),
        fy: 0.2 + ((s * 0.53) % 0.6),
        ph: s * 2.1,
        sf: 0.8 + (s % 3) * 0.25,
      }));
      sx = w / 2;
      sy = h / 2;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      travel += Math.hypot(x - lastX, y - lastY);
      lastX = x;
      lastY = y;
      tx = x;
      ty = y;
      if (!hasPointer) {
        sx = tx;
        sy = ty;
      }
      hasPointer = true;
      idle = 0;
    }

    function animate(time: number) {
      const t = time / 1000;
      const dt = last < 0 ? 0.0167 : Math.min((time - last) / 1000, 0.05);
      last = time;
      idle += dt;

      sx += (tx - sx) * Math.min(1, dt * 6);
      sy += (ty - sy) * Math.min(1, dt * 6);

      const k = (Math.PI * 2) / (size * 4);
      const omega = Math.PI * 2 * 0.55 * speed;
      const pTarget = hasPointer && idle < 3 ? 1 : 0;
      pAmp += (pTarget - pAmp) * Math.min(1, dt * 3);
      const pa = pAmp;

      const origins: { x: number; y: number; ph: number; amp: number }[] = [];
      for (let s = 0; s < src.length; s++) {
        const o = src[s];
        origins.push({
          x: w * o.fx + Math.sin(t * 0.09 * o.sf + o.ph) * w * 0.1,
          y: h * o.fy + Math.cos(t * 0.07 * o.sf + o.ph * 1.3) * h * 0.1,
          ph: o.ph,
          amp: 1,
        });
      }
      if (pa > 0.01) origins.push({ x: sx, y: sy, ph: travel * 0.02, amp: pa * 1.4 });

      const total = Math.max(1, origins.length);
      for (let i = 0; i < count; i++) {
        const x = xs[i];
        const y = ys[i];
        let v = 0;
        for (const o of origins) {
          const d = Math.hypot(x - o.x, y - o.y);
          const decay = 1 / (1 + d / (h * 0.9));
          v += Math.cos(d * k - t * omega + o.ph) * decay * o.amp;
        }
        v /= total;
        const g = v > 0 ? Math.pow(v, 1.2) : 0;
        buckets[i] = Math.min(4, Math.floor(g * 5));
      }

      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--hex-color").trim() || style.color;
      const kOp = style.getPropertyValue("--hex-opacity").trim();
      const mul = kOp !== "" && Number.isFinite(Number(kOp)) ? Number(kOp) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";

      for (let b = 0; b < 5; b++) {
        let any = false;
        ctx!.beginPath();
        for (let i = 0; i < count; i++) {
          if (buckets[i] !== b) continue;
          any = true;
          const x = xs[i];
          const y = ys[i];
          for (let j = 0; j < 6; j++) {
            const ang = -Math.PI / 2 + (j * Math.PI) / 3;
            const vx = x + Math.cos(ang) * size;
            const vy = y + Math.sin(ang) * size;
            if (j === 0) ctx!.moveTo(vx, vy);
            else ctx!.lineTo(vx, vy);
          }
          ctx!.closePath();
        }
        if (!any) continue;
        const g = (b + 0.5) / 5;
        ctx!.globalAlpha = alpha * mul * (0.25 + 0.75 * g);
        ctx!.lineWidth = width * (1 + 0.7 * g);
        ctx!.stroke();
        if (glow > 0) {
          ctx!.globalAlpha = alpha * mul * glow * 0.28 * g;
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
  }, [size, sources, speed, width, glow, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--hex-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
