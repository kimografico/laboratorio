import { useEffect, useRef } from "react";

export interface SeigaihaBackgroundProps {
  /** Radio de cada ola (px) */
  size?: number;
  /** Arcos concéntricos por ola */
  rings?: number;
  /** Cuánto se hinchan las olas al pasar el puntero (0.3 = un 30% más grandes) */
  swell?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Amplitud de la respiración ambiental que recorre el patrón (fracción del radio) */
  wave?: number;
  /** Persistencia de la estela (0-1): más alto, la hinchazón tarda más en bajar */
  decay?: number;
  /** Opacidad de los arcos (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color de los arcos. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Unit = { cx: number; cy: number; level: number; shown: number };

export default function SeigaihaBackground({
  size = 40,
  rings = 4,
  swell = 1,
  radius = 50,
  wave = 0.05,
  decay = 0.98,
  alpha = 0.25,
  lineWidth = 1,
  color,
  className,
}: SeigaihaBackgroundProps) {
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
    let units: Unit[] = [];
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      // Patrón seigaiha: filas separadas R/2, las impares desplazadas R. Se ordenan de arriba abajo
      // porque cada ola tapa a las de las filas anteriores
      const R = size;
      const nRows = Math.ceil(h / (R / 2)) + 3;
      const nCols = Math.ceil(w / (2 * R)) + 2;
      units = [];
      for (let r = 0; r < nRows; r++) {
        for (let c = -1; c < nCols; c++) {
          units.push({ cx: c * 2 * R + (r % 2) * R, cy: r * (R / 2), level: 0, shown: 0 });
        }
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (const u of units) {
        const d = Math.hypot(u.cx - x, u.cy - y);
        const influence = 1 - Math.min(d / radius, 1);
        u.level = Math.max(u.level, influence * influence);
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--seigaiha-color").trim() || style.color;
      const k = style.getPropertyValue("--seigaiha-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.lineWidth = lineWidth;

      for (const u of units) {
        u.shown += (u.level - u.shown) * 0.12;
        u.level *= decay;
        // Respiración ambiental que viaja en diagonal + hinchazón por el puntero
        const s = 1 + wave * Math.sin(time * 0.0007 + u.cx * 0.004 + u.cy * 0.007) + swell * u.shown;
        const R = size * s;

        // Primero se borra la media luna de la ola (tapa lo que hay detrás); sin color de fondo
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.globalAlpha = 1;
        ctx!.beginPath();
        ctx!.arc(u.cx, u.cy, R, Math.PI, Math.PI * 2);
        ctx!.closePath();
        ctx!.fill();

        // Después, los arcos concéntricos
        ctx!.globalCompositeOperation = "source-over";
        for (let i = 1; i <= rings; i++) {
          ctx!.beginPath();
          ctx!.arc(u.cx, u.cy, (R * i) / rings, Math.PI, Math.PI * 2);
          setAlpha(alpha * mul * (0.55 + 0.45 * (i / rings)) * (1 + 0.8 * u.shown));
          ctx!.stroke();
        }
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
  }, [size, rings, swell, radius, wave, decay, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--seigaiha-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
