import { useEffect, useRef } from "react";

export interface ShoalBackgroundProps {
  /** Número de peces */
  count?: number;
  /** Tamaño base de cada pez (px) */
  size?: number;
  /** Velocidad de crucero */
  speed?: number;
  /** Radio de evitación alrededor del puntero (px) */
  avoid?: number;
  /** Cohesión del cardumen */
  cohesion?: number;
  /** Opacidad general */
  alpha?: number;
  /** Grosor del trazo */
  lineWidth?: number;
  /** Color de los peces */
  color?: string;
  /** Color de fondo */
  background?: string;
  className?: string;
}

type Fish = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number;
  length: number;
  phase: number;
};

export default function ShoalBackground({
  count = 500,
  size = 15,
  speed = 1.5,
  avoid = 150,
  cohesion = 1.2,
  alpha = 0.32,
  lineWidth = 1,
  color = "#000000",
  background = "#e0dad5",
  className,
}: ShoalBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let fish: Fish[] = [];
    let raf = 0;

    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    function build() {
      const seeds = [
        { x: Math.random() * width, y: Math.random() * height },
        { x: Math.random() * width, y: Math.random() * height },
      ];
      fish = Array.from({ length: count }, (_, i) => {
        const seed = seeds[i % 2];
        const depth = 0.4 + 0.6 * Math.random();
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * 140;
        const v = speed * (0.6 + 0.4 * depth);
        return {
          x: seed.x + Math.cos(angle) * distance,
          y: seed.y + Math.sin(angle) * distance,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          depth,
          length: size * (0.5 + 0.7 * depth),
          phase: Math.random() * Math.PI * 2,
        };
      }).sort((a, b) => a.depth - b.depth);
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      build();
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      pointerX = clientX - rect.left;
      pointerY = clientY - rect.top;
    }

    function steer(f: Fish, targetX: number, targetY: number) {
      const neighborhood = (size * 5) ** 2;
      const personal = (size * 1.4) ** 2;
      let alignX = 0;
      let alignY = 0;
      let centerX = 0;
      let centerY = 0;
      let neighbors = 0;
      let separationX = 0;
      let separationY = 0;

      for (const other of fish) {
        if (other === f) continue;
        const dx = other.x - f.x;
        const dy = other.y - f.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > neighborhood) continue;
        neighbors++;
        alignX += other.vx;
        alignY += other.vy;
        centerX += other.x;
        centerY += other.y;
        if (d2 < personal) {
          const weight = 1 / (d2 + 1);
          separationX -= dx * weight;
          separationY -= dy * weight;
        }
      }

      let ax = separationX * size * 0.09;
      let ay = separationY * size * 0.09;
      if (neighbors > 0) {
        ax += (alignX / neighbors - f.vx) * 0.045 + (centerX / neighbors - f.x) * 0.0007 * cohesion;
        ay += (alignY / neighbors - f.vy) * 0.045 + (centerY / neighbors - f.y) * 0.0007 * cohesion;
      }
      ax += (targetX - f.x) * 0.00004 * cohesion;
      ay += (targetY - f.y) * 0.00004 * cohesion;

      const px = f.x - pointerX;
      const py = f.y - pointerY;
      const pd = Math.hypot(px, py);
      if (pd < avoid && pd > 0) {
        const t = 1 - pd / avoid;
        const push = (t * t * 0.3) / pd;
        ax += px * push;
        ay += py * push;
      }

      const margin = 80;
      const edge = 0.0009;
      if (f.x < margin) ax += (margin - f.x) * edge;
      else if (f.x > width - margin) ax -= (f.x - (width - margin)) * edge;
      if (f.y < margin) ay += (margin - f.y) * edge;
      else if (f.y > height - margin) ay -= (f.y - (height - margin)) * edge;

      f.vx += ax;
      f.vy += ay;

      const current = Math.hypot(f.vx, f.vy) || 0.0001;
      const target = speed * (0.6 + 0.4 * f.depth);
      const next = Math.min(current + (target - current) * 0.04, target * 1.7);
      f.vx = (f.vx / current) * next;
      f.vy = (f.vy / current) * next;
      f.x += f.vx;
      f.y += f.vy;
      f.phase += 0.15 + current * 0.12;
    }

    function draw(f: Fish) {
      const a = alpha * (0.15 + 0.85 * Math.pow(f.depth, 1.6));
      const angle = Math.atan2(f.vy, f.vx);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const L = f.length;
      const wag = Math.sin(f.phase) * 0.1 * L;

      ctx!.setTransform(cos, sin, -sin, cos, f.x, f.y);
      ctx!.lineWidth = lineWidth * (0.6 + 0.4 * f.depth);
      ctx!.beginPath();
      ctx!.moveTo(0.5 * L, 0);
      ctx!.quadraticCurveTo(0.2 * L, -0.24 * L, -0.3 * L, -0.07 * L);
      ctx!.lineTo(-0.58 * L, -0.2 * L + wag);
      ctx!.lineTo(-0.46 * L + wag * 0.4, 0);
      ctx!.lineTo(-0.58 * L, 0.2 * L + wag);
      ctx!.lineTo(-0.3 * L, 0.07 * L);
      ctx!.quadraticCurveTo(0.2 * L, 0.24 * L, 0.5 * L, 0);
      ctx!.closePath();
      ctx!.globalAlpha = clamp(a * 0.3);
      ctx!.fill();
      ctx!.globalAlpha = clamp(a);
      ctx!.stroke();
    }

    function animate(ts: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = color;
      ctx!.fillStyle = color;
      ctx!.lineJoin = "round";

      const targetX = width * (0.5 + 0.35 * Math.sin(ts * 0.00007));
      const targetY = height * (0.5 + 0.3 * Math.sin(ts * 0.00011 + 1));
      for (const f of fish) steer(f, targetX, targetY);
      for (const f of fish) draw(f);

      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => setPointer(e.touches[0].clientX, e.touches[0].clientY);
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
  }, [count, size, speed, avoid, cohesion, alpha, lineWidth, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
