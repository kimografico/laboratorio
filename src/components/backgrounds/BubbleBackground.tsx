import { useEffect, useRef } from "react";

export interface BubbleBackgroundProps {
  /** Número de burbujas */
  count?: number;
  /** Radio medio de una burbuja (px); cada una varía entre 0.3x y 1.6x */
  size?: number;
  /** Velocidad de ascenso (px por fotograma): las grandes suben más rápido */
  rise?: number;
  /** Distancia a la que el puntero las empuja, además de su radio (px) */
  reach?: number;
  /** Si el puntero las revienta al tocarlas (false = solo las empuja) */
  pop?: boolean;
  /** Opacidad del contorno (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color de las burbujas. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Bubble = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  wob: number; // amplitud del vaivén lateral
  dead: number; // fotogramas hasta volver a aparecer (0 = viva)
};
type Pop = { x: number; y: number; r: number; age: number };

const POP_LIFE = 26; // fotogramas que dura el reventón

export default function BubbleBackground({
  count = 70,
  size = 28,
  rise = 0.75,
  reach = 60,
  pop = true,
  alpha = 0.3,
  lineWidth = 1.2,
  color,
  className,
}: BubbleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let pvx = 0;
    let pvy = 0;
    let hasPointer = false;
    let bubbles: Bubble[] = [];
    let pops: Pop[] = [];
    let raf = 0;

    function spawn(b: Bubble, anywhere: boolean) {
      const u = Math.random();
      b.r = size * (0.3 + 1.3 * u * u); // muchas pequeñas, pocas grandes
      b.x = Math.random() * w;
      b.y = anywhere ? Math.random() * h : h + b.r * 2;
      b.vx = 0;
      b.vy = 0;
      b.phase = Math.random() * Math.PI * 2;
      b.wob = 0.15 + Math.random() * 0.35;
      b.dead = 0;
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      bubbles = Array.from({ length: count }, () => {
        const b = {} as Bubble;
        spawn(b, true);
        return b;
      }).sort((a, b) => a.r - b.r); // las pequeñas detrás
      pops = [];
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (hasPointer) {
        pvx = pvx * 0.5 + (x - px) * 0.5;
        pvy = pvy * 0.5 + (y - py) * 0.5;
      }
      px = x;
      py = y;
      hasPointer = true;
    }

    function update(b: Bubble, time: number) {
      if (b.dead > 0) {
        if (--b.dead === 0) spawn(b, false);
        return;
      }
      // Flotabilidad: las grandes suben más rápido; vaivén lateral lento, como en espiral
      const target = -rise * (0.35 + 0.65 * Math.sqrt(b.r / size));
      b.vy += (target - b.vy) * 0.03;
      b.vx += Math.sin(time * 0.0011 + b.phase) * 0.012 * b.wob;
      // El puntero las empuja y, si está activado, las revienta al tocarlas
      if (hasPointer) {
        const dx = b.x - px;
        const dy = b.y - py;
        const d = Math.hypot(dx, dy) || 1;
        const R = b.r + reach;
        if (d < R) {
          const f = Math.pow(1 - d / R, 1.5);
          b.vx += (dx / d) * f * 0.35 + pvx * f * 0.03;
          b.vy += (dy / d) * f * 0.3 + pvy * f * 0.03;
        }
        if (pop && d < b.r * 0.9 && Math.hypot(pvx, pvy) > 1.2) {
          pops.push({ x: b.x, y: b.y, r: b.r, age: 0 });
          b.dead = 60 + Math.floor(Math.random() * 90);
          return;
        }
      }
      b.vx *= 0.97;
      b.x += b.vx;
      b.y += b.vy;
      if (b.y < -b.r * 2) spawn(b, false); // al salir por arriba vuelve a nacer abajo
      if (b.x < -b.r * 2) b.x = w + b.r * 2;
      else if (b.x > w + b.r * 2) b.x = -b.r * 2;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function drawBubble(b: Bubble, a: number) {
      ctx!.lineWidth = lineWidth * (0.55 + 0.45 * Math.min(1, b.r / size));
      // Película: círculo con un relleno muy tenue
      ctx!.beginPath();
      ctx!.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      setAlpha(a * 0.1);
      ctx!.fill();
      setAlpha(a * 0.8);
      ctx!.stroke();
      // Brillos: un arco claro arriba a la izquierda y una gota pequeña, como el reflejo de una ventana
      ctx!.beginPath();
      ctx!.arc(b.x, b.y, b.r * 0.72, Math.PI * 1.08, Math.PI * 1.42);
      ctx!.lineWidth = lineWidth * 1.6 * (0.55 + 0.45 * Math.min(1, b.r / size));
      setAlpha(a);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.arc(b.x - b.r * 0.42, b.y - b.r * 0.5, Math.max(0.8, b.r * 0.06), 0, Math.PI * 2);
      ctx!.fill();
      // Reflejo opuesto, más tenue (abajo a la derecha)
      ctx!.beginPath();
      ctx!.arc(b.x, b.y, b.r * 0.72, Math.PI * 0.1, Math.PI * 0.28);
      ctx!.lineWidth = lineWidth * (0.55 + 0.45 * Math.min(1, b.r / size));
      setAlpha(a * 0.45);
      ctx!.stroke();
    }

    function drawPop(p: Pop, a: number) {
      const t = p.age / POP_LIFE;
      const e = 1 - Math.pow(1 - t, 2); // sale rápido y frena
      ctx!.lineWidth = lineWidth;
      // Gotitas: pequeños trazos radiales que salen despedidos
      ctx!.beginPath();
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2 + p.r;
        const r0 = p.r * (1 + 0.5 * e);
        const r1 = p.r * (1.12 + 1.0 * e);
        ctx!.moveTo(p.x + Math.cos(ang) * r0, p.y + Math.sin(ang) * r0);
        ctx!.lineTo(p.x + Math.cos(ang) * r1, p.y + Math.sin(ang) * r1);
      }
      setAlpha(a * (1 - t));
      ctx!.stroke();
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--bubble-color").trim() || style.color;
      const k = style.getPropertyValue("--bubble-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineCap = "round";
      pvx *= 0.9;
      pvy *= 0.9;
      for (const b of bubbles) {
        update(b, time);
        if (b.dead === 0) drawBubble(b, alpha * mul * (0.45 + 0.55 * Math.min(1, b.r / size)));
      }
      pops = pops.filter((p) => ++p.age < POP_LIFE);
      for (const p of pops) drawPop(p, alpha * mul);
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
  }, [count, size, rise, reach, pop, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--bubble-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
