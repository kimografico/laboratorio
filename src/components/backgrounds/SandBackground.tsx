import { useEffect, useRef } from "react";

export interface SandBackgroundProps {
  /** Separación entre las líneas de arena (px) */
  spacing?: number;
  /** Amplitud de las ondulaciones de la arena en reposo (px) */
  ripples?: number;
  /** Cuánto aparta el puntero las líneas a su paso (1 = normal, 0 = no las toca) */
  rake?: number;
  /** Anchura de la huella del puntero (px) */
  radius?: number;
  /** Lo rápido que se alisa la huella (0.9 = muy rápido, 0.995 = muy lento) */
  heal?: number;
  /** Número de piedras que las líneas rodean (0 = ninguna) */
  stones?: number;
  /** Opacidad de las líneas (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color de la arena. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

const GS = 16; // celda de la rejilla donde se guarda la huella del puntero (px)

type Stone = { x: number; y: number; r: number; k: number };

export default function SandBackground({
  spacing = 10,
  ripples = 15,
  rake = 0.5,
  radius = 110,
  heal = 0.985,
  stones = 2,
  alpha = 0.3,
  lineWidth = 1,
  color,
  className,
}: SandBackgroundProps) {
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
    const STEP = 8; // separación entre los puntos de cada línea

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      gw = Math.ceil(w / GS) + 2;
      gh = Math.ceil(h / GS) + 2;
      DX = new Float32Array(gw * gh);
      DY = new Float32Array(gw * gh);
      // Piedras repartidas con un reparto regular para que no se amontonen
      rocks = Array.from({ length: stones }, (_, i) => {
        const f = (i + 0.5) / Math.max(1, stones);
        const r = Math.min(w, h) * (0.05 + 0.04 * Math.random());
        return {
          x: w * (0.12 + 0.76 * ((f * 2.3 + 0.17 * i) % 1)),
          y: h * (0.2 + 0.6 * ((f * 3.7 + 0.31) % 1)),
          r,
          k: 0.65 + 0.2 * Math.random(),
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
            const push = (Math.exp(-d2 / r2) * speed * rake * 0.9) / n;
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

      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineWidth = lineWidth;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      ctx!.beginPath();
      const tt = time * 0.00018;
      for (let y0 = spacing / 2, row = 0; y0 < h + spacing; y0 += spacing, row++) {
        for (let x0 = -STEP; x0 <= w + STEP; x0 += STEP) {
          // Ondulaciones de la arena: dos olas lentas que se cruzan
          let x = x0;
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
          x += (DX[i00] * (1 - u) + DX[i00 + 1] * u) * (1 - v) + (DX[i01] * (1 - u) + DX[i01 + 1] * u) * v;
          y += (DY[i00] * (1 - u) + DY[i00 + 1] * u) * (1 - v) + (DY[i01] * (1 - u) + DY[i01 + 1] * u) * v;
          // Las piedras desvían las líneas hacia fuera: nunca las cruzan
          for (const s of rocks) {
            const dx = x - s.x;
            const dy = y - s.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < s.r * 4) {
              // Perfil gaussiano: las líneas se curvan con suavidad alrededor de la piedra y nunca se cruzan
              const push = s.r * (1.15 + 0.1 * s.k) * Math.exp(-((d / (1.3 * s.r)) * (d / (1.3 * s.r))));
              x += (dx / d) * push;
              y += (dy / d) * push;
            }
          }
          if (x0 === -STEP) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
      }
      setAlpha(alpha * mul);
      ctx!.stroke();

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
  }, [spacing, ripples, rake, radius, heal, stones, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--sand-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
