import { useEffect, useRef } from "react";

export interface LilyBackgroundProps {
  /** Número de nenúfares */
  count?: number;
  /** Radio medio de un nenúfar (px); cada uno varía entre 0.55x y 1.4x */
  size?: number;
  /** Fuerza con la que el puntero los empuja y los hace girar (0 = no los toca) */
  push?: number;
  /** Alcance del puntero sobre los nenúfares (px, además de su radio) */
  reach?: number;
  /** Fracción de nenúfares con flor (0-1) */
  flowers?: number;
  /** Opacidad del contorno (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Pad = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ang: number;
  av: number;
  r: number;
  notch: number; // abertura de la hoja (radianes)
  flower: boolean;
  phase: number;
};

export default function LilyBackground({
  count = 14,
  size = 46,
  push = 1,
  reach = 90,
  flowers = 0.25,
  alpha = 0.3,
  lineWidth = 1.2,
  color,
  className,
}: LilyBackgroundProps) {
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
    let pvx = 0; // velocidad del puntero, suavizada
    let pvy = 0;
    let hasPointer = false;
    let pads: Pad[] = [];
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      pads = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        ang: Math.random() * Math.PI * 2,
        av: 0,
        r: size * (0.55 + 0.85 * Math.random()),
        notch: 0.3 + 0.35 * Math.random(),
        flower: Math.random() < flowers,
        phase: Math.random() * Math.PI * 2,
      })).sort((a, b) => a.r - b.r); // los pequeños debajo
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

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function update(p: Pad, time: number) {
      // Corriente suave y lenta que los mece
      p.vx += Math.sin(time * 0.0003 + p.y * 0.004 + p.phase) * 0.0035;
      p.vy += Math.cos(time * 0.00025 + p.x * 0.003 + p.phase) * 0.0025;
      // El puntero los empuja en la dirección en que se mueve y los aparta; si los roza de lado, los hace girar
      if (hasPointer && push > 0) {
        const dx = p.x - px;
        const dy = p.y - py;
        const d = Math.hypot(dx, dy) || 1;
        const R = p.r + reach;
        if (d < R) {
          const k = Math.pow(1 - d / R, 1.5) * push;
          p.vx += pvx * k * 0.06 + (dx / d) * k * Math.hypot(pvx, pvy) * 0.02;
          p.vy += pvy * k * 0.06 + (dy / d) * k * Math.hypot(pvx, pvy) * 0.02;
          p.av += ((dx * pvy - dy * pvx) / (d * R)) * k * 0.012;
        }
      }
      p.vx *= 0.975; // la resistencia del agua
      p.vy *= 0.975;
      p.av *= 0.97;
      p.x += p.vx;
      p.y += p.vy;
      p.ang += p.av + 0.0004;
      // Al salir por un borde, reaparecen por el opuesto
      if (p.x < -p.r) p.x = w + p.r;
      else if (p.x > w + p.r) p.x = -p.r;
      if (p.y < -p.r) p.y = h + p.r;
      else if (p.y > h + p.r) p.y = -p.r;
    }

    function draw(p: Pad, a: number) {
      const a0 = p.ang + p.notch / 2;
      const a1 = p.ang + Math.PI * 2 - p.notch / 2;
      // Hoja: círculo con una muesca hacia el centro
      ctx!.beginPath();
      ctx!.moveTo(p.x, p.y);
      ctx!.arc(p.x, p.y, p.r, a0, a1);
      ctx!.closePath();
      setAlpha(a * 0.26);
      ctx!.fill();
      setAlpha(a);
      ctx!.stroke();
      // Nervios
      ctx!.beginPath();
      const span = a1 - a0;
      for (let k = 0; k < 6; k++) {
        const t = a0 + (span * (k + 0.5)) / 6;
        ctx!.moveTo(p.x + Math.cos(t) * p.r * 0.14, p.y + Math.sin(t) * p.r * 0.14);
        ctx!.lineTo(p.x + Math.cos(t) * p.r * 0.86, p.y + Math.sin(t) * p.r * 0.86);
      }
      setAlpha(a * 0.4);
      ctx!.stroke();
      // Flor: dos coronas de pétalos puntiagudos
      if (p.flower) {
        for (let ring = 0; ring < 2; ring++) {
          const n = ring === 0 ? 9 : 6;
          const len = p.r * (ring === 0 ? 0.36 : 0.24);
          for (let k = 0; k < n; k++) {
            const t = p.ang * 0.5 + (k / n) * Math.PI * 2 + ring * 0.35;
            ctx!.beginPath();
            ctx!.ellipse(p.x + Math.cos(t) * len * 0.55, p.y + Math.sin(t) * len * 0.55, len * 0.55, len * 0.2, t, 0, Math.PI * 2);
            setAlpha(a * (ring === 0 ? 0.22 : 0.32));
            ctx!.fill();
            setAlpha(a * 0.7);
            ctx!.stroke();
          }
        }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 0.05, 0, Math.PI * 2);
        setAlpha(a);
        ctx!.fill();
      }
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--lily-color").trim() || style.color;
      const k = style.getPropertyValue("--lily-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineWidth = lineWidth;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      pvx *= 0.9; // si el puntero se para, deja de empujar
      pvy *= 0.9;
      // Colisiones suaves: dos nenúfares que se tocan se separan con un empujón proporcional al solape
      for (let i = 0; i < pads.length; i++) {
        for (let j = i + 1; j < pads.length; j++) {
          const A = pads[i];
          const B = pads[j];
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const d = Math.hypot(dx, dy) || 1;
          const min = (A.r + B.r) * 0.95;
          if (d < min) {
            const f = ((min - d) / min) * 0.05;
            const wa = B.r / (A.r + B.r);
            A.vx -= (dx / d) * f * wa * 10;
            A.vy -= (dy / d) * f * wa * 10;
            B.vx += (dx / d) * f * (1 - wa) * 10;
            B.vy += (dy / d) * f * (1 - wa) * 10;
          }
        }
      }
      for (const p of pads) {
        update(p, time);
        draw(p, alpha * mul * (0.55 + 0.45 * Math.min(1, p.r / (size * 1.2))));
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
  }, [count, size, push, reach, flowers, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--lily-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
