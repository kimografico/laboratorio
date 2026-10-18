import { useEffect, useRef } from "react";

export interface TileSpinBackgroundProps {
  /** Tamaño de la celda (px) */
  size?: number;
  /** Espacio entre baldosas (px) */
  gap?: number;
  /** Distancia de influencia del puntero (px) */
  proximity?: number;
  /** Cuánto se encoge la baldosa en el máximo (0-1): 0.65 = queda al 35% */
  shrink?: number;
  /** Giro máximo (grados). Cada baldosa gira en un sentido y con una intensidad propios */
  rotation?: number;
  /** Persistencia de la estela (0-1): más alto, estela más larga */
  decay?: number;
  /** Irregularidad (0-1): 0 = todas iguales */
  randomness?: number;
  /** Opacidad base de las baldosas (0-1) */
  alpha?: number;
  /** Variación aleatoria fija de la opacidad de cada baldosa */
  alphaJitter?: number;
  color?: string;
  background?: string;
  className?: string;
}

type Tile = {
  x: number;
  y: number;
  level: number;
  shown: number;
  gain: number;
  reach: number;
  fade: number;
  dir: number;
  alpha: number;
};

export default function TileSpinBackground({
  size = 28,
  gap = 4,
  proximity = 125,
  shrink = 1,
  rotation = 180,
  decay = 0.98,
  randomness = 0.85,
  alpha = 0.08,
  alphaJitter = 0.04,
  color = "#000000",
  background = "#e0dad5",
  className,
}: TileSpinBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxAngle = (rotation * Math.PI) / 180;
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
            x: col * size + size / 2,
            y: row * size + size / 2,
            level: 0,
            shown: 0,
            gain: 1 - randomness * Math.random(),
            reach: 1 - randomness * 0.5 * Math.random(),
            fade: decay - randomness * 0.04 * Math.random(),
            dir: (Math.random() < 0.5 ? -1 : 1) * (0.5 + 0.5 * Math.random()),
            alpha: Math.max(0.01, alpha + (Math.random() * 2 - 1) * alphaJitter),
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
        const d = Math.hypot(t.x - px, t.y - py);
        const influence = (1 - Math.min(d / (proximity * t.reach), 1)) * t.gain;
        t.level = Math.max(t.level, influence);
      }
    }

    function animate() {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = color;
      const side = size - gap;
      for (const t of tiles) {
        t.shown += (t.level - t.shown) * 0.2;
        t.level *= t.fade;
        const s = side * (1 - shrink * t.shown);
        const a = t.dir * maxAngle * t.shown;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        ctx!.globalAlpha = t.alpha;
        ctx!.setTransform(cos, sin, -sin, cos, t.x, t.y);
        ctx!.fillRect(-s / 2, -s / 2, s, s);
      }
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
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
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [size, gap, proximity, shrink, rotation, decay, randomness, alpha, alphaJitter, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
