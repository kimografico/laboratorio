import { useEffect, useRef } from "react";

export interface OrbitBackgroundProps {
  /** Número de partículas */
  count?: number;
  /** Velocidad orbital (px por fotograma) */
  speed?: number;
  /** Longitud de la estela (fotogramas) */
  tail?: number;
  /** Suavizado con el que el centro de gravedad sigue al puntero */
  ease?: number;
  /** Suavizado de la gravedad cerca del centro (px): evita que las partículas salgan disparadas */
  soft?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

const TAU = Math.PI * 2;
const BUCKETS = 4;

export default function OrbitBackground({
  count = 110,
  speed = 1.1,
  tail = 28,
  ease = 0.04,
  soft = 60,
  lineWidth = 1,
  color = "rgba(0, 0, 0, 0.5)",
  background = "#e0dad5",
  className,
}: OrbitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const g = speed * speed;
    const soft2 = soft * soft;
    const xs = new Float32Array(count);
    const ys = new Float32Array(count);
    const vxs = new Float32Array(count);
    const vys = new Float32Array(count);
    const hist = new Float32Array(count * tail * 2);

    let width = 0;
    let height = 0;
    let ax = 0;
    let ay = 0;
    let tx = 0;
    let ty = 0;
    let pointer = false;
    let head = 0;
    let raf = 0;

    function spawn(i: number) {
      const ang = Math.random() * TAU;
      const r = 60 + Math.random() * Math.min(width, height) * 0.4;
      const sp = speed * (0.75 + Math.random() * 0.5);
      xs[i] = ax + Math.cos(ang) * r;
      ys[i] = ay + Math.sin(ang) * r;
      vxs[i] = -Math.sin(ang) * sp;
      vys[i] = Math.cos(ang) * sp;
      for (let k = 0; k < tail; k++) {
        hist[(i * tail + k) * 2] = xs[i];
        hist[(i * tail + k) * 2 + 1] = ys[i];
      }
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      if (!pointer) {
        ax = tx = width / 2;
        ay = ty = height / 2;
      }
      for (let i = 0; i < count; i++) spawn(i);
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      pointer = true;
    }

    function animate(time: number) {
      if (!pointer) {
        tx = width / 2 + Math.cos(time * 0.0003) * width * 0.12;
        ty = height / 2 + Math.sin(time * 0.0004) * height * 0.12;
      }
      ax += (tx - ax) * ease;
      ay += (ty - ay) * ease;

      const far2 = Math.pow(Math.max(width, height) * 1.6, 2);
      head = (head + 1) % tail;

      for (let i = 0; i < count; i++) {
        const dx = ax - xs[i];
        const dy = ay - ys[i];
        const d2 = dx * dx + dy * dy;
        if (d2 > far2) {
          spawn(i);
          continue;
        }
        const k = g / (d2 + soft2);
        vxs[i] = (vxs[i] + dx * k) * 0.9995;
        vys[i] = (vys[i] + dy * k) * 0.9995;
        xs[i] += vxs[i];
        ys[i] += vys[i];
        hist[(i * tail + head) * 2] = xs[i];
        hist[(i * tail + head) * 2 + 1] = ys[i];
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";

      for (let b = 0; b < BUCKETS; b++) {
        const k0 = Math.ceil((b * (tail - 1)) / BUCKETS);
        const k1 = Math.ceil(((b + 1) * (tail - 1)) / BUCKETS);
        ctx!.beginPath();
        for (let i = 0; i < count; i++) {
          for (let k = k0; k < k1; k++) {
            const ia = (i * tail + ((head - k + tail) % tail)) * 2;
            const ib = (i * tail + ((head - k - 1 + tail) % tail)) * 2;
            ctx!.moveTo(hist[ia], hist[ia + 1]);
            ctx!.lineTo(hist[ib], hist[ib + 1]);
          }
        }
        ctx!.globalAlpha = Math.pow(1 - b / BUCKETS, 1.6);
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
  }, [count, speed, tail, ease, soft, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
