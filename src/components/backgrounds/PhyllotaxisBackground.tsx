import { useEffect, useRef } from "react";

export interface PhyllotaxisBackgroundProps {
  /** Número de puntos de la espiral */
  count?: number;
  /** Radio de los puntos más externos (px); los del centro miden un 18% */
  size?: number;
  /** Oscilación del ángulo áureo (grados); mueve despacio los brazos de la espiral */
  drift?: number;
  /** Giro lento del conjunto (vueltas por minuto; 0 = quieto) */
  spin?: number;
  /** Cuánto crecen los puntos tocados por el puntero (0.5 = un 50% más grandes) */
  swell?: number;
  /** Cuánto se desplazan los puntos tocados, alejándose del puntero (px) */
  push?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Persistencia de la estela (0-1): más alto, tardan más en recuperarse */
  decay?: number;
  /** Opacidad de los puntos (0-1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

// Ángulo áureo: 137,507...°. Con él, cada punto cae en el hueco más amplio y salen las espirales de Fibonacci
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
// Cubos de tamaño: así se agrupan los círculos en pocos trazados en vez de uno por punto
const NB = 24;

export default function PhyllotaxisBackground({
  count = 1500,
  size = 6,
  drift = 0.02,
  spin = 0.4,
  swell = 1,
  push = 16,
  radius = 170,
  decay = 0.965,
  alpha = 0.22,
  color,
  className,
}: PhyllotaxisBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const n = Math.max(1, Math.round(count));
    const smax = size * 1.15 * (1 + swell);
    const xs = new Float32Array(n);
    const ys = new Float32Array(n);
    const level = new Float32Array(n);
    const shown = new Float32Array(n);
    const dxs = new Float32Array(n);
    const dys = new Float32Array(n);
    const bucket = new Uint8Array(n);
    let w = 0;
    let h = 0;
    let c = 1;
    let raf = 0;
    // Un sprite por cubo de tamaño (un círculo lleno): drawImage cuesta mucho menos que miles de arcos
    const sprites: HTMLCanvasElement[] = [];
    let spriteInk = "";

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      // Escala para que el último punto llegue justo a la esquina
      c = (Math.hypot(w, h) / 2) / Math.sqrt(n);
      xs.fill(w / 2);
      ys.fill(h / 2);
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (let i = 0; i < n; i++) {
        const dx = xs[i] - x;
        const dy = ys[i] - y;
        const d = Math.hypot(dx, dy);
        const influence = 1 - Math.min(d / radius, 1);
        const v = influence * influence;
        if (v > level[i]) {
          level[i] = v;
          // La dirección de empuje se fija al tocar: al irse el puntero no cambia ni da saltos
          dxs[i] = d > 0.001 ? dx / d : 0;
          dys[i] = d > 0.001 ? dy / d : 0;
        }
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function buildSprites(ink: string) {
      for (let b = 0; b < NB; b++) {
        const rr = (smax * (b + 0.5)) / NB;
        const d = Math.ceil(rr * 2) + 2;
        const sp = sprites[b] ?? document.createElement("canvas");
        sp.width = d;
        sp.height = d;
        const sc = sp.getContext("2d")!;
        sc.fillStyle = ink;
        sc.beginPath();
        sc.arc(d / 2, d / 2, rr, 0, Math.PI * 2);
        sc.fill();
        sprites[b] = sp;
      }
      spriteInk = ink;
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--phyllo-color").trim() || style.color;
      // El color del tema puede cambiar (claro/oscuro, transiciones): los sprites se repintan solo si cambia
      if (ink !== spriteInk) buildSprites(ink);
      const k = style.getPropertyValue("--phyllo-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      setAlpha(alpha * mul);

      const phi = GOLDEN + ((drift * Math.PI) / 180) * Math.sin(time * 0.00007);
      const rot = time * spin * 1.0472e-4;
      for (let i = 0; i < n; i++) {
        const r = c * Math.sqrt(i + 0.5);
        const ang = i * phi + rot;
        shown[i] += (level[i] - shown[i]) * 0.12;
        level[i] *= decay;
        const sh = shown[i];
        const x = w / 2 + Math.cos(ang) * r + dxs[i] * push * sh;
        const y = h / 2 + Math.sin(ang) * r + dys[i] * push * sh;
        xs[i] = x;
        ys[i] = y;
        // Crecen hacia fuera, como las semillas de un girasol; una onda ambiental viaja hacia el borde
        const s = size * (0.18 + 0.82 * Math.sqrt(i / n)) * (1 + 0.12 * Math.sin(r * 0.012 - time * 0.0009)) * (1 + swell * sh);
        const b = Math.min(NB - 1, Math.floor((s / smax) * NB));
        bucket[i] = b;
      }
      for (let i = 0; i < n; i++) {
        const sp = sprites[bucket[i]];
        ctx!.drawImage(sp, xs[i] - sp.width / 2, ys[i] - sp.height / 2);
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
  }, [count, size, drift, spin, swell, push, radius, decay, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--phyllo-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
