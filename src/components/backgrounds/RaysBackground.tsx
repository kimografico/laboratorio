import { useEffect, useRef } from "react";

export interface RaysBackgroundProps {
  /** Número de haces de luz */
  beams?: number;
  /** Anchura media de cada haz en el borde superior (px) */
  width?: number;
  /** Inclinación media de los haces (radianes, 0 = verticales) */
  tilt?: number;
  /** Cuánto se mecen los haces (1 = normal, 0 = quietos) */
  sway?: number;
  /** Cuánto se inclinan todos los haces hacia el puntero (paralaje) y cuánto se iluminan los más cercanos */
  follow?: number;
  /** Opacidad de los haces estrechos (0-1); los anchos que los rodean usan el 45% */
  alpha?: number;
  /** Opcional: fija el color de la luz. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Beam = {
  x: number; // posición de su centro en el borde superior (fracción del ancho)
  w: number; // anchura relativa
  tilt: number;
  fx: number;
  fy: number;
  px: number;
  py: number;
  boost: number; // iluminación extra por cercanía del puntero, suavizada
};

export default function RaysBackground({
  beams = 7,
  width = 120,
  tilt = 0.24,
  sway = 1,
  follow = 1,
  alpha = 0.09,
  color,
  className,
}: RaysBackgroundProps) {
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
    let tx = 0;
    let ty = 0;
    let sx = 0; // puntero suavizado
    let sy = 0;
    let list: Beam[] = [];
    let frame = 0;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      sx = w / 2;
      sy = h / 2;
      list = Array.from({ length: beams }, (_, i) => ({
        x: (i + 0.2 + 0.6 * Math.random()) / beams,
        w: 0.55 + 0.9 * Math.random(),
        tilt: tilt * (0.6 + 0.8 * Math.random()),
        fx: 0.00012 + Math.random() * 0.00018,
        fy: 0.0002 + Math.random() * 0.0003,
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        boost: 0,
      }));
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (!hasPointer) {
        sx = tx;
        sy = ty;
      }
      hasPointer = true;
    }

    // Un haz: cuadrilátero que se abre hacia abajo. Se pinta en color plano, sin degradado
    function beam(x: number, bw: number, ang: number) {
      const topY = -30;
      const botY = h + 30;
      const bx = x + Math.tan(ang) * (botY - topY);
      ctx!.beginPath();
      ctx!.moveTo(x - bw / 2, topY);
      ctx!.lineTo(x + bw / 2, topY);
      ctx!.lineTo(bx + bw * 0.8, botY);
      ctx!.lineTo(bx - bw * 0.8, botY);
      ctx!.closePath();
      ctx!.fill();
    }

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      // Los haces se mecen despacio: se calcula a 30 fps y los fotogramas impares conservan el dibujo anterior
      if (frame++ % 2 === 1) return;
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--rays-color").trim() || style.color;
      const k = style.getPropertyValue("--rays-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.fillStyle = ink;

      sx += (tx - sx) * 0.05;
      sy += (ty - sy) * 0.05;
      // Todos los haces se inclinan un poco hacia donde está el puntero
      const lean = hasPointer ? ((sx / w - 0.5) * -0.16 * follow) : 0;

      for (const b of list) {
        const ang = b.tilt + lean + Math.sin(time * b.fy + b.py) * 0.07 * sway;
        const x = (b.x + Math.sin(time * b.fx + b.px) * 0.03 * sway) * w;
        const bw = width * b.w * (1 + 0.12 * Math.sin(time * b.fy * 1.7 + b.px));
        // Los haces por los que pasa el puntero se iluminan: se mide la distancia a su eje a la altura del puntero
        let target = 0;
        if (hasPointer) {
          const xc = x + Math.tan(ang) * (sy + 30);
          const dx = sx - xc;
          target = Math.exp(-(dx * dx) / (2 * 110 * 110)) * follow;
        }
        b.boost += (target - b.boost) * 0.06;
        const a = alpha * mul * (1 + 1.1 * b.boost);
        ctx!.globalAlpha = Math.min(1, a * 0.45);
        beam(x, bw * 2.3, ang); // haz ancho y tenue alrededor...
        ctx!.globalAlpha = Math.min(1, a);
        beam(x, bw, ang); // ...y haz estrecho y más claro en el centro
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
  }, [beams, width, tilt, sway, follow, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--rays-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
