import { useEffect, useId, useRef } from "react";

export interface BlobBackgroundProps {
  /** Gotas grandes (capa de atrás, más tenue) */
  large?: number;
  /** Gotas pequeñas (capa principal) */
  small?: number;
  /** Radio de referencia de las gotas grandes (px); las pequeñas miden un 40% */
  size?: number;
  /** Desenfoque del efecto líquido (px): más alto, las gotas se funden desde más lejos */
  goo?: number;
  /** Velocidad del movimiento (1 = normal, 0 = quietas) */
  speed?: number;
  /** Fuerza con que el puntero atrae a las gotas cercanas (negativo = las repele) */
  attract?: number;
  /** Alcance del puntero (px) */
  radius?: number;
  /** Opacidad de la capa principal (0-1); la de atrás usa el 55% */
  alpha?: number;
  /** Opcional: fija el color de las gotas. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Blob = {
  hx: number; // posición de reposo (fracción del contenedor)
  hy: number;
  ax: number; // amplitud del recorrido (px)
  ay: number;
  fx: number; // frecuencias y fases del recorrido
  fy: number;
  px: number;
  py: number;
  r: number;
  pr: number; // fase de la "respiración" del radio
  ox: number; // desplazamiento hacia el puntero, suavizado
  oy: number;
};

export default function BlobBackground({
  large = 12,
  small = 25,
  size = 120,
  goo = 15,
  speed = 0.5,
  attract = 0.6,
  radius = 300,
  alpha = 0.16,
  color,
  className,
}: BlobBackgroundProps) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  // id único del filtro SVG (useId devuelve ":r1:", que no sirve dentro de url(#...))
  const fid = `goo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const back = backRef.current!;
    const front = frontRef.current!;
    const bctx = back.getContext("2d");
    const fctx = front.getContext("2d");
    if (!bctx || !fctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(front);
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let cx = 0; // gota que sigue al puntero, con easing
    let cy = 0;
    let hasPointer = false;
    let backBlobs: Blob[] = [];
    let frontBlobs: Blob[] = [];
    let raf = 0;

    const make = (n: number, r0: number): Blob[] =>
      Array.from({ length: n }, () => ({
        hx: Math.random(),
        hy: Math.random(),
        ax: 30 + Math.random() * 90,
        ay: 30 + Math.random() * 90,
        fx: 0.00018 + Math.random() * 0.0003,
        fy: 0.00018 + Math.random() * 0.0003,
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        r: r0 * (0.55 + 0.9 * Math.random()),
        pr: Math.random() * Math.PI * 2,
        ox: 0,
        oy: 0,
      }));

    function resize() {
      w = front.clientWidth;
      h = front.clientHeight;
      for (const c of [back, front]) {
        c.width = w;
        c.height = h;
      }
      backBlobs = make(large, size);
      frontBlobs = make(small, size * 0.4);
      cx = w / 2;
      cy = h / 2;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = front.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      if (!hasPointer) {
        cx = px;
        cy = py;
      }
      hasPointer = true;
    }

    // Dibuja una capa: círculos de color sólido; el efecto líquido lo da el filtro SVG del lienzo
    function draw(ctx: CanvasRenderingContext2D, blobs: Blob[], time: number, ink: string, extra: boolean) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ink;
      ctx.beginPath();
      for (const b of blobs) {
        const t = time * speed;
        const x = b.hx * w + Math.sin(t * b.fx + b.px) * b.ax + b.ox;
        const y = b.hy * h + Math.sin(t * b.fy + b.py) * b.ay + b.oy;
        // El puntero atrae (o repele) a las gotas cercanas: se desplazan hacia él con easing y se estiran
        const dx = px - x;
        const dy = py - y;
        const d = Math.hypot(dx, dy);
        let tx = 0;
        let ty = 0;
        if (hasPointer && d < radius) {
          const k = Math.pow(1 - d / radius, 1.5) * attract * 0.8;
          tx = dx * k;
          ty = dy * k;
        }
        b.ox += (tx - b.ox) * 0.04;
        b.oy += (ty - b.oy) * 0.04;
        const r = b.r * (1 + 0.08 * Math.sin(t * 0.0009 + b.pr));
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      // Una gota más que sigue al cursor: al acercarse a otras se funde con ellas
      if (extra && hasPointer) {
        const r = size * 0.3;
        ctx.moveTo(cx + r, cy);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    function animate(time: number) {
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--blob-color").trim() || style.color;
      const k = style.getPropertyValue("--blob-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      cx += (px - cx) * 0.07;
      cy += (py - cy) * 0.07;
      draw(bctx!, backBlobs, time, ink, false);
      draw(fctx!, frontBlobs, time, ink, true);
      // La opacidad se aplica al lienzo ya filtrado (el filtro necesita los círculos opacos para el umbral)
      back.style.opacity = String(Math.min(1, alpha * 0.55 * mul));
      front.style.opacity = String(Math.min(1, alpha * mul));
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(front);
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
  }, [large, small, size, speed, attract, radius, alpha]);

  const layer: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", filter: `url(#${fid})` };
  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--blob-color": color } as React.CSSProperties) : undefined}
    >
      {/* Filtro "líquido": desenfoca y recorta el borde con un umbral de opacidad, así las gotas cercanas se funden */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={fid} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={goo} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
        </defs>
      </svg>
      <canvas ref={backRef} style={layer} />
      <canvas ref={frontRef} style={layer} />
    </div>
  );
}
