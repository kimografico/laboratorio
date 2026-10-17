import { useEffect, useRef } from "react";

export interface StringArtBackgroundProps {
  /** Puntos por circunferencia: más puntos, hilos más finos y más coste */
  points?: number;
  /** Número de circunferencias superpuestas (cada una con su propio ritmo) */
  circles?: number;
  /** Radio de la circunferencia principal, como fracción del lado menor del contenedor */
  radius?: number;
  /** Velocidad de la transformación de la figura (1 = normal, 0 = quieta) */
  speed?: number;
  /** Cuánto elige el puntero la figura (0 = no reacciona) */
  follow?: number;
  /** Opacidad de cada hilo (0-1); suman al cruzarse y dibujan las envolventes */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

export default function StringArtBackground({
  points = 220,
  circles = 2,
  radius = 0.62,
  speed = 1,
  follow = 1,
  alpha = 0.07,
  lineWidth = 1,
  color,
  className,
}: StringArtBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let hasPointer = false;
    let tx = 0.5;
    let ty = 0.5;
    let sx = 0.5; // posición del puntero suavizada (0-1)
    let sy = 0.5;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = Math.min(1, Math.max(0, (clientX - rect.left) / w));
      ty = Math.min(1, Math.max(0, (clientY - rect.top) / h));
      hasPointer = true;
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--string-color").trim() || style.color;
      const k = style.getPropertyValue("--string-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.lineWidth = lineWidth;
      ctx!.globalAlpha = Math.min(1, alpha * mul);

      sx += (tx - sx) * 0.03;
      sy += (ty - sy) * 0.03;
      const t = time * speed;
      const mix = hasPointer ? Math.min(1, follow) : 0;
      const R0 = Math.min(w, h) * radius;

      for (let c = 0; c < circles; c++) {
        // "Tabla de multiplicar" sobre una circunferencia: el punto i se une con el punto m·i. Con m=2 sale una
        // cardioide, con m=3 una nefroide... y al variar m de forma continua la figura se transforma sin saltos
        const idle = 2.4 + 2.2 * (0.5 + 0.5 * Math.sin(t * 0.00007 * (1 + c * 0.45) + c * 1.7));
        const m = idle + (1.5 + 4.5 * (c % 2 === 0 ? sx : 1 - sx) - idle) * mix;
        const R = R0 * (1 - 0.32 * c);
        // El centro se desplaza un poco hacia el puntero (paralaje) y la figura gira muy despacio
        const cx = w / 2 + (sx - 0.5) * w * 0.12 * (1 + c);
        const cy = h / 2 + (sy - 0.5) * h * 0.12 * (1 + c);
        const rot = t * 0.00002 * (c % 2 === 0 ? 1 : -1);
        ctx!.beginPath();
        for (let i = 0; i < points; i++) {
          const th = (i / points) * Math.PI * 2 + rot;
          const th2 = m * (i / points) * Math.PI * 2 + rot;
          ctx!.moveTo(cx + Math.cos(th) * R, cy + Math.sin(th) * R);
          ctx!.lineTo(cx + Math.cos(th2) * R, cy + Math.sin(th2) * R);
        }
        ctx!.stroke();
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
  }, [points, circles, radius, speed, follow, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--string-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
