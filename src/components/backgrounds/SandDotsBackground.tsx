import { useEffect, useRef } from "react";

export interface SandDotsBackgroundProps {
  /** Separación entre los puntos de la cuadrícula (px) */
  spacing?: number;
  /** Radio de cada punto en reposo (px). Crece donde la arena está más removida */
  size?: number;
  /** Amplitud de las ondulaciones de la arena en reposo (px) */
  ripples?: number;
  /** Cuánto aparta el puntero los puntos a su paso (1 = normal, 0 = no los toca) */
  rake?: number;
  /** Anchura de la huella del puntero (px) */
  radius?: number;
  /** Lo rápido que se alisa la huella (0.9 = muy rápido, 0.995 = muy lento) */
  heal?: number;
  /** Número de piedras que los puntos rodean (0 = ninguna) */
  stones?: number;
  /** Opacidad de los puntos (0-1) */
  alpha?: number;
  /** Opcional: fija el color de la arena. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

const GS = 16; // celda de la rejilla donde se guarda la huella del puntero (px)

type Stone = { x: number; y: number; r: number; k: number };

export default function SandDotsBackground({
  spacing = 16,
  size = 1.5,
  ripples = 5,
  rake = 1,
  radius = 110,
  heal = 0.985,
  stones = 3,
  alpha = 0.4,
  color,
  className,
}: SandDotsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let gw = 0;
    let gh = 0;
    let DX = new Float32Array(0); // huella del puntero: desplazamiento de la arena en cada celda
    let DY = new Float32Array(0);
    let rocks: Stone[] = [];
    let lastX = -1;
    let lastY = -1;
    let frame = 0;
    let raf = 0;
    // Los puntos se dibujan con sprites ya pintados (uno por tamaño): miles de arcos en un solo path serían muy lentos
    const LEVELS = 6;
    let sprites: HTMLCanvasElement[] = [];
    let spriteInk = "";
    function buildSprites(ink: string) {
      sprites = Array.from({ length: LEVELS }, (_, l) => {
        const r = size * (1 + (0.9 * l) / (LEVELS - 1));
        const d = Math.ceil(r * 2 + 2);
        const c = document.createElement("canvas");
        c.width = d;
        c.height = d;
        const g = c.getContext("2d")!;
        g.fillStyle = ink;
        g.beginPath();
        g.arc(d / 2, d / 2, r, 0, Math.PI * 2);
        g.fill();
        return c;
      });
      spriteInk = ink;
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      gw = Math.ceil(w / GS) + 2;
      gh = Math.ceil(h / GS) + 2;
      DX = new Float32Array(gw * gh);
      DY = new Float32Array(gw * gh);
      rocks = Array.from({ length: stones }, (_, i) => {
        const f = (i + 0.5) / Math.max(1, stones);
        return {
          x: w * (0.12 + 0.76 * ((f * 2.3 + 0.17 * i) % 1)),
          y: h * (0.2 + 0.6 * ((f * 3.7 + 0.31) % 1)),
          r: Math.min(w, h) * (0.05 + 0.04 * Math.random()),
          k: Math.random(),
        };
      });
    }

    // El puntero es un rastrillo: empuja la arena hacia los lados y deja un surco que se alisa despacio
    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const x0 = lastX < 0 ? x : lastX;
      const y0 = lastY < 0 ? y : lastY;
      const speed = Math.min(34, Math.hypot(x - x0, y - y0));
      lastX = x;
      lastY = y;
      if (speed < 0.5 || rake <= 0) return;
      const n = Math.max(1, Math.ceil(speed / 8)); // se reparte el empuje a lo largo del tramo recorrido
      const r2 = radius * radius;
      const gx0 = Math.max(0, Math.floor((Math.min(x, x0) - radius) / GS));
      const gx1 = Math.min(gw - 1, Math.ceil((Math.max(x, x0) + radius) / GS));
      const gy0 = Math.max(0, Math.floor((Math.min(y, y0) - radius) / GS));
      const gy1 = Math.min(gh - 1, Math.ceil((Math.max(y, y0) + radius) / GS));
      for (let s = 1; s <= n; s++) {
        const px = x0 + ((x - x0) * s) / n;
        const py = y0 + ((y - y0) * s) / n;
        for (let gy = gy0; gy <= gy1; gy++) {
          for (let gx = gx0; gx <= gx1; gx++) {
            const dx = gx * GS - px;
            const dy = gy * GS - py;
            const d2 = dx * dx + dy * dy;
            if (d2 > r2 * 4) continue;
            const d = Math.sqrt(d2) || 1;
            const push = (Math.exp(-d2 / r2) * speed * rake * 0.65) / n;
            DX[gy * gw + gx] += (dx / d) * push;
            DY[gy * gw + gx] += (dy / d) * push;
          }
        }
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      // La arena se mueve despacio: se calcula a 30 fps y los fotogramas impares conservan el dibujo anterior
      if (frame++ % 2 === 1) return;
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--sand-color").trim() || style.color;
      const k = style.getPropertyValue("--sand-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;

      // La huella se alisa sola con easing
      for (let i = 0; i < DX.length; i++) {
        DX[i] *= heal;
        DY[i] *= heal;
      }

      ctx!.fillStyle = ink;
      ctx!.strokeStyle = ink;
      ctx!.lineWidth = 1;
      if (ink !== spriteInk) buildSprites(ink);
      setAlpha(alpha * mul);
      const tt = time * 0.00018;
      for (let y0 = 0, row = 0; y0 < h + spacing; y0 += spacing, row++) {
        for (let x0 = 0; x0 < w + spacing; x0 += spacing) {
          // Ondulaciones de la arena en reposo: dos olas lentas que se cruzan (los puntos se agrupan en bandas)
          let x = x0 + ripples * 0.4 * Math.sin(y0 * 0.013 + tt * 1.2);
          let y = y0 + ripples * (Math.sin(x0 * 0.011 + row * 0.22 + tt) + 0.5 * Math.sin(x0 * 0.027 - row * 0.15 - tt * 1.4 + 1.3));
          // Huella del puntero (interpolación bilineal)
          const fx = Math.min(gw - 1.001, Math.max(0, x0 / GS));
          const fy = Math.min(gh - 1.001, Math.max(0, y0 / GS));
          const ix = Math.floor(fx);
          const iy = Math.floor(fy);
          const u = fx - ix;
          const v = fy - iy;
          const i00 = iy * gw + ix;
          const i01 = i00 + gw;
          const hx = (DX[i00] * (1 - u) + DX[i00 + 1] * u) * (1 - v) + (DX[i01] * (1 - u) + DX[i01 + 1] * u) * v;
          const hy = (DY[i00] * (1 - u) + DY[i00 + 1] * u) * (1 - v) + (DY[i01] * (1 - u) + DY[i01 + 1] * u) * v;
          x += hx;
          y += hy;
          let moved = Math.hypot(hx, hy);
          // Las piedras apartan los puntos hacia fuera con un perfil gaussiano (nunca los cruzan)
          for (const s of rocks) {
            const dx = x - s.x;
            const dy = y - s.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < s.r * 4) {
              const push = s.r * (1.15 + 0.1 * s.k) * Math.exp(-((d / (1.3 * s.r)) * (d / (1.3 * s.r))));
              x += (dx / d) * push;
              y += (dy / d) * push;
              moved += push * 0.35;
            }
          }
          // Donde la arena está más removida, el punto crece un poco: se ve el surco, no solo el desplazamiento
          const level = Math.round(Math.min(1, moved / 22) * (LEVELS - 1));
          if (level === 0) {
            // La inmensa mayoría de los puntos está en reposo: un cuadradito de ese tamaño se ve igual que un círculo
            ctx!.fillRect(x - size, y - size, size * 2, size * 2);
          } else {
            const sp = sprites[level];
            ctx!.drawImage(sp, x - sp.width / 2, y - sp.height / 2);
          }
        }
      }

      // Las piedras: formas planas y tenues
      for (const s of rocks) {
        ctx!.beginPath();
        ctx!.ellipse(s.x, s.y, s.r * 0.95, s.r * 0.7, 0.3, 0, Math.PI * 2);
        setAlpha(alpha * mul * 0.45);
        ctx!.fill();
        setAlpha(alpha * mul * 0.9);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;
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
  }, [spacing, size, ripples, rake, radius, heal, stones, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--sand-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
