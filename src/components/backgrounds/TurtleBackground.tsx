import { useEffect, useRef } from "react";

export interface TurtleBackgroundProps {
  /** Tortugas cercanas: con caparazón dibujado, cabeza y aletas */
  near?: number;
  /** Tortugas lejanas: pequeñas y muy tenues, solo una silueta */
  far?: number;
  /** Longitud de la tortuga más cercana (px) */
  size?: number;
  /** Velocidad media de nado (px por fotograma): avanzan a impulsos con cada aletazo */
  speed?: number;
  /** Distancia a la que se apartan del puntero (px) */
  avoid?: number;
  /** Opacidad del contorno de las cercanas (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color de las tortugas. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Turtle = {
  x: number;
  y: number;
  h: number; // rumbo
  L: number;
  depth: number;
  far: boolean;
  speed: number;
  phase: number; // fase del aletazo
  v: number; // velocidad actual, suavizada
};

const diff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

export default function TurtleBackground({
  near = 3,
  far = 3,
  size = 210,
  speed = 0.55,
  avoid = 230,
  alpha = 0.3,
  lineWidth = 1.2,
  color,
  className,
}: TurtleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let mul = 1;
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let hasPointer = false;
    let turtles: Turtle[] = [];
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const kinds: boolean[] = [...Array(near).fill(false), ...Array(far).fill(true)];
      turtles = kinds
        .map((isFar) => {
          const depth = isFar ? 0.3 + 0.15 * Math.random() : 0.65 + 0.35 * Math.random();
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            h: Math.random() * Math.PI * 2,
            L: size * (0.35 + 0.65 * depth) * (0.85 + 0.3 * Math.random()),
            depth,
            far: isFar,
            speed: speed * (0.6 + 0.5 * depth),
            phase: Math.random() * Math.PI * 2,
            v: 0,
          };
        })
        .sort((a, b) => a.depth - b.depth); // las lejanas se dibujan primero
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      hasPointer = true;
    }

    function update(t: Turtle, time: number) {
      // Rumbo: vaivén muy lento, giro suave para apartarse del puntero y de los bordes
      let turn = Math.sin(time * 0.00033 + t.phase * 1.3) * 0.006 + Math.sin(time * 0.00071 + t.phase) * 0.003;
      if (hasPointer) {
        const dx = t.x - px;
        const dy = t.y - py;
        const d = Math.hypot(dx, dy);
        const R = avoid * (0.5 + 0.5 * t.depth);
        if (d < R) turn += diff(t.h, Math.atan2(dy, dx)) * 0.03 * (1 - d / R);
      }
      const m = 110;
      if (t.x < m || t.x > w - m || t.y < m || t.y > h - m) turn += diff(t.h, Math.atan2(h / 2 - t.y, w / 2 - t.x)) * 0.02;
      t.h += Math.max(-0.03, Math.min(0.03, turn));
      // Aletazo: la fase avanza despacio y la tortuga se impulsa en la parte fuerte de cada brazada
      t.phase += 0.045;
      const power = Math.pow(Math.max(0, Math.sin(t.phase - 0.4)), 1.2);
      const target = t.speed * (0.35 + 1.1 * power);
      t.v += (target - t.v) * 0.08;
      t.x += Math.cos(t.h) * t.v;
      t.y += Math.sin(t.h) * t.v;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    // Aleta: hoja alargada desde el pivote, curvada hacia atrás. Coordenadas locales (1 = longitud de la tortuga)
    function flipper(ox: number, oy: number, ang: number, len: number, wid: number) {
      const dx = Math.cos(ang);
      const dy = Math.sin(ang);
      const tipx = ox + dx * len - len * 0.25;
      const tipy = oy + dy * len;
      ctx!.beginPath();
      ctx!.moveTo(ox, oy);
      ctx!.quadraticCurveTo(ox + dx * len * 0.5 - dy * wid - len * 0.05, oy + dy * len * 0.5 + dx * wid, tipx, tipy);
      ctx!.quadraticCurveTo(ox + dx * len * 0.5 + dy * wid * 0.6 - len * 0.2, oy + dy * len * 0.5 - dx * wid * 0.6, ox - 0.02, oy);
      ctx!.closePath();
    }

    function draw(t: Turtle) {
      const a = alpha * mul * (0.12 + 0.88 * Math.pow(t.depth, 1.5));
      const c = Math.cos(t.h) * t.L;
      const s = Math.sin(t.h) * t.L;
      ctx!.setTransform(c, s, -s, c, t.x, t.y); // en adelante, 1 unidad = la longitud de la tortuga
      ctx!.lineWidth = (lineWidth * (0.5 + 0.5 * t.depth)) / t.L;
      const sw = 0.45 + 0.5 * Math.sin(t.phase); // barrido de las aletas delanteras (se mueven a la vez)
      const sw2 = 0.35 * Math.sin(t.phase + Math.PI); // las traseras, a contrafase

      // Aletas: delanteras largas y traseras pequeñas
      for (const side of [-1, 1]) {
        flipper(0.14, side * 0.19, side * (Math.PI / 2 + 0.05) + -side * sw, 0.36, 0.085);
        setAlpha(a * 0.28);
        ctx!.fill();
        if (!t.far) {
          setAlpha(a * 0.8);
          ctx!.stroke();
        }
        flipper(-0.19, side * 0.12, side * (Math.PI / 2 + 0.55) + side * sw2, 0.15, 0.04);
        setAlpha(a * 0.28);
        ctx!.fill();
        if (!t.far) {
          setAlpha(a * 0.8);
          ctx!.stroke();
        }
      }

      // Cola
      ctx!.beginPath();
      ctx!.moveTo(-0.27, 0.025);
      ctx!.lineTo(-0.37, 0);
      ctx!.lineTo(-0.27, -0.025);
      ctx!.closePath();
      setAlpha(a * 0.3);
      ctx!.fill();

      // Caparazón: óvalo algo más ancho delante y más estrecho detrás
      const N = 28;
      ctx!.beginPath();
      for (let k = 0; k < N; k++) {
        const th = (k / N) * Math.PI * 2;
        const cs = Math.cos(th);
        const sn = Math.sin(th);
        const back = cs < 0 ? cs * cs : 0;
        const x = -0.02 + 0.27 * cs * (1 + 0.2 * back * (cs < 0 ? 1 : 0));
        const y = 0.22 * sn * (0.84 + 0.16 * (0.5 + 0.5 * cs)) * (1 - 0.3 * back);
        if (k === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();
      setAlpha(a * (t.far ? 0.5 : 0.3));
      ctx!.fill();
      if (!t.far) {
        setAlpha(a);
        ctx!.stroke();
        // Escudos: contorno interior y líneas radiales que forman las placas del caparazón
        ctx!.beginPath();
        ctx!.ellipse(-0.02, 0, 0.19, 0.145, 0, 0, Math.PI * 2);
        ctx!.ellipse(-0.02, 0, 0.085, 0.07, 0, 0, Math.PI * 2);
        for (let k = 0; k < 6; k++) {
          const th = (k / 6) * Math.PI * 2 + Math.PI / 6;
          ctx!.moveTo(-0.02 + Math.cos(th) * 0.085, Math.sin(th) * 0.07);
          ctx!.lineTo(-0.02 + Math.cos(th) * 0.19, Math.sin(th) * 0.145);
        }
        setAlpha(a * 0.5);
        ctx!.stroke();

        // Cabeza con cuello y ojos
        ctx!.beginPath();
        ctx!.ellipse(0.35, 0, 0.075, 0.058, 0, 0, Math.PI * 2);
        setAlpha(a * 0.35);
        ctx!.fill();
        setAlpha(a);
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(0.375, 0.026, 0.009, 0, Math.PI * 2);
        ctx!.arc(0.375, -0.026, 0.009, 0, Math.PI * 2);
        setAlpha(a);
        ctx!.fill();
      } else {
        ctx!.beginPath();
        ctx!.ellipse(0.35, 0, 0.075, 0.058, 0, 0, Math.PI * 2);
        setAlpha(a * 0.5);
        ctx!.fill();
      }
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
    }

    function animate(time: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--turtle-color").trim() || style.color;
      const k = style.getPropertyValue("--turtle-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      for (const t of turtles) {
        update(t, time);
        draw(t);
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
  }, [near, far, size, speed, avoid, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--turtle-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
