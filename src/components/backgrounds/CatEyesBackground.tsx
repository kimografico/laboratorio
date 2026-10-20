import { useEffect, useRef } from "react";

export interface CatEyesBackgroundProps {
  /** Densidad: número objetivo de parejas, limitado por el espacio disponible según el tamaño de los ojos */
  pairs?: number;
  /** Separación mínima entre parejas, en px (por defecto 30) */
  spacing?: number;
  /** Tamaño de cada ojo: ancho en px */
  eyeWidth?: number;
  /** Apertura de los ojos: multiplica la altura base (1 = normal) */
  eyeOpenness?: number;
  /** Redondez del ojo (0-1.5; 0 = muy afilado, 1.5 = más redondeado) */
  roundness?: number;
  /** Distancia entre los centros de los dos ojos de una pareja, como múltiplo del ancho del ojo */
  pairGap?: number;
  /** Radio en el que una pareja empieza a abrirse al acercarse el puntero, en px */
  radius?: number;
  /** Opacidad del globo y el borde (0-1); la pupila es siempre opaca */
  alpha?: number;
  /** Opcional: color del globo ocular. Por defecto: fondo en tema claro, blanco en oscuro */
  eyeColor?: string;
  /** Opcional: color del globo ocular; `eyeColor` tiene prioridad. El borde siempre es negro */
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
  lookLX: number;
  lookLY: number;
  lookRX: number;
  lookRY: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const PUPIL_INK = "#000000";
const CONTOUR_INK = "#000000";

function parseRgb(input: string): [number, number, number] | null {
  const value = input.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (rgb) {
    const parts = rgb[1].split(/[,/\s]+/).map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      return [parts[0], parts[1], parts[2]];
    }
  }
  return null;
}

function isLightColor(input: string): boolean {
  const rgb = parseRgb(input);
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;
}

