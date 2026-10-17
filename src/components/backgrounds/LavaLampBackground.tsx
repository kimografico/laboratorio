import { useEffect, useRef } from "react";

export interface LavaLampBackgroundProps {
  /** Número de burbujas de cera que suben y bajan */
  count?: number;
  /** Radio medio de las burbujas como fracción de la dimensión menor (0.05-0.25) */
  size?: number;
  /** Velocidad del tiempo */
  speed?: number;
  /** Cuánto calienta el puntero a las burbujas cercanas (0 = nada). Mantén pulsado para triplicar el calor */
  heat?: number;
  /** Suavidad del borde de la cera (0.01 = nítido, 0.2 = difuso) */
  softness?: number;
  /** Intensidad del halo tenue alrededor de la cera (0-0.6) */
  glow?: number;
  /** Charcos de cera fijos abajo y arriba, de los que se desprenden las burbujas */
  pool?: boolean;
  /** Opacidad de la cera (0-1) */
  opacity?: number;
  /** Color de la cera */
  color?: string;
  /** Color del centro caliente de cada burbuja */
  core?: string;
  background?: string;
  className?: string;
}

type Blob = { x: number; y: number; vx: number; vy: number; r: number; temp: number; phase: number };

function parseColor(color: string): [number, number, number] {
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.fillStyle = color;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

export default function LavaLampBackground({
  count = 12,
  size = 0.09,
  speed = 3,
  heat = 5,
  softness = 0.01,
  glow = 0.18,
  pool = true,
  opacity = 0.15,
  color = "#ffffff",
  core = "#ffffff",
  background = "#e0dad5",
  className,
}: LavaLampBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Campo de las metabolas a baja resolución; luego se amplía con suavizado
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;

    const [cr, cg, cb] = parseColor(color);
    const [kr, kg, kb] = parseColor(core);
    const OFF = -9999;
    const THR = 0.5;

    let width = 0;
    let height = 0;
    let px = OFF;
    let py = OFF;
    let tx = OFF;
    let ty = OFF;
    let last = -1;
    let pressed = false;
    let blobs: Blob[] = [];
    let raf = 0;

    function build() {
      const m = Math.min(width, height);
      blobs = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: height * (0.15 + Math.random() * 0.75),
        vx: 0,
        vy: 0,
        r: m * size * (0.55 + Math.random() * 0.9),
        temp: Math.random() - 0.5,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      off.width = Math.max(1, width);
      off.height = Math.max(1, height);
      build();
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (px === OFF) {
        px = tx;
        py = ty;
      }
    }

    // Dibuja una burbuja como degradado radial que aproxima el campo 1/d² de una metabola
    function splat(x: number, y: number, r: number) {
      const R = r * 1.9;
      const g = octx!.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.75)");
      g.addColorStop(0.6, "rgba(255,255,255,0.38)");
      g.addColorStop(0.8, "rgba(255,255,255,0.12)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      octx!.fillStyle = g;
      octx!.fillRect(x - R, y - R, R * 2, R * 2);
    }

    function animate(time: number) {
      const dt = (last < 0 ? 1 : Math.min((time - last) / 16.67, 3)) * speed;
      last = time;
      if (px !== OFF) {
        px += (tx - px) * 0.2;
        py += (ty - py) * 0.2;
      }

      const m = Math.min(width, height);
      const k = m / 700;
      const reach = m * 0.3;

      for (const b of blobs) {
        // Termodinámica: se calientan abajo, se enfrían arriba; lo caliente sube y lo frío baja
        // En la zona media la cera conserva su temperatura, así que sigue subiendo o bajando hasta llegar al otro extremo
        if (b.y > height * 0.75) b.temp += 0.008 * dt;
        else if (b.y < height * 0.25) b.temp -= 0.008 * dt;
        else b.temp += Math.sin(time * 0.0002 + b.phase) * 0.002 * dt;

        if (px !== OFF && heat > 0) {
          const d = Math.hypot(b.x - px, b.y - py);
          const h = pressed ? heat * 3 : heat;
          if (d < reach) b.temp += h * 0.03 * (1 - d / reach) * dt;
        }
        b.temp = Math.max(-1, Math.min(1, b.temp));

        b.vy -= b.temp * 0.018 * k * dt;
        b.vx += Math.sin(time * 0.0004 + b.phase) * 0.004 * k * dt;

        if (b.x < b.r * 0.3) b.vx += 0.03 * k * dt;
        if (b.x > width - b.r * 0.3) b.vx -= 0.03 * k * dt;
        if (b.y < b.r * 0.2) {
          b.vy += 0.05 * k * dt;
          b.temp = Math.min(b.temp, -0.3);
        }
        if (b.y > height - b.r * 0.2) {
          b.vy -= 0.05 * k * dt;
          b.temp = Math.max(b.temp, 0.3);
        }

        const damp = Math.pow(0.97, dt);
        b.vx *= damp;
        b.vy *= damp;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }

      octx!.globalCompositeOperation = "source-over";
      octx!.clearRect(0, 0, off.width, off.height);
      octx!.globalCompositeOperation = "lighter";
      for (const b of blobs) splat(b.x, b.y, b.r);

      if (pool) {
        // Ola ancha y poco profunda ocupando toda la parte inferior
        const depth = m * 0.12;
        const amp = depth * 0.45;
        const top = height - depth;
        const path = new Path2D();
        path.moveTo(0, height);
        const steps = 48;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const y =
            top +
            Math.sin(t * Math.PI * 2 + time * 0.0007) * amp +
            Math.sin(t * Math.PI * 5 - time * 0.0011) * amp * 0.35;
          path.lineTo(width * t, y);
        }
        path.lineTo(width, height);
        path.closePath();

        const poolGrad = octx!.createLinearGradient(0, top - amp, 0, height);
        poolGrad.addColorStop(0, "rgba(255,255,255,0.8)");
        poolGrad.addColorStop(0.6, "rgba(255,255,255,0.95)");
        poolGrad.addColorStop(1, "rgba(255,255,255,1)");
        octx!.fillStyle = poolGrad;
        octx!.fill(path);

        const T = m * 0.16;
        for (let i = 0; i < 2; i++) {
          splat(width * (0.3 + 0.4 * i) + Math.sin(time * 0.00035 + i) * width * 0.03, -T * 0.25, T);
        }
      }

      // Umbral: convierte el campo en cera con borde suave, centro más claro y un halo tenue
      const img = octx!.getImageData(0, 0, off.width, off.height);
      const d = img.data;
      const t0 = THR - softness;
      const t1 = THR + softness;
      for (let i = 0; i < d.length; i += 4) {
        const v = d[i + 3] / 255;
        if (v < 0.02) {
          d[i + 3] = 0;
          continue;
        }
        let a = 0;
        if (v >= t1) a = 1;
        else if (v > t0) {
          const x = (v - t0) / (t1 - t0);
          a = x * x * (3 - 2 * x);
        }
        const halo = v >= t0 ? glow : glow * (v / t0) * (v / t0);
        const mix = v > t1 ? Math.min(1, (v - t1) / (1 - t1)) * 0.9 : 0;
        d[i] = cr + (kr - cr) * mix;
        d[i + 1] = cg + (kg - cg) * mix;
        d[i + 2] = cb + (kb - cb) * mix;
        d[i + 3] = Math.max(a, halo) * opacity * 255;
      }
      octx!.putImageData(img, 0, 0);

      ctx!.clearRect(0, 0, width, height);
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "high";
      ctx!.drawImage(off, 0, 0, off.width, off.height, 0, 0, width, height);

      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onPointer(e.touches[0].clientX, e.touches[0].clientY);
    const onDown = () => {
      pressed = true;
    };
    const onUp = () => {
      pressed = false;
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchend", onUp);
    window.addEventListener("blur", onUp);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [count, size, speed, heat, softness, glow, pool, opacity, color, core]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
