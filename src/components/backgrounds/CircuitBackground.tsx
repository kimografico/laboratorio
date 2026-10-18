import { useEffect, useRef } from "react";

export interface CircuitBackgroundProps {
  /** Separación de la cuadrícula a la que se ajustan las pistas (px) */
  grid?: number;
  /** Pasos de la cuadrícula que avanza cada pista por segundo */
  speed?: number;
  /** Longitud máxima de cada pista (en pasos de la cuadrícula) */
  maxLen?: number;
  /** Pistas nuevas por segundo que nacen solas en puntos al azar */
  ambient?: number;
  /** Distancia que debe recorrer el puntero para que nazca una pista nueva (px) */
  spawnDist?: number;
  /** Segundos que tarda en desvanecerse una pista una vez terminada */
  fade?: number;
  /** Máximo de pistas a la vez */
  maxTraces?: number;
  lineWidth?: number;
  /** Opacidad de las pistas y los puntos (0-1) */
  alpha?: number;
  /** Opcional: fija el color de las pistas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Trace = { pts: number[]; dir: number; run: number; target: number; done: boolean; doneAt: number };

const DIRS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];
const TAU = Math.PI * 2;

export default function CircuitBackground({
  grid = 10,
  speed = 25,
  maxLen = 60,
  ambient = 1.2,
  spawnDist = 30,
  fade = 5,
  maxTraces = 200,
  lineWidth = 1.3,
  alpha = 0.4,
  color,
  className,
}: CircuitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let gx = 0;
    let gy = 0;
    let cols = 0;
    let rows = 0;
    let traces: Trace[] = [];
    let lastX = -1;
    let lastY = -1;
    let dist = 0;
    let stepAcc = 0;
    let spawnAcc = 0;
    let last = -1;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.floor(width / grid);
      rows = Math.floor(height / grid);
      gx = (width - cols * grid) / 2;
      gy = (height - rows * grid) / 2;
      traces = [];
    }

    function spawn(i: number, j: number) {
      if (i < 0 || j < 0 || i > cols || j > rows) return;
      traces.push({
        pts: [i, j],
        dir: Math.floor(Math.random() * 8),
        run: 0,
        target: Math.floor(maxLen * (0.5 + Math.random() * 0.7)),
        done: false,
        doneAt: 0,
      });
      if (traces.length > maxTraces) traces.shift();
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (lastX >= 0) dist += Math.hypot(x - lastX, y - lastY);
      lastX = x;
      lastY = y;
      if (dist >= spawnDist) {
        dist = 0;
        spawn(Math.round((x - gx) / grid), Math.round((y - gy) / grid));
      }
    }

    function advance(t: Trace, time: number) {
      if (t.run <= 0) {
        const r = Math.random();
        if (r < 0.25) t.dir = (t.dir + 1) & 7;
        else if (r < 0.5) t.dir = (t.dir + 7) & 7;
        t.run = 2 + Math.floor(Math.random() * 6);
      }
      const n = t.pts.length;
      const i = t.pts[n - 2] + DIRS[t.dir][0];
      const j = t.pts[n - 1] + DIRS[t.dir][1];
      t.run--;
      if (i < 0 || j < 0 || i > cols || j > rows) {
        t.done = true;
        t.doneAt = time;
        return;
      }
      t.pts.push(i, j);
      if (t.pts.length / 2 >= t.target || Math.random() < 0.008) {
        t.done = true;
        t.doneAt = time;
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      const dt = last < 0 ? 16.67 : Math.min(time - last, 100);
      last = time;

      spawnAcc += (dt * ambient) / 1000;
      while (spawnAcc >= 1) {
        spawn(Math.floor(Math.random() * (cols + 1)), Math.floor(Math.random() * (rows + 1)));
        spawnAcc -= 1;
      }

      stepAcc += (dt * speed) / 1000;
      const steps = Math.floor(stepAcc);
      stepAcc -= steps;
      for (let s = 0; s < steps; s++) for (const t of traces) if (!t.done) advance(t, time);
      traces = traces.filter((t) => !t.done || time - t.doneAt < fade * 1000);

      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--circuit-color").trim() || style.color;
      const k = style.getPropertyValue("--circuit-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "miter";
      const pad = grid * 0.22;

      for (const t of traces) {
        const a = t.done ? 1 - (time - t.doneAt) / (fade * 1000) : 1;
        setAlpha(Math.max(0, a) * alpha * mul);
        ctx!.beginPath();
        ctx!.moveTo(gx + t.pts[0] * grid, gy + t.pts[1] * grid);
        for (let k = 2; k < t.pts.length; k += 2) ctx!.lineTo(gx + t.pts[k] * grid, gy + t.pts[k + 1] * grid);
        ctx!.stroke();

        const nn = t.pts.length;
        const hx = gx + t.pts[nn - 2] * grid;
        const hy = gy + t.pts[nn - 1] * grid;
        ctx!.beginPath();
        ctx!.arc(gx + t.pts[0] * grid, gy + t.pts[1] * grid, pad * 0.6, 0, TAU);
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(hx, hy, t.done ? pad : pad * 0.6, 0, TAU);
        if (t.done) ctx!.stroke();
        else ctx!.fill();
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
  }, [grid, speed, maxLen, ambient, spawnDist, fade, maxTraces, lineWidth, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--circuit-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
