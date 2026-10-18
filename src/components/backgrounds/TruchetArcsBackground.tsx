import { useEffect, useRef } from "react";

export interface TruchetArcsBackgroundProps {
  /** Tamaño de cada azulejo (px) */
  size?: number;
  /** Grosor de las bandas, como fracción del azulejo */
  band?: number;
  /** Alcance del puntero (px): los azulejos que toca giran 90° */
  radius?: number;
  /** Lo rápido que vuelven a su postura (0.9 = rápido, 0.99 = muy lento) */
  heal?: number;
  /** Giros espontáneos por segundo, para que el patrón esté vivo sin el ratón */
  idle?: number;
  /** Opacidad de las bandas (0-1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

export default function TruchetArcsBackground({
  size = 56,
  band = 0.15,
  radius = 130,
  heal = 0.96,
  idle = 3,
  alpha = 0.26,
  color,
  className,
}: TruchetArcsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let base = new Uint8Array(0); // orientación de cada azulejo (0 o 1): define el dibujo de reposo
    let level = new Float32Array(0); // petición de giro (la sube el puntero o un giro espontáneo y decae sola)
    let shown = new Float32Array(0); // giro actual (0-1 = 0-90°), con easing
    let lastX = -1;
    let lastY = -1;
    let frame = 0;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / size) + 1;
      rows = Math.ceil(h / size) + 1;
      const n = cols * rows;
      base = new Uint8Array(n).map(() => (Math.random() < 0.5 ? 0 : 1));
      level = new Float32Array(n);
      shown = new Float32Array(n);
    }

    // Los azulejos por los que pasa el puntero giran 90° (se mide la distancia al tramo recorrido)
    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const x0 = lastX < 0 ? x : lastX;
      const y0 = lastY < 0 ? y : lastY;
      lastX = x;
      lastY = y;
      const sx = x - x0;
      const sy = y - y0;
      const len2 = sx * sx + sy * sy;
      const c0 = Math.max(0, Math.floor((Math.min(x, x0) - radius) / size));
      const c1 = Math.min(cols - 1, Math.ceil((Math.max(x, x0) + radius) / size));
      const r0 = Math.max(0, Math.floor((Math.min(y, y0) - radius) / size));
      const r1 = Math.min(rows - 1, Math.ceil((Math.max(y, y0) + radius) / size));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const cx = (c + 0.5) * size;
          const cy = (r + 0.5) * size;
          const t = len2 > 0 ? Math.min(1, Math.max(0, ((cx - x0) * sx + (cy - y0) * sy) / len2)) : 0;
          const d = Math.hypot(cx - (x0 + t * sx), cy - (y0 + t * sy));
          if (d < radius) {
            const f = Math.min(1, Math.pow(1 - d / radius, 0.8) * 1.25);
            const i = r * cols + c;
            if (f > level[i]) level[i] = f;
          }
        }
      }
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      // Se calcula a 30 fps y los fotogramas impares conservan el dibujo anterior
      if (frame++ % 2 === 1) return;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--truchet-color").trim() || style.color;
      const k = style.getPropertyValue("--truchet-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.lineWidth = size * band;
      ctx!.lineCap = "butt"; // extremos planos: dos azulejos alineados se unen sin doblar la opacidad

      // Giros espontáneos: de vez en cuando un azulejo al azar gira y vuelve (el patrón respira sin el ratón)
      const spont = idle / 30;
      for (let n = Math.floor(spont) + (Math.random() < spont % 1 ? 1 : 0); n > 0; n--) {
        level[Math.floor(Math.random() * level.length)] = 1;
      }

      const half = size / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          shown[i] += (level[i] - shown[i]) * 0.18; // gira con easing
          level[i] *= heal; // y la petición se apaga sola
          if (level[i] < 0.002) level[i] = 0;
          const s = shown[i];
          // Cada azulejo son dos cuartos de circunferencia en esquinas opuestas; girarlo 90° da el otro dibujo
          const ang = (base[i] + s) * (Math.PI / 2);
          const cs = Math.cos(ang);
          const sn = Math.sin(ang);
          ctx!.setTransform(cs, sn, -sn, cs, (c + 0.5) * size, (r + 0.5) * size);
          ctx!.beginPath();
          ctx!.arc(-half, -half, half, 0, Math.PI / 2);
          ctx!.moveTo(0, half);
          ctx!.arc(half, half, half, Math.PI, Math.PI * 1.5);
          // Mientras gira brilla un poco más: da la sensación de superficie que se agita
          ctx!.globalAlpha = Math.min(1, alpha * mul * (1 + 0.9 * Math.sin(Math.PI * Math.min(1, s))));
          ctx!.stroke();
        }
      }
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
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
  }, [size, band, radius, heal, idle, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--truchet-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
