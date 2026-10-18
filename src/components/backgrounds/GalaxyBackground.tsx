import { useEffect, useRef } from "react";

export interface GalaxyBackgroundProps {
  /** Brazos espirales */
  arms?: number;
  /** Estrellas */
  stars?: number;
  /** Radio de la galaxia (fracción del lado menor del contenedor) */
  radius?: number;
  /** Velocidad de giro (rad/s; el interior gira más rápido que el borde) */
  spin?: number;
  /** Espesor de los brazos */
  spread?: number;
  /** Destellos de cada estrella */
  twinkle?: number;
  /** Tamaño de las estrellas (px) */
  size?: number;
  /** Influencia del puntero en las estrellas (0 = ninguna, 1 = máxima) */
  mouse?: number;
  /** Suavizado del parallax (0.01 = muy rezagado, 1 = instantáneo) */
  easing?: number;
  /** Brillo del núcleo (0 = apagado, 1 = intenso) */
  core?: number;
  /** Opacidad del resplandor radial de fondo (0 = invisible, 1 = completo) */
  glow?: number;
  /** Opcional: fija el color de las estrellas y el resplandor. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

function withAlpha(input: string, a: number): string {
  const value = input.trim();

  const hex = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(value);
  if (hex) {
    const h = hex[1];
    if (h.length === 6) {
      return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
    }
    const part = (s: string) => parseInt(s + s, 16);
    return `rgba(${part(h.slice(0, 1))}, ${part(h.slice(1, 2))}, ${part(h.slice(2, 3))}, ${a})`;
  }

  const rgb = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (rgb) {
    const parts = rgb[1]
      .split(/[,/\s]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 3) {
      const alpha = parts.length >= 4 ? parseFloat(parts[3]) : 1;
      const na = (Number.isFinite(alpha) ? alpha : 1) * a;
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${na})`;
    }
  }

  return `rgba(255, 255, 255, ${a})`;
}

export default function GalaxyBackground({
  arms = 6,
  stars = 10000,
  radius = 1.2,
  spin = 0.03,
  spread = 0.75,
  twinkle = 1.05,
  size = 0.5,
  mouse = 0.1,
  easing = 0.03,
  core = 0.34,
  glow = 0.2,
  color,
  className,
}: GalaxyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const live = useRef({ core, mouse, easing, glow });
  live.current = { core, mouse, easing, glow };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);

    let w = 0;
    let h = 0;
    let raf = 0;
    let maxR = 0;
    let rn: Float32Array = new Float32Array(0);
    let a0: Float32Array = new Float32Array(0);
    let br: Float32Array = new Float32Array(0);
    let ph: Float32Array = new Float32Array(0);
    let sp: Float32Array = new Float32Array(0);
    let hasPointer = false;
    let sx = 0;
    let sy = 0;
    let ex = 0;
    let ey = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      sx = w / 2;
      sy = h / 2;
      ex = sx;
      ey = sy;
      maxR = Math.min(w, h) * radius;
      rn = new Float32Array(stars);
      a0 = new Float32Array(stars);
      br = new Float32Array(stars);
      ph = new Float32Array(stars);
      sp = new Float32Array(stars);
      const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.8;
      for (let i = 0; i < stars; i++) {
        if (i % 5 === 0) {
          rn[i] = Math.pow(Math.random(), 1.7) * 0.24;
          a0[i] = Math.random() * Math.PI * 2;
          br[i] = 0.5 + Math.random() * 0.5;
        } else {
          const arm = i % arms;
          const r = Math.pow(Math.random(), 0.72);
          rn[i] = r;
          a0[i] = arm * ((Math.PI * 2) / arms) + r * 2.4 + gauss() * spread * (0.16 + r * 0.3);
          br[i] = 0.35 + Math.pow(Math.random(), 1.6) * 0.65;
        }
        ph[i] = Math.random() * Math.PI * 2;
        sp[i] = 0.8 + Math.random() * 2.6;
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      sx = clientX - rect.left;
      sy = clientY - rect.top;
      hasPointer = true;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      const t = time / 1000;

      ctx!.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      const k = live.current.easing;
      ex += (sx - ex) * k;
      ey += (sy - ey) * k;

      const par = hasPointer ? live.current.mouse : 0;
      const offX = (ex - cx) * par;
      const offY = (ey - cy) * par;

      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--galaxy-color").trim() || style.color;
      const kOp = style.getPropertyValue("--galaxy-opacity").trim();
      const mul = kOp !== "" && Number.isFinite(Number(kOp)) ? Number(kOp) : 1;

      // Resplandor radial de fondo: `glow` regula su opacidad (0 lo hace desaparecer)
      const coreA = live.current.core * live.current.glow * mul;
      if (coreA > 0.002) {
        const coreGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.5);
        coreGrad.addColorStop(0, withAlpha(ink, coreA));
        coreGrad.addColorStop(0.4, withAlpha(ink, coreA * 0.3));
        coreGrad.addColorStop(1, withAlpha(ink, 0));
        ctx!.fillStyle = coreGrad;
        setAlpha(mul);
        ctx!.beginPath();
        ctx!.arc(cx, cy, maxR * 0.5, 0, Math.PI * 2);
        ctx!.fill();
      }

      for (let i = 0; i < stars; i++) {
        const r = rn[i];
        const omega = spin * (1.6 - 1.15 * r);
        const ang = a0[i] + omega * t;
        const dist = r * maxR;
        const depth = br[i];
        const x = cx + Math.cos(ang) * dist + offX * depth;
        const y = cy + Math.sin(ang) * dist + offY * depth;
        const edge = r > 0.78 ? 1 - (r - 0.78) / 0.22 : 1;
        if (edge <= 0) continue;

        const tw = 1 - twinkle * 0.5 + twinkle * 0.5 * Math.sin(t * sp[i] + ph[i]);
        const a = Math.min(1, br[i] * tw * edge);
        if (a < 0.03) continue;

        setAlpha(a * mul);
        const s = Math.max(1, size * (0.6 + br[i] * 0.9));
        ctx!.fillStyle = ink;
        ctx!.fillRect(x - s / 2, y - s / 2, s, s);
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
  }, [arms, stars, radius, spin, spread, twinkle, size, mouse, easing, core, glow]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--galaxy-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
