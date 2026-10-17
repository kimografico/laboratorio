import { useEffect, useRef } from "react";

export interface SnowflakeBackgroundProps {
  /** Copos que crecen a la vez */
  count?: number;
  /** Radio del copo (px) */
  size?: number;
  /** Velocidad de crecimiento (el puntero lo acelera) */
  growth?: number;
  /** Tendencia a ramificar */
  branch?: number;
  /** Grosor del trazo (px) */
  width?: number;
  /** Opacidad general (0-1) */
  alpha?: number;
  color?: string;
  className?: string;
}

type Tip = { x: number; y: number; a: number; dist: number; depth: number };
type Crystal = {
  cx: number;
  cy: number;
  rot: number;
  segs: number[];
  tips: Tip[];
  phase: number;
  timer: number;
  env: number;
};

export default function SnowflakeBackground({
  count = 3,
  size = 200,
  growth = 2.5,
  branch = 0.6,
  width = 1.2,
  alpha = 0.5,
  color,
  className,
}: SnowflakeBackgroundProps) {
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
    let list: Crystal[] = [];
    let hasPointer = false;
    let sx = 0;
    let sy = 0;

    function makeCrystal(): Crystal {
      return {
        cx: w * (0.18 + Math.random() * 0.64),
        cy: h * (0.2 + Math.random() * 0.6),
        rot: Math.random() * Math.PI,
        segs: [],
        tips: [{ x: 0, y: 0, a: 0, dist: 0, depth: 0 }],
        phase: 0,
        timer: 0,
        env: 0,
      };
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      list = Array.from({ length: count }, () => makeCrystal());
      sx = w / 2;
      sy = h / 2;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      sx = clientX - rect.left;
      sy = clientY - rect.top;
      hasPointer = true;
    }

    function killDist(depth: number) {
      if (depth === 0) return size * 0.5;
      if (depth === 1) return size * 0.36;
      return size * 0.2;
    }

    function extend(c: Crystal, tip: Tip, boost: number) {
      const len = size * 0.05 * (0.7 + Math.random() * 0.7) * (1 + 0.3 * boost);
      const nx = tip.x + Math.cos(tip.a) * len;
      const ny = tip.y + Math.sin(tip.a) * len;
      c.segs.push(tip.x, tip.y, nx, ny);
      tip.x = nx;
      tip.y = ny;
      tip.dist = Math.hypot(nx, ny);
      if (tip.dist >= killDist(tip.depth)) {
        tip.depth = -1;
        return;
      }
      if (tip.depth === 0 && Math.random() < branch * 0.5) {
        c.tips.push({ x: nx, y: ny, a: tip.a + Math.PI / 3, dist: tip.dist, depth: 1 });
      } else if (tip.depth === 1 && tip.dist < size * 0.34 && Math.random() < branch * 0.3) {
        c.tips.push({ x: nx, y: ny, a: tip.a - Math.PI / 3, dist: tip.dist, depth: 2 });
      }
    }

    function animate(time: number) {
      const t = time / 1000;
      const dt = last < 0 ? 0.0167 : Math.min((time - last) / 1000, 0.05);
      last = time;

      for (const c of list) {
        let boost = 0;
        if (hasPointer) {
          const d = Math.hypot(c.cx - sx, c.cy - sy);
          const R = size * 1.6;
          if (d < R) boost = 1 - d / R;
        }
        if (c.phase === 0) {
          c.timer += dt;
          c.env = Math.min(1, c.env + dt / 0.6);
          const p = growth * dt * 2.4 * (1 + 2 * boost);
          for (const tip of c.tips) {
            if (tip.depth < 0) continue;
            if (Math.random() < p) extend(c, tip, boost);
          }
          if (c.tips.every((tip) => tip.depth < 0)) {
            c.phase = 1;
            c.timer = 0;
          }
        } else {
          c.timer += dt;
          if (c.phase === 1 && c.timer > 1.8) {
            c.phase = 2;
            c.timer = 0;
          } else if (c.phase === 2) {
            c.env = Math.max(0, 1 - c.timer / 1.6);
            if (c.timer > 1.6) Object.assign(c, makeCrystal());
          }
        }
      }

      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--snow-color").trim() || style.color;
      const k = style.getPropertyValue("--snow-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.lineCap = "round";

      for (const c of list) {
        const env = c.env;
        if (env <= 0.01 || c.segs.length === 0) continue;
        ctx!.save();
        ctx!.translate(c.cx, c.cy);
        ctx!.rotate(c.rot + t * 0.015);
        ctx!.beginPath();
        for (let i = 0; i < c.segs.length; i += 4) {
          const x1 = c.segs[i];
          const y1 = c.segs[i + 1];
          const x2 = c.segs[i + 2];
          const y2 = c.segs[i + 3];
          for (let r = 0; r < 6; r++) {
            const ang = (r * Math.PI) / 3;
            const cos = Math.cos(ang);
            const sin = Math.sin(ang);
            for (let flip = 0; flip < 2; flip++) {
              const f = flip ? -1 : 1;
              ctx!.moveTo(x1 * cos - y1 * f * sin, x1 * sin + y1 * f * cos);
              ctx!.lineTo(x2 * cos - y2 * f * sin, x2 * sin + y2 * f * cos);
            }
          }
        }
        ctx!.lineWidth = width * 2.6;
        ctx!.globalAlpha = alpha * mul * env * 0.18;
        ctx!.stroke();
        ctx!.lineWidth = width;
        ctx!.globalAlpha = alpha * mul * env;
        ctx!.stroke();
        ctx!.restore();
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
  }, [count, size, growth, branch, width, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--snow-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
