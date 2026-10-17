import { useEffect, useRef } from "react";

export interface StarfishBackgroundProps {
  /** Número de estrellas de mar */
  count?: number;
  /** Radio medio de una estrella (px); cada una varía entre 0.55x y 1.3x */
  size?: number;
  /** Cuánto se enroscan los brazos al acercarse el puntero (0 = no reaccionan) */
  curl?: number;
  /** Distancia a la que notan el puntero, además de su radio (px) */
  reach?: number;
  /** Lo rápido que vuelven a su postura (0.9 = rápido, 0.99 = muy lento) */
  relax?: number;
  /** Opacidad del contorno (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Star = {
  x: number;
  y: number;
  R: number;
  rot: number;
  dir: number; // sentido en el que se enroscan
  phase: number;
  excite: number; // reacción al puntero, suavizada
  level: number; // petición de reacción (decae sola)
};

const ARMS = 5;

export default function StarfishBackground({
  count = 9,
  size = 70,
  curl = 1,
  reach = 120,
  relax = 0.965,
  alpha = 0.3,
  lineWidth = 1.2,
  color,
  className,
}: StarfishBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let frame = 0;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      // Reparto por rechazo: ninguna estrella se solapa con otra
      stars = [];
      for (let tries = 0; tries < 600 && stars.length < count; tries++) {
        const R = size * (0.55 + 0.75 * Math.random());
        const x = Math.random() * w;
        const y = Math.random() * h;
        if (stars.some((s) => Math.hypot(s.x - x, s.y - y) < (s.R + R) * 1.15)) continue;
        stars.push({
          x, y, R,
          rot: Math.random() * Math.PI * 2,
          dir: Math.random() < 0.5 ? -1 : 1,
          phase: Math.random() * Math.PI * 2,
          excite: 0,
          level: 0,
        });
      }
    }

    // Las estrellas por las que pasa el puntero reaccionan: se enroscan y se contraen un poco
    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (const s of stars) {
        const d = Math.hypot(s.x - x, s.y - y);
        const R = s.R + reach;
        if (d < R) s.level = Math.max(s.level, Math.pow(1 - d / R, 0.8));
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function draw(s: Star, time: number, a: number) {
      // Enroscado: cuanto más lejos del centro, más se desvía el ángulo (los brazos se curvan)
      const bend = (0.16 * Math.sin(time * 0.0005 + s.phase) + 0.9 * s.excite * curl) * s.dir;
      const scale = 1 - 0.1 * s.excite * curl;
      const rot = s.rot + s.excite * 0.35 * s.dir;
      const M = 100;
      ctx!.beginPath();
      for (let k = 0; k <= M; k++) {
        const th = (k / M) * Math.PI * 2;
        // 5 lóbulos: r va de 0.3 (entre brazos) a 1 (punta)
        const lobe = Math.pow(0.5 + 0.5 * Math.cos(ARMS * th), 2.4);
        const r = s.R * scale * (0.3 + 0.7 * lobe);
        const ang = th + bend * Math.pow(r / s.R, 1.5) + rot;
        const x = s.x + Math.cos(ang) * r;
        const y = s.y + Math.sin(ang) * r;
        if (k === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();
      setAlpha(a * 0.24);
      ctx!.fill();
      setAlpha(a);
      ctx!.stroke();
      // Puntos a lo largo de cada brazo y disco central
      ctx!.beginPath();
      for (let arm = 0; arm < ARMS; arm++) {
        for (let j = 1; j <= 5; j++) {
          const rr = s.R * scale * (0.28 + 0.13 * j);
          const ang = (arm / ARMS) * Math.PI * 2 + bend * Math.pow(rr / s.R, 1.5) + rot;
          const dr = s.R * 0.02 * (1.25 - j * 0.14);
          const x = s.x + Math.cos(ang) * rr;
          const y = s.y + Math.sin(ang) * rr;
          ctx!.moveTo(x + dr, y);
          ctx!.arc(x, y, dr, 0, Math.PI * 2);
        }
      }
      setAlpha(a * 0.6);
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(s.x, s.y, s.R * 0.09 * scale, 0, Math.PI * 2);
      setAlpha(a * 0.5);
      ctx!.stroke();
    }

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      // Se mueven muy despacio: se calcula a 30 fps y los fotogramas impares conservan el dibujo anterior
      if (frame++ % 2 === 1) return;
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--starfish-color").trim() || style.color;
      const k = style.getPropertyValue("--starfish-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineWidth = lineWidth;
      ctx!.lineJoin = "round";
      for (const s of stars) {
        s.excite += (s.level - s.excite) * 0.12; // sube con easing y vuelve despacio
        s.level *= relax;
        if (s.level < 0.002) s.level = 0;
        draw(s, time, alpha * mul * (0.6 + 0.4 * Math.min(1, s.R / (size * 1.1))));
      }
      ctx!.globalAlpha = 1;
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
  }, [count, size, curl, reach, relax, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--starfish-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
