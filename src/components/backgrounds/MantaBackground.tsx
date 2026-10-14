import { useEffect, useRef } from "react";

export interface MantaBackgroundProps {
  /** Número de mantas (muchas pequeñas y lejanas, pocas grandes y cercanas) */
  count?: number;
  /** Longitud de referencia del cuerpo (px); cada manta varía entre 0.3x y 1.4x */
  size?: number;
  /** Velocidad de avance (px por fotograma); las lejanas van más despacio */
  speed?: number;
  /** Distancia a la que empiezan a esquivar el puntero (px, se suma parte de su tamaño) */
  avoid?: number;
  /** Suavizado del giro: cuanto más bajo, más lento se inclinan (0.005 muy lento, 0.05 rápido) */
  turn?: number;
  /** Opacidad del contorno de las mantas cercanas (0-1); las lejanas son más tenues */
  alpha?: number;
  lineWidth?: number;
  color?: string;
  background?: string;
  className?: string;
}

type Manta = {
  x: number;
  y: number;
  vy: number;
  homeY: number;
  angle: number;
  L: number;
  depth: number;
  speed: number;
  phase: number;
  flap: number;
  sign: number;
};

export default function MantaBackground({
  count = 12,
  size = 110,
  speed = 0.9,
  avoid = 170,
  turn = 0.015,
  alpha = 0.28,
  lineWidth = 1.2,
  color = "#000000",
  background = "#e0dad5",
  className,
}: MantaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let px = -9999;
    let py = -9999;
    let mantas: Manta[] = [];
    let needsSort = false;
    let raf = 0;

    function spawn(m: Manta, initial: boolean) {
      const u = Math.random();
      m.L = size * (0.3 + 1.1 * u * u);
      m.depth = m.L / (size * 1.4);
      m.speed = speed * (0.5 + 0.9 * m.depth);
      m.homeY = height * (0.1 + Math.random() * 0.8);
      m.y = m.homeY;
      m.x = initial ? Math.random() * width : -m.L * 1.4;
      m.vy = 0;
      m.angle = 0;
      m.phase = Math.random() * Math.PI * 2;
      m.flap = 0.02 + Math.random() * 0.02;
      m.sign = Math.random() < 0.5 ? -1 : 1;
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      mantas = Array.from({ length: count }, () => {
        const m = {} as Manta;
        spawn(m, true);
        return m;
      });
      mantas.sort((a, b) => a.depth - b.depth);
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
    }

    function update(m: Manta, time: number) {
      m.x += m.speed;
      m.phase += m.flap;
      const home = m.homeY + Math.sin(time * 0.0003 + m.phase) * height * 0.03;
      m.vy += (home - m.y) * 0.0004;
      const dx = m.x - px;
      const dy = m.y - py;
      const d = Math.hypot(dx, dy);
      const R = avoid * (0.5 + 0.5 * m.depth) + m.L * 0.6;
      if (d < R) {
        const k = 1 - d / R;
        m.vy += (dy === 0 ? m.sign : Math.sign(dy)) * k * k * 0.16;
      }
      m.vy *= 0.97;
      m.y += m.vy;
      const target = Math.max(-0.5, Math.min(0.5, Math.atan2(m.vy * 10, m.speed)));
      m.angle += (target - m.angle) * turn;
      if (m.x - m.L * 1.4 > width) {
        spawn(m, false);
        needsSort = true;
      }
    }

    function draw(m: Manta) {
      const L = m.L;
      const flap = Math.sin(m.phase);
      const tipX = -0.05 * L + 0.08 * L * flap;
      const tipY = 0.8 * L * (1 + 0.18 * flap);
      const a = alpha * (0.15 + 0.85 * Math.pow(m.depth, 1.4));
      ctx!.save();
      ctx!.lineWidth = lineWidth * (0.5 + 0.5 * m.depth);
      ctx!.translate(m.x, m.y);
      ctx!.rotate(m.angle);
      ctx!.beginPath();
      ctx!.moveTo(0.45 * L, 0);
      ctx!.quadraticCurveTo(0.3 * L, -0.45 * L, tipX, -tipY);
      ctx!.quadraticCurveTo(-0.15 * L, -0.25 * L, -0.4 * L, 0);
      ctx!.quadraticCurveTo(-0.15 * L, 0.25 * L, tipX, tipY);
      ctx!.quadraticCurveTo(0.3 * L, 0.45 * L, 0.45 * L, 0);
      ctx!.closePath();
      ctx!.globalAlpha = a * 0.25;
      ctx!.fill();
      ctx!.globalAlpha = a;
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.moveTo(-0.4 * L, 0);
      ctx!.quadraticCurveTo(
        -0.75 * L,
        Math.sin(m.phase * 0.7) * 0.1 * L,
        -1.1 * L,
        Math.sin(m.phase * 0.7 + 1) * 0.18 * L
      );
      ctx!.stroke();
      ctx!.restore();
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.fillStyle = color;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";
      for (const m of mantas) {
        update(m, time);
        draw(m);
      }
      if (needsSort) {
        mantas.sort((a, b) => a.depth - b.depth);
        needsSort = false;
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
  }, [count, size, speed, avoid, turn, alpha, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
