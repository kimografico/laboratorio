import { useEffect, useRef } from "react";

export interface WaveLayersBackgroundProps {
  /** Número de capas de olas (de atrás adelante) */
  layers?: number;
  /** Altura de las olas de la capa más cercana (px); las de atrás son algo más bajas */
  height?: number;
  /** Velocidad de las olas (1 = normal, 0 = quietas). Las capas alternas avanzan en sentidos opuestos */
  speed?: number;
  /** Cuánto se levanta la ola bajo el puntero (px) */
  swell?: number;
  /** Anchura de la ola que levanta el puntero (px) */
  radius?: number;
  /** Opacidad de la capa de más atrás (0-1). Cada capa siguiente es más opaca */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Layer = {
  base: number; // altura de la cresta en reposo (fracción del alto)
  A: number; // altura de la ola (px)
  k1: number;
  k2: number;
  w1: number;
  w2: number;
  p1: number;
  p2: number;
};

export default function WaveLayersBackground({
  layers = 5,
  height = 34,
  speed = 1,
  swell = 60,
  radius = 170,
  alpha = 0.07,
  lineWidth = 1.2,
  color,
  className,
}: WaveLayersBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color, los tonos y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let list: Layer[] = [];
    let hasPointer = false;
    let tx = 0;
    let ty = 0;
    let bx = 0; // posición suavizada del puntero
    let by = 0;
    let amp = 0;
    let frame = 0;
    let raf = 0;
    const STEP = 8;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      bx = w / 2;
      by = h / 2;
      list = Array.from({ length: layers }, (_, i) => {
        const f = layers > 1 ? i / (layers - 1) : 1; // 0 = la de atrás, 1 = la de delante
        const dir = i % 2 === 0 ? 1 : -1;
        return {
          base: 0.3 + 0.12 * i * (5 / Math.max(5, layers)),
          A: height * (0.55 + 0.45 * f),
          k1: (Math.PI * 2) / (520 / (1 + 0.18 * i)),
          k2: (Math.PI * 2) / (230 / (1 + 0.1 * i)),
          w1: 0.0006 * (1 + 0.25 * i) * dir,
          w2: 0.0011 * (1 + 0.15 * i) * -dir,
          p1: Math.random() * Math.PI * 2,
          p2: Math.random() * Math.PI * 2,
        };
      });
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (!hasPointer) {
        bx = tx;
        by = ty;
      }
      hasPointer = true;
    }

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      // Las olas son lentas: se calcula a 30 fps y los fotogramas impares conservan el dibujo anterior
      if (frame++ % 2 === 1) return;
      ctx!.clearRect(0, 0, w, h);
      // Tema: color, tonos y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--waves-color").trim() || style.color;
      const k = style.getPropertyValue("--waves-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      // Tonos opcionales: un color plano por capa (--waves-tone-1 es la de atrás), definidos por la página
      const tones = list.map((_, i) => style.getPropertyValue(`--waves-tone-${i + 1}`).trim());
      const hasTones = tones.every(Boolean);

      bx += (tx - bx) * 0.07;
      by += (ty - by) * 0.07;
      amp += ((hasPointer ? 1 : 0) - amp) * 0.03;
      const t = time * speed;
      const r2 = radius * radius;

      // De atrás adelante: cada capa borra primero lo que cubre y se pinta después, así quedan tonos planos
      // (sin sumar opacidades) y no hace falta color de fondo
      for (let i = 0; i < list.length; i++) {
        const L = list[i];
        const f = list.length > 1 ? i / (list.length - 1) : 1;
        const baseY = L.base * h;
        // La ola bajo el puntero afecta sobre todo a la capa que está a su altura
        const near = Math.exp(-((by - baseY) * (by - baseY)) / (2 * 140 * 140)) + 0.25;
        ctx!.beginPath();
        for (let x = -STEP; x <= w + STEP; x += STEP) {
          const dx = x - bx;
          const bump = amp * swell * near * (0.5 + 0.5 * f) * Math.exp(-(dx * dx) / r2);
          const y = baseY + L.A * (Math.sin(x * L.k1 + t * L.w1 + L.p1) + 0.45 * Math.sin(x * L.k2 + t * L.w2 + L.p2)) - bump;
          if (x === -STEP) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.lineTo(w + STEP, h + 20);
        ctx!.lineTo(-STEP, h + 20);
        ctx!.closePath();
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.globalAlpha = 1;
        ctx!.fill();
        ctx!.globalCompositeOperation = "source-over";
        ctx!.fillStyle = hasTones ? tones[i] : ink;
        ctx!.strokeStyle = hasTones ? tones[i] : ink;
        ctx!.lineWidth = lineWidth;
        ctx!.lineJoin = "round";
        const fillA = hasTones ? mul : alpha * mul * (1 + 1.1 * i);
        ctx!.globalAlpha = Math.min(1, fillA);
        ctx!.fill();
        // Cresta algo más marcada para definir el borde de cada capa
        ctx!.globalAlpha = Math.min(1, fillA * 1.8);
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
  }, [layers, height, speed, swell, radius, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--waves-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
