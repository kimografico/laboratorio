import { useEffect, useRef } from "react";

export interface KaleidoscopeBackgroundProps {
  /** Número de sectores del caleidoscopio */
  slices?: number;
  /** Velocidad de giro de la simetría (rad/s) */
  rotation?: number;
  /** Vida de cada trazo (s) */
  life?: number;
  /** Grosor del trazo (px) */
  width?: number;
  /** Opacidad base de los trazos (0-1) */
  alpha?: number;
  /** Refleja cada sector en lugar de repetirlo (verdadero caleidoscopio) */
  mirror?: boolean;
  color?: string;
  className?: string;
}

type Pt = { x: number; y: number; age: number };

export default function KaleidoscopeBackground({
  slices = 10,
  rotation = 0.1,
  life = 3.5,
  width = 0.5,
  alpha = 0.5,
  mirror = true,
  color,
  className,
}: KaleidoscopeBackgroundProps) {
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
    let points: Pt[] = [];
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let hasPointer = false;
    let idle = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      px = tx = w / 2;
      py = ty = h / 2;
      points = [];
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      hasPointer = true;
      idle = 0;
    }

    function animate(time: number) {
      const t = time / 1000;
      const dt = last < 0 ? 0.0167 : Math.min((time - last) / 1000, 0.05);
      last = time;
      idle += dt;

      if (!hasPointer || idle > 2.5) {
        tx = w / 2 + Math.sin(t * 0.51) * w * 0.3;
        ty = h / 2 + Math.sin(t * 0.77 + 1.3) * h * 0.27;
      }
      px += (tx - px) * Math.min(1, dt * 14);
      py += (ty - py) * Math.min(1, dt * 14);

      const step = Math.max(3, Math.min(w, h) * 0.006);
      const prev = points[points.length - 1];
      if (!prev || Math.hypot(px - prev.x, py - prev.y) > step) {
        points.push({ x: px, y: py, age: 0 });
        const cap = Math.ceil(life * 70) + 40;
        while (points.length > cap) points.shift();
      }
      for (let i = points.length - 1; i >= 0; i--) {
        points[i].age += dt;
        if (points[i].age > life) points.splice(i, 1);
      }

      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--kaleidoscope-color").trim() || style.color;
      const k = style.getPropertyValue("--kaleidoscope-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      const cx = w / 2;
      const cy = h / 2;
      const base = t * rotation;
      const copies = mirror ? slices * 2 : slices;
      const buckets = 6;
      const paths: { a: number; cmds: number[][] }[] = [];
      for (let b = 0; b < buckets; b++) paths.push({ a: 0, cmds: [] });

      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const av = 1 - (p0.age + p1.age) / (2 * life);
        if (av <= 0.02) continue;
        const b = Math.min(buckets - 1, Math.floor(av * buckets));
        const d0x = p0.x - cx;
        const d0y = p0.y - cy;
        const d1x = p1.x - cx;
        const d1y = p1.y - cy;
        for (let s = 0; s < copies; s++) {
          const sector = Math.floor(s / 2);
          const ang = base + sector * ((Math.PI * 2) / slices);
          const flip = mirror && s % 2 === 1 ? -1 : 1;
          const cos = Math.cos(ang);
          const sin = Math.sin(ang);
          const ax = d0x * cos - d0y * flip * sin;
          const ay = d0x * sin + d0y * flip * cos;
          const bx = d1x * cos - d1y * flip * sin;
          const by = d1x * sin + d1y * flip * cos;
          paths[b].cmds.push([cx + ax, cy + ay, cx + bx, cy + by]);
        }
      }

      ctx!.strokeStyle = ink;
      ctx!.lineWidth = width;
      ctx!.lineCap = "round";
      for (let b = 0; b < buckets; b++) {
        const bucket = paths[b];
        if (!bucket.cmds.length) continue;
        bucket.a = ((b + 0.5) / buckets) * alpha * mul;
        ctx!.globalAlpha = bucket.a;
        ctx!.beginPath();
        for (const [x0, y0, x1, y1] of bucket.cmds) {
          ctx!.moveTo(x0, y0);
          ctx!.lineTo(x1, y1);
        }
        ctx!.stroke();
      }

      ctx!.globalAlpha = alpha * mul * 0.12;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      for (let s = 0; s < slices; s++) {
        const ang = base + s * ((Math.PI * 2) / slices);
        ctx!.moveTo(cx, cy);
        ctx!.lineTo(cx + Math.cos(ang) * Math.max(w, h), cy + Math.sin(ang) * Math.max(w, h));
      }
      ctx!.stroke();
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
  }, [slices, rotation, life, width, alpha, mirror]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--kaleidoscope-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
