import { useEffect, useRef } from "react";

export interface MoonPhasesBackgroundProps {
  /** Lado de cada celda (px); la luna mide un 60% */
  size?: number;
  /** Velocidad con que avanzan las fases por sí solas (1 = normal, 0 = quietas) */
  speed?: number;
  /** Desfase de fase entre celdas vecinas: más alto, la onda de fases es más apretada */
  spread?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Persistencia de la estela del puntero (0-1) */
  decay?: number;
  /** Opacidad de las lunas (0-1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

// Fases precalculadas: dibujar cientos de lunas como sprites es mucho más barato que trazarlas cada fotograma
const NP = 48;

export default function MoonPhasesBackground({
  size = 40,
  speed = 1,
  spread = 1,
  radius = 300,
  decay = 0.95,
  alpha = 0.3,
  color,
  className,
}: MoonPhasesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const r = size * 0.3;
    const d = Math.ceil(r * 2) + 4;
    const sprites: HTMLCanvasElement[] = [];
    let spriteInk = "";
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let level = new Float32Array(0);
    let shown = new Float32Array(0);
    let waves: { x: number; y: number; t0: number }[] = [];
    let now = 0;
    let raf = 0;
    let frame = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / size) + 1;
      rows = Math.ceil(h / size) + 1;
      level = new Float32Array(cols * rows);
      shown = new Float32Array(cols * rows);
    }

    // Luna con fase p (0 nueva, 0.5 llena): mitad iluminada + terminador elíptico
    function buildSprites(ink: string) {
      for (let q = 0; q < NP; q++) {
        const p = q / NP;
        const sp = sprites[q] ?? document.createElement("canvas");
        sp.width = d;
        sp.height = d;
        const c = sp.getContext("2d")!;
        const m = d / 2;
        c.fillStyle = ink;
        c.strokeStyle = ink;
        c.lineWidth = 1;
        c.globalAlpha = 0.45;
        c.beginPath();
        c.arc(m, m, r, 0, Math.PI * 2);
        c.stroke();
        c.globalAlpha = 1;
        const k = Math.cos(p * Math.PI * 2);
        const rx = Math.max(0.01, Math.abs(k) * r);
        c.beginPath();
        if (p < 0.5) {
          c.arc(m, m, r, -Math.PI / 2, Math.PI / 2, false);
          c.ellipse(m, m, rx, r, 0, Math.PI / 2, k > 0 ? -Math.PI / 2 : (3 * Math.PI) / 2, k > 0);
        } else {
          c.arc(m, m, r, Math.PI / 2, (3 * Math.PI) / 2, false);
          c.ellipse(m, m, rx, r, 0, (3 * Math.PI) / 2, k > 0 ? Math.PI / 2 : (5 * Math.PI) / 2, k > 0);
        }
        c.closePath();
        c.fill();
        sprites[q] = sp;
      }
      spriteInk = ink;
    }

    function onMove(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const dd = Math.hypot((i + 0.5) * size - x, (j + 0.5) * size - y);
          const inf = 1 - Math.min(dd / radius, 1);
          const idx = j * cols + i;
          level[idx] = Math.max(level[idx], inf * inf);
        }
      }
    }

    // Un clic lanza una onda que hace pasar las lunas de nueva a llena a su paso
    function onDown(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      waves.push({ x, y, t0: now });
      if (waves.length > 4) waves.shift();
    }

    function animate(time: number) {
      // Cambia despacio: se calcula a 30 fps (el fotograma impar conserva el dibujo anterior)
      raf = requestAnimationFrame(animate);
      if (frame++ % 2 === 1) return;
      now = time * 0.001;
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--moon-phases-color").trim() || style.color;
      const k = style.getPropertyValue("--moon-phases-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      if (ink !== spriteInk) buildSprites(ink);
      ctx!.globalAlpha = Math.min(1, alpha * mul);
      waves = waves.filter((v) => now - v.t0 < 4);

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i;
          shown[idx] += (level[idx] - shown[idx]) * 0.12;
          level[idx] *= decay;
          const cx = (i + 0.5) * size;
          const cy = (j + 0.5) * size;
          let ripple = 0;
          for (const v of waves) {
            const age = now - v.t0;
            const e = (Math.hypot(cx - v.x, cy - v.y) - 500 * age) / 90;
            ripple += 0.5 * Math.exp(-e * e) * Math.exp(-age * 0.7);
          }
          const phase = (i * 0.025 + j * 0.04) * spread + time * 0.00004 * speed + 0.6 * shown[idx] + ripple;
          const q = Math.floor((phase - Math.floor(phase)) * NP) % NP;
          ctx!.drawImage(sprites[q], cx - d / 2, cy - d / 2);
        }
      }
      ctx!.globalAlpha = 1;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onMove(e.touches[0].clientX, e.touches[0].clientY);
    const onDownEvt = (e: PointerEvent) => onDown(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("pointerdown", onDownEvt);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("pointerdown", onDownEvt);
    };
  }, [size, speed, spread, radius, decay, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--moon-phases-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
