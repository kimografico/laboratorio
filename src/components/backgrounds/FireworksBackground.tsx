import { useEffect, useRef } from "react";

export interface FireworksBackgroundProps {
  /** Cohetes automáticos por segundo (0 = solo los lanza el puntero) */
  rate?: number;
  /** Estrellas que nacen en cada explosión */
  burst?: number;
  /** Gravedad (px/s²) */
  gravity?: number;
  /** Fricción por fotograma a 60 fps (0.9 se frena pronto, 0.999 dura casi eternamente) */
  drag?: number;
  /** Vida de cada estrella (s) */
  life?: number;
  /** Grosor de las chispas (px) */
  size?: number;
  /** Explosiones de colores en lugar de un solo color */
  rainbow?: boolean;
  /** Opcional: fija el color de los cohetes y chispas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Spark = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  age: number;
  max: number;
  w: number;
  paint: string;
};

type Rocket = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  target: number;
};

export default function FireworksBackground({
  rate = 1.3,
  burst = 150,
  gravity = 90,
  drag = 0.99,
  life = 1.7,
  size = 1.6,
  rainbow = true,
  color,
  className,
}: FireworksBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = -1;
    let acc = 0;
    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      rockets.length = 0;
      sparks.length = 0;
    }

    function paintFor() {
      if (!rainbow) {
        const ink = style.getPropertyValue("--fireworks-color").trim() || style.color;
        return ink;
      }
      const muted = ["#d89f3f", "#b44f4f", "#4f8bb8", "#5a9f5a", "#a0895f", "#d89f5f", "#8f7bb8", "#b88f5f"];
      return muted[Math.floor(Math.random() * muted.length)];
    }

    function launch(tx?: number, ty?: number) {
      const x = tx ?? w * 0.08 + Math.random() * w * 0.84;
      const target = ty ?? h * (0.12 + Math.random() * 0.3);
      const gEff = gravity * 0.5;
      const dy = Math.max(50, h - target);
      rockets.push({
        x,
        y: h + 6,
        px: x,
        py: h + 6,
        vx: (Math.random() - 0.5) * 46,
        vy: -Math.sqrt(2 * gEff * dy),
        target,
      });
    }

    function explode(x: number, y: number, paint: string, count: number) {
      const smax = Math.min(w, h) * 0.36;
      const n = Math.round(count * (0.75 + Math.random() * 0.5));
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const slow = i % 7 === 0;
        const s = (slow ? 0.08 + Math.random() * 0.12 : 0.2 + Math.pow(Math.random(), 0.55) * 0.8) * smax;
        const willow = Math.random() < 0.22;
        sparks.push({
          x,
          y,
          px: x,
          py: y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s * 0.92,
          age: 0,
          max: life * (willow ? 1.8 : 0.6 + Math.random() * 0.7),
          w: size * (willow ? 0.7 : 0.75 + Math.random() * 0.7),
          paint,
        });
      }
      if (sparks.length > 5200) sparks.splice(0, sparks.length - 5200);
    }

    function animate(time: number) {
      const dt = last < 0 ? 0.0167 : Math.min((time - last) / 1000, 0.05);
      last = time;

      acc += dt * rate;
      while (acc >= 1) {
        launch();
        acc -= 1;
      }

      const gEff = gravity * 0.5;
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.px = r.x;
        r.py = r.y;
        r.vy += gEff * dt;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        if (r.y <= r.target || r.vy >= -16) {
          explode(r.x, r.y, paintFor(), burst);
          rockets.splice(i, 1);
        }
      }

      const df = Math.pow(drag, dt * 60);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.age += dt;
        if (s.age >= s.max) {
          sparks.splice(i, 1);
          continue;
        }
        s.vx *= df;
        s.vy *= df;
        s.vy += gravity * dt;
        s.px = s.x;
        s.py = s.y;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }

      ctx!.clearRect(0, 0, w, h);
      ctx!.lineCap = "round";
      // Tinta y opacidad leídas del CSS de la página en cada fotograma (solo cuando no hay arcoíris)
      const ink = style.getPropertyValue("--fireworks-color").trim() || style.color;
      const k = style.getPropertyValue("--fireworks-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;

      for (const r of rockets) {
        ctx!.globalAlpha = 0.85;
        ctx!.strokeStyle = rainbow ? paintFor() : ink;
        ctx!.lineWidth = size * 1.4;
        ctx!.beginPath();
        ctx!.moveTo(r.px, r.py);
        ctx!.lineTo(r.x, r.y);
        ctx!.stroke();
      }

      for (const s of sparks) {
        const t = s.age / s.max;
        const a = Math.pow(1 - t, 1.5);
        if (a < 0.02) continue;
        ctx!.strokeStyle = s.paint;
        ctx!.lineWidth = s.w * 3.4;
        ctx!.globalAlpha = a * 0.2 * mul;
        ctx!.beginPath();
        ctx!.moveTo(s.px, s.py);
        ctx!.lineTo(s.x, s.y);
        ctx!.stroke();
        ctx!.lineWidth = s.w;
        ctx!.globalAlpha = a * mul;
        ctx!.beginPath();
        ctx!.moveTo(s.px, s.py);
        ctx!.lineTo(s.x, s.y);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(animate);
    }

    function onDown(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      launch(x, Math.max(h * 0.06, Math.min(y, h * 0.85)));
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onDown(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onDown(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener("mousedown", onMouse);
    window.addEventListener("touchstart", onTouch, { passive: true });

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousedown", onMouse);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [rate, burst, gravity, drag, life, size, rainbow]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--fireworks-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
