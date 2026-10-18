import { useEffect, useRef } from "react";

export interface PlanktonBackgroundProps {
  /** Densidad de partículas */
  density?: number;
  /** Tamaño base (px) */
  size?: number;
  /** Deriva vertical */
  drift?: number;
  /** Fuerza de la estela del puntero */
  wake?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Intensidad del brillo */
  glow?: number;
  /** Opacidad base (0-1) */
  alpha?: number;
  /** Opcional: fija el color de las partículas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Plankton = {
  x: number;
  y: number;
  wx: number;
  wy: number;
  depth: number;
  r: number;
  phase: number;
  glow: number;
};

export default function PlanktonBackground({
  density = 1.2,
  size = 1.8,
  drift = 0.14,
  wake = 1,
  radius = 150,
  glow = 0.7,
  alpha = 0.35,
  color,
  className,
}: PlanktonBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let wakeX = 0;
    let wakeY = 0;
    let hasPointer = false;
    let plankton: Plankton[] = [];
    let raf = 0;

    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    function build() {
      const total = Math.round((density * width * height) / 10000);
      plankton = Array.from({ length: total }, () => {
        const depth = 0.2 + 0.8 * Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          wx: 0,
          wy: 0,
          depth,
          r: size * (0.35 + 0.65 * depth),
          phase: Math.random() * Math.PI * 2,
          glow: 0,
        };
      }).sort((a, b) => a.depth - b.depth);
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      build();
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      if (hasPointer) {
        wakeX = wakeX * 0.6 + (px - pointerX) * 0.4;
        wakeY = wakeY * 0.6 + (py - pointerY) * 0.4;
      }
      pointerX = px;
      pointerY = py;
      hasPointer = true;
    }

    function update(p: Plankton, t: number) {
      const dx = p.x - pointerX;
      const dy = p.y - pointerY;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const influence = 1 - dist / radius;
        p.glow = Math.max(p.glow, influence);
        p.wx += wakeX * influence * influence * wake * 0.04 * (0.4 + p.depth);
        p.wy += wakeY * influence * influence * wake * 0.04 * (0.4 + p.depth);
      }
      p.glow *= 0.985;
      p.wx *= 0.96;
      p.wy *= 0.96;
      p.x += Math.sin(t * 0.0003 + p.phase) * 0.15 * (0.4 + p.depth) + p.wx;
      p.y += drift * (0.4 + p.depth) + p.wy;
      if (p.y > height + 8) {
        p.y = -8;
        p.x = Math.random() * width;
      } else if (p.y < -8) {
        p.y = height + 8;
      }
      if (p.x > width + 8) p.x = -8;
      else if (p.x < -8) p.x = width + 8;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function draw(p: Plankton, t: number, mul: number) {
      const flicker = 0.85 + 0.15 * Math.sin(t * 0.002 + p.phase);
      const a = alpha * (0.25 + 0.75 * p.depth) * flicker;
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--plankton-color").trim() || style.color;
      ctx!.fillStyle = ink;
      if (p.glow > 0.03) {
        setAlpha(clamp(p.glow * glow * 0.22) * mul);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * (2 + 3 * p.glow), 0, Math.PI * 2);
        ctx!.fill();
      }
      setAlpha(clamp(a + p.glow * glow) * mul);
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.r * (1 + 0.8 * p.glow), 0, Math.PI * 2);
      ctx!.fill();
    }

    function animate(t: number) {
      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--plankton-color").trim() || style.color;
      const k = style.getPropertyValue("--plankton-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.fillStyle = ink;
      wakeX *= 0.9;
      wakeY *= 0.9;
      for (const p of plankton) update(p, t);
      for (const p of plankton) draw(p, t, mul);
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
  }, [density, size, drift, wake, radius, glow, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--plankton-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
