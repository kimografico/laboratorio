import { useEffect, useRef } from "react";

export interface DandelionBackgroundProps {
  /** Semillas cercanas: con filamentos, puntas, tallo y semilla */
  near?: number;
  /** Semillas lejanas: pequeñas y muy tenues */
  far?: number;
  /** Radio del paracaídas de la semilla más cercana (px) */
  size?: number;
  /** Fuerza del viento que las arrastra (1 = normal, 0 = sin viento) */
  wind?: number;
  /** Cuánto las sopla el puntero al pasar cerca (0 = no las toca) */
  gust?: number;
  /** Opacidad del contorno de las cercanas (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Seed = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ang: number; // inclinación del paracaídas
  av: number;
  L: number;
  depth: number;
  far: boolean;
  phase: number;
};

export default function DandelionBackground({
  near = 22,
  far = 16,
  size = 30,
  wind = 1,
  gust = 1,
  alpha = 0.34,
  lineWidth = 1,
  color,
  className,
}: DandelionBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let mul = 1;
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let pvx = 0;
    let pvy = 0;
    let hasPointer = false;
    let seeds: Seed[] = [];
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const kinds: boolean[] = [...Array(near).fill(false), ...Array(far).fill(true)];
      seeds = kinds
        .map((isFar) => {
          const depth = isFar ? 0.3 + 0.15 * Math.random() : 0.65 + 0.35 * Math.random();
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: 0,
            vy: 0,
            ang: 0,
            av: 0,
            L: size * (0.4 + 0.6 * depth) * (0.85 + 0.3 * Math.random()),
            depth,
            far: isFar,
            phase: Math.random() * Math.PI * 2,
          };
        })
        .sort((a, b) => a.depth - b.depth); // las lejanas se dibujan primero
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

    function update(s: Seed, time: number) {
      // Viento: deriva lenta con rachas que cambian según la posición y el tiempo; las lejanas se mueven más despacio
      const k = 0.5 + 0.5 * s.depth;
      const wx = wind * k * (0.22 + 0.14 * Math.sin(time * 0.00021 + s.y * 0.0015));
      const wy = wind * k * (-0.09 + 0.06 * Math.sin(time * 0.00017 + s.x * 0.002 + 1.3));
      s.vx += (wx - s.vx) * 0.012 + Math.sin(time * 0.0009 + s.phase) * 0.004;
      s.vy += (wy - s.vy) * 0.012 + Math.cos(time * 0.0007 + s.phase) * 0.003;
      // El puntero sopla: arrastra a las semillas cercanas en la dirección en que se mueve y las hace girar
      if (hasPointer && gust > 0) {
        const dx = s.x - px;
        const dy = s.y - py;
        const d = Math.hypot(dx, dy) || 1;
        const R = 170 + s.L;
        if (d < R) {
          const f = Math.pow(1 - d / R, 1.5) * gust;
          s.vx += pvx * f * 0.05 + (dx / d) * f * 0.12;
          s.vy += pvy * f * 0.05 + (dy / d) * f * 0.12;
          s.av += ((dx * pvy - dy * pvx) / (d * R)) * f * 0.02;
        }
      }
      s.vx *= 0.99;
      s.vy *= 0.99;
      s.x += s.vx;
      s.y += s.vy + Math.sin(time * 0.0012 + s.phase) * 0.12; // vaivén vertical, como al flotar
      // El paracaídas cuelga hacia atrás respecto al movimiento
      const target = Math.max(-0.7, Math.min(0.7, -s.vx * 1.6));
      s.av *= 0.9;
      s.ang += (target - s.ang) * 0.04 + s.av;
      if (s.x > w + s.L * 2) s.x = -s.L * 2;
      else if (s.x < -s.L * 2) s.x = w + s.L * 2;
      if (s.y > h + s.L * 2) s.y = -s.L * 2;
      else if (s.y < -s.L * 2) s.y = h + s.L * 2;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function draw(s: Seed) {
      const a = alpha * mul * (0.12 + 0.88 * Math.pow(s.depth, 1.5));
      const c = Math.cos(s.ang) * s.L;
      const sn = Math.sin(s.ang) * s.L;
      ctx!.setTransform(c, sn, -sn, c, s.x, s.y); // 1 unidad = el radio del paracaídas
      ctx!.lineWidth = (lineWidth * (0.5 + 0.5 * s.depth)) / s.L;
      const N = s.far ? 9 : 15;
      // Filamentos: abanico hacia arriba (de -190° a 10°), con una gota en la punta
      ctx!.beginPath();
      for (let k = 0; k < N; k++) {
        const th = ((-190 + (200 * k) / (N - 1)) * Math.PI) / 180;
        ctx!.moveTo(0, 0);
        ctx!.quadraticCurveTo(Math.cos(th) * 0.55, Math.sin(th) * 0.55 - 0.05, Math.cos(th) * 1.0, Math.sin(th) * 1.0 + 0.04);
      }
      setAlpha(a * (s.far ? 0.9 : 0.75));
      ctx!.stroke();
      if (!s.far) {
        ctx!.beginPath();
        for (let k = 0; k < N; k++) {
          const th = ((-190 + (200 * k) / (N - 1)) * Math.PI) / 180;
          const x = Math.cos(th) * 1.0;
          const y = Math.sin(th) * 1.0 + 0.04;
          ctx!.moveTo(x + 0.035, y);
          ctx!.arc(x, y, 0.035, 0, Math.PI * 2);
        }
        setAlpha(a);
        ctx!.fill();
        // Tallo y semilla
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.lineTo(0, 0.85);
        setAlpha(a * 0.9);
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.ellipse(0, 0.95, 0.04, 0.1, 0, 0, Math.PI * 2);
        setAlpha(a * 0.8);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(0, 0, 0.05, 0, Math.PI * 2); // el cubo del que salen los filamentos
        setAlpha(a);
        ctx!.fill();
      }
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
    }

    function animate(time: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--dandelion-color").trim() || style.color;
      const k = style.getPropertyValue("--dandelion-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineCap = "round";
      pvx *= 0.9;
      pvy *= 0.9;
      for (const s of seeds) {
        update(s, time);
        draw(s);
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
  }, [near, far, size, wind, gust, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--dandelion-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