export default function CatEyesBackground({
  pairs = 12,
  spacing = 30,
  eyeWidth = 45,
  eyeOpenness = 1,
  roundness = 1,
  pairGap = 1.5,
  radius = 80,
  alpha = 0.47,
  eyeColor,
  color,
  className,
}: CatEyesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
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

      const next: Pair[] = [];
      const margin = eyeWidth * 2.4;
      const minD = Math.max(spacing, eyeWidth * pairGap * 2.4);
      // Capacidad aproximada según el tamaño de los ojos: la densidad nunca supera lo que cabe.
      const cols = Math.max(1, Math.floor(Math.max(1, w - margin * 2) / minD));
      const rows = Math.max(1, Math.floor(Math.max(1, h - margin * 2) / minD));
      const capacity = cols * rows;
      const target = Math.min(capacity, Math.max(1, Math.round(pairs)));
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
          lookLX: 0,
          lookLY: 0,
          lookRX: 0,
          lookRY: 0,
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

    function drawEye(cx: number, cy: number, ew: number, openness: number, lx: number, ly: number, contourInk: string, eyeInk: string, dilation: number, tilt: number) {
      if (openness < 0.012) return;
      const eh = ew * 0.48 * eyeOpenness * openness;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(tilt); ctx.translate(-cx, -cy);
      ctx.beginPath();
      almondPath(cx, cy, ew, eh);
      ctx.clip();

      // El borde se pinta primero; el globo ocular cubre el interior y la pupila queda siempre negra.
      ctx.fillStyle = contourInk;
      ctx.fillRect(cx - ew, cy - ew, ew * 2, ew * 2);
      ctx.beginPath();
      almondPath(cx, cy, ew * 0.91, eh * 0.76);
      ctx.fillStyle = eyeInk;
      ctx.fill();

      const travel = ew * 0.3;
      const pupilX = cx + lx * travel;
      const pupilY = cy + ly * Math.min(travel * 0.7, eh * 0.18);
      const baseRx = Math.max(1, ew * 0.07);
      const baseRy = Math.max(1.8, eh * 0.40);
      // Al acercar mucho el puntero, la pupila se ensancha hasta hacerse redonda y crece.
      const pupilRy = baseRy * (1 + 0.3 * dilation);
      const pupilRx = baseRx + (pupilRy - baseRx) * dilation;
      ctx.globalAlpha = 1;
      ctx.fillStyle = PUPIL_INK;
      ctx.beginPath();
      ctx.ellipse(pupilX, pupilY, pupilRx, pupilRy, -tilt, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, w, h);
      const background = style.getPropertyValue("--panel").trim() || style.backgroundColor || "#141416";
      const light = isLightColor(background);
      const baseInk = style.getPropertyValue("--cat-eyes-color").trim();
      const eyeInk =
        style.getPropertyValue("--cat-eyes-eye-color").trim() || baseInk || (light ? background : "#ffffff");
      const contourInk = CONTOUR_INK;
      const k = style.getPropertyValue("--cat-eyes-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      const globalClick = pointerDown;

      for (const pair of eyes) {
        const ew = eyeWidth * pair.scale;
        const gap = ew * pairGap;
        const dx = px - pair.x, dy = py - pair.y;
        const d = hasPointer ? Math.hypot(dx, dy) : Infinity;
        const proximity = clamp(1 - d / Math.max(1, radius), 0, 1);
        // La dilatación solo ocurre con el botón pulsado y en la zona más cercana al puntero.
        const near = clamp((proximity - 0.55) / 0.45, 0, 1);
        const dilation = pointerDown ? near * near * (3 - 2 * near) : 0;
        // Curva de apertura con gamma < 1: los ojos empiezan a abrirse antes dentro del radio.
        const target = globalClick ? 1 : Math.pow(proximity, 0.55);
        pair.open = pair.open * 0.6 + target * 0.4;
        pair.clickOpen = globalClick ? 1 : pair.clickOpen * 0.88;
        const shown = Math.max(pair.open, pair.clickOpen);

        // Cada pupila mira al puntero desde el centro de su propio ojo; si el puntero cae entre
        // ambos, las dos pupilas convergen y el gato puede bizquear.
        const leftDx = px - (pair.x - gap / 2);
        const rightDx = px - (pair.x + gap / 2);
        const leftLen = Math.hypot(leftDx, dy) || 1;
        const rightLen = Math.hypot(rightDx, dy) || 1;
        const txL = hasPointer ? clamp(leftDx / leftLen, -1, 1) : 0;
        const txR = hasPointer ? clamp(rightDx / rightLen, -1, 1) : 0;
        const tyL = hasPointer ? clamp(dy / leftLen, -1, 1) : 0;
        const tyR = hasPointer ? clamp(dy / rightLen, -1, 1) : 0;
        pair.lookLX += (txL - pair.lookLX) * 0.12;
        pair.lookLY += (tyL - pair.lookLY) * 0.12;
        pair.lookRX += (txR - pair.lookRX) * 0.12;
        pair.lookRY += (tyR - pair.lookRY) * 0.12;

        if (shown < 0.012) continue;
        const ambient = 0.96 + Math.sin(time * 0.00045 + pair.phase) * 0.04;
        setAlpha(alpha * mul * shown * ambient);
        ctx.save();
        ctx.translate(pair.x, pair.y);
        drawEye(-gap / 2, 0, ew, shown, pair.lookLX, pair.lookLY, contourInk, eyeInk, dilation, pair.tilt);
        drawEye(gap / 2, 0, ew, shown, pair.lookRX, pair.lookRY, contourInk, eyeInk, dilation, pair.tilt);
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
  }, [pairs, spacing, eyeWidth, eyeOpenness, roundness, pairGap, radius, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={
        color || eyeColor
          ? ({
              ...(color ? { "--cat-eyes-color": color } : {}),
              ...(eyeColor ? { "--cat-eyes-eye-color": eyeColor } : {}),
            } as React.CSSProperties)
          : undefined
      }
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
