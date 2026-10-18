import { useEffect, useRef } from "react";

export interface TileBackgroundProps {
  /** Tamaño de la celda (px) */
  size?: number;
  /** Espacio entre baldosas (px) */
  gap?: number;
  /** Distancia de influencia del puntero (px) */
  proximity?: number;
  /** Opacidad en reposo (0-1) */
  baseAlpha?: number;
  /** Opacidad máxima al paso del puntero (0-1) */
  maxAlpha?: number;
  /** Persistencia de la estela (0-1): más alto, estela más larga */
  decay?: number;
  /** Irregularidad (0-1): 0 = todas iguales */
  randomness?: number;
  /** Opacidad base de las baldosas (0-1) */
  alpha?: number;
  /** Opcional: fija el color de las baldosas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Tile = { x: number; y: number; level: number; shown: number; gain: number; reach: number; fade: number };

export default function TileBackground({
  size = 28,
  gap = 4,
  proximity = 140,
  baseAlpha = 0.04,
  maxAlpha = 0.22,
  decay = 0.97,
  randomness = 0.6,
  alpha = 0.22,
  color,
  className,
}: TileBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let tiles: Tile[] = [];
    let raf = 0;

    function build() {
      const columns = Math.ceil(width / size);
      const rows = Math.ceil(height / size);
      tiles = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          tiles.push({
            x: col * size,
            y: row * size,
            level: 0,
            shown: 0,
            gain: 1 - randomness * Math.random(),
            reach: 1 - randomness * 0.5 * Math.random(),
            fade: decay - randomness * 0.04 * Math.random(),
          });
        }
      }
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      build();
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      for (const t of tiles) {
        const d = Math.hypot(t.x + size / 2 - px, t.y + size / 2 - py);
        const influence = (1 - Math.min(d / (proximity * t.reach), 1)) * t.gain;
        t.level = Math.max(t.level, influence);
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--tile-color").trim() || style.color;
      const k = style.getPropertyValue("--tile-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.fillStyle = ink;
      const side = size - gap;
      for (const t of tiles) {
        t.shown += (t.level - t.shown) * 0.25;
        t.level *= t.fade;
        setAlpha((baseAlpha + t.shown * (maxAlpha - baseAlpha)) * alpha * mul);
        ctx!.fillRect(t.x + gap / 2, t.y + gap / 2, side, side);
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
  }, [size, gap, proximity, baseAlpha, maxAlpha, decay, randomness, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--tile-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
