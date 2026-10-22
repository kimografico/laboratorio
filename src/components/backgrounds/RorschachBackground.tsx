import { useEffect, useId, useRef } from "react";
import { getInkDropScale } from "../../lib/ink";

export interface RorschachBackgroundProps {
  /** Tamaño */
  size?: number;
  /** Duración total heredada (s). @deprecated Use growTime, holdTime, and fadeTime instead. */
  life?: number;
  /** Emisión */
  emit?: number;
  /** Deriva */
  drift?: number;
  /** Velocidad de animación */
  speed?: number;
  /** Tiempo de crecimiento (s) */
  growTime?: number;
  /** Pausa en el tamaño máximo (s) */
  holdTime?: number;
  /** Tiempo de desvanecimiento (s) */
  fadeTime?: number;
  /** Multiplicador de expansión máxima */
  maxScale?: number;
  /** Multiplicador de tamaño al hacer clic */
  clickScale?: number;
  className?: string;
}

const DEFAULTS = {
  size: 22,
  emit: 25,
  drift: 12,
  speed: 1,
  growTime: 1.5,
  holdTime: 0.5,
  fadeTime: 2,
  maxScale: 1,
  clickScale: 3,
};

export default function RorschachBackground(props: RorschachBackgroundProps) {
  const {
    className,
    size,
    life,
    emit,
    drift,
    speed,
    growTime,
    holdTime,
    fadeTime,
    maxScale,
    clickScale,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterId = "rorschach-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const random = Math.random;
    const tau = Math.PI * 2;
    const legacyScale =
      growTime === undefined && holdTime === undefined && fadeTime === undefined && life !== undefined
        ? life / 4
        : 1;
    const settings = {
      size: size ?? DEFAULTS.size,
      emit: emit ?? DEFAULTS.emit,
      drift: drift ?? DEFAULTS.drift,
      speed: speed ?? DEFAULTS.speed,
      growTime: growTime ?? DEFAULTS.growTime * legacyScale,
      holdTime: holdTime ?? DEFAULTS.holdTime * legacyScale,
      fadeTime: fadeTime ?? DEFAULTS.fadeTime * legacyScale,
      maxScale: maxScale ?? DEFAULTS.maxScale,
      clickScale: clickScale ?? DEFAULTS.clickScale,
    };
    const totalLife = settings.growTime + settings.holdTime + settings.fadeTime;
    const ink = getComputedStyle(canvas).getPropertyValue("--fg").trim() || "#161a2b";
    const pointer = { x: -9999, y: -9999, on: false };
    let width = 0;
    let height = 0;
    let drops: { x: number; y: number; r: number; age: number; vx: number; vy: number }[] = [];
    let raf = 0;
    let last = 0;

    const dot = (x: number, y: number, radius: number) => {
      context.moveTo(x + radius, y);
      context.arc(x, y, radius, 0, tau);
    };

    const addDrop = (x: number, y: number, radius: number) => {
      drops.push({
        x,
        y,
        r: radius,
        age: 0,
        vx: (random() - 0.5) * settings.drift,
        vy: (random() - 0.5) * settings.drift,
      });
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      pointer.x = Math.min(x, rect.width - x);
      pointer.y = event.clientY - rect.top;
      pointer.on = x >= 0 && pointer.y >= 0 && x <= rect.width && pointer.y <= rect.height;
    };

    const onDown = (event: PointerEvent) => {
      onMove(event);
      if (pointer.on) addDrop(pointer.x, pointer.y, settings.size * settings.clickScale);
    };

    const resize = () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
      drops = [];
    };

    function loop(time: number) {
      const dt = Math.min(0.05, (time - last) / 1000 || 0);
      const step = dt * settings.speed;
      last = time;
      context.clearRect(0, 0, width, height);

      if (pointer.on && random() < dt * settings.emit) {
        addDrop(
          pointer.x + (random() - 0.5) * 20,
          pointer.y + (random() - 0.5) * 20,
          settings.size * (0.5 + random()),
        );
      }

      drops = drops.filter((drop) => (drop.age += step) < totalLife);
      for (const drop of drops) {
        drop.x += drop.vx * step;
        drop.y += drop.vy * step;
      }

      const drawDrops = () => {
        context.fillStyle = ink;
        context.beginPath();
        for (const drop of drops) {
          dot(
            drop.x,
            drop.y,
            drop.r *
              getInkDropScale(
                drop.age,
                settings.growTime,
                settings.holdTime,
                settings.fadeTime,
                settings.maxScale,
              ),
          );
        }
        context.fill();
      };

      drawDrops();
      context.save();
      context.translate(width, 0);
      context.scale(-1, 1);
      drawDrops();
      context.restore();
      raf = requestAnimationFrame(loop);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [size, life, emit, drift, speed, growTime, holdTime, fadeTime, maxScale, clickScale]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: "var(--panel)",
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={9} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
            />
          </filter>
        </defs>
      </svg>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          filter: `url(#${filterId})`,
        }}
      />
    </div>
  );
}
