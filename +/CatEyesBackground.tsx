import { useEffect, useRef } from "react";

export interface CatEyesBackgroundProps {
  /** Número aproximado de parejas de ojos visibles en una pantalla de 1440×900 */
  pairs?: number;
  /** Separación mínima entre parejas, en px */
  spacing?: number;
  /** Tamaño de cada ojo: ancho en px */
  eyeWidth?: number;
  /** Redondez del ojo (0-1; 0 = muy afilado, 1 = más redondeado) */
  roundness?: number;
  /** Distancia entre los centros de los dos ojos de una pareja, como múltiplo del ancho del ojo */
  pairGap?: number;
  /** Radio en el que una pareja empieza a abrirse al acercarse el puntero, en px */
  radius?: number;
  /** Opacidad máxima de los ojos (0-1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Pair = {
  x: number;
  y: number;
  scale: number;
  tilt: number;
  phase: number;
  open: number;
  clickOpen: number;
  lookX: number;
  lookY: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function CatEyesBackground({
  pairs = 60,
  spacing = 115,
  eyeWidth = 34,
  roundness = 0.45,
  pairGap = 1.28,
  radius = 230,
  alpha = 0.28,
  color,
  className,
}: CatEyesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let w = 0, h = 0, px = -9999, py = -9999, raf = 0;
    let hasPointer = false;
    let pointerDown = false;
    let eyes: Pair[] = [];

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;

      const target = Math.max(1, Math.round(pairs * (w * h) / (1440 * 900)));
      const next: Pair[] = [];
      const margin = eyeWidth * 2.4;
      const minD = Math.max(spacing, eyeWidth * pairGap * 2.4);
      let attempts = 0;

      while (next.length < target && attempts++ < target * 80) {
        const x = margin + Math.random() * Math.max(1, w - margin * 2);
        const y = margin + Math.random() * Math.max(1, h - margin * 2);
        if (next.some((p) => Math.hypot(p.x - x, p.y - y) < minD)) continue;
        next.push({
          x, y,
          scale: 0.82 + Math.random() * 0.34,
          tilt: (Math.random() - 0.5) * 0.16,
          phase: Math.random() * Math.PI * 2,
          open: 0,
          clickOpen: 0,
          lookX: 0,
          lookY: 0,
        });
      }
      eyes = next;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      hasPointer = true;
    }

    function onDown() { pointerDown = true; }
    function onUp() { pointerDown = false; }

    const setAlpha = (v: number) => (ctx.globalAlpha = clamp(v, 0, 1));

    function almondPath(cx: number, cy: number, ew: number, eh: number) {
      const left = cx - ew / 2, right = cx + ew / 2;
      const shoulder = 0.14 + roundness * 0.20;
      const bulge = 0.52 + roundness * 0.38;
      ctx.moveTo(left, cy);
      ctx.bezierCurveTo(cx - ew * shoulder, cy - eh * bulge, cx + ew * shoulder, cy - eh * bulge, right, cy);
      ctx.bezierCurveTo(cx + ew * shoulder, cy + eh * bulge, cx - ew * shoulder, cy + eh * bulge, left, cy);
      ctx.closePath();
    }

    function drawEye(cx: number, cy: number, ew: number, openness: number, lx: number, ly: number, ink: string, tilt: number) {
      if (openness < 0.012) return;
      const eh = ew * 0.48 * openness;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(tilt); ctx.translate(-cx, -cy);
      ctx.beginPath();
      almondPath(cx, cy, ew, eh);
      ctx.clip();

      // El ojo usa la tinta como silueta; el interior se vacía para que siga funcionando sobre cualquier fondo.
      ctx.fillStyle = ink;
      ctx.fillRect(cx - ew, cy - ew, ew * 2, ew * 2);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      almondPath(cx, cy, ew * 0.91, eh * 0.76);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      const travel = ew * 0.3;
      const pupilX = cx + lx * travel;
      const pupilY = cy + ly * Math.min(travel * 0.7, eh * 0.18);
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.ellipse(pupilX, pupilY, Math.max(1, ew * 0.055), Math.max(1.5, eh * 0.34), -tilt, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--cat-eyes-color").trim() || style.color;
      const k = style.getPropertyValue("--cat-eyes-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      const globalClick = pointerDown;

      for (const pair of eyes) {
        const dx = px - pair.x, dy = py - pair.y;
        const d = hasPointer ? Math.hypot(dx, dy) : Infinity;
        const proximity = clamp(1 - d / Math.max(1, radius), 0, 1);
        // La curva cuadrática mantiene los ojos prácticamente invisibles en el borde del radio.
        const target = globalClick ? 1 : proximity * proximity;
        pair.open = pair.open * 0.6 + target * 0.4;
        pair.clickOpen = globalClick ? 1 : pair.clickOpen * 0.88;
        const shown = Math.max(pair.open, pair.clickOpen);

        const len = Math.hypot(dx, dy) || 1;
        const tx = hasPointer ? clamp(dx / len, -1, 1) : 0;
        const ty = hasPointer ? clamp(dy / len, -1, 1) : 0;
        pair.lookX += (tx - pair.lookX) * 0.12;
        pair.lookY += (ty - pair.lookY) * 0.12;

        if (shown < 0.012) continue;
        const ew = eyeWidth * pair.scale;
        const gap = ew * pairGap;
        const ambient = 0.96 + Math.sin(time * 0.00045 + pair.phase) * 0.04;
        setAlpha(alpha * mul * shown * ambient);
        ctx.save();
        ctx.translate(pair.x, pair.y);
        drawEye(-gap / 2, 0, ew, shown, pair.lookX, pair.lookY, ink, pair.tilt);
        drawEye(gap / 2, 0, ew, shown, pair.lookX, pair.lookY, ink, pair.tilt);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onPointer(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchend", onUp);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchend", onUp);
    };
  }, [pairs, spacing, eyeWidth, roundness, pairGap, radius, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--cat-eyes-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
