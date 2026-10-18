import { useEffect, useRef } from "react";

export interface JellyBackgroundProps {
  /** Medusas cercanas: con campana, nervios y tentáculos */
  near?: number;
  /** Medusas lejanas: pequeñas y muy tenues, solo una silueta */
  far?: number;
  /** Radio de la campana de la medusa más cercana (px) */
  size?: number;
  /** Velocidad media de ascenso (px por fotograma): suben a impulsos, con cada contracción */
  speed?: number;
  /** Distancia a la que se apartan del puntero (px) */
  avoid?: number;
  /** Opacidad del contorno de las cercanas (0-1) */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color de las medusas. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Pt = { x: number; y: number };
type Jelly = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  R: number;
  depth: number;
  far: boolean;
  phase: number; // fase de la contracción
  tilt: number;
  strands: { ox: number; len: number; pts: Pt[]; thick: boolean; ph: number }[];
};

const SEG = 12; // segmentos de cada tentáculo

export default function JellyBackground({
  near = 16,
  far = 3,
  size = 60,
  speed = 0.2,
  avoid = 150,
  alpha = 0.3,
  lineWidth = 1,
  color,
  className,
}: JellyBackgroundProps) {
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
    let jellies: Jelly[] = [];
    let raf = 0;

    function make(isFar: boolean): Jelly {
      const depth = isFar ? 0.3 + 0.15 * Math.random() : 0.65 + 0.35 * Math.random();
      const R = size * (0.4 + 0.6 * depth) * (0.85 + 0.3 * Math.random());
      const x = Math.random() * w;
      const y = Math.random() * h;
      const n = isFar ? 6 : 9;
      return {
        x, y, vx: 0, vy: 0, R, depth, far: isFar,
        phase: Math.random() * Math.PI * 2,
        tilt: 0,
        strands: Array.from({ length: n }, (_, i) => {
          const thick = !isFar && i % 3 === 1; // algunos brazos orales, más gruesos y más cortos
          const len = R * (thick ? 1.7 + 0.6 * Math.random() : 2.2 + 1.4 * Math.random());
          return {
            ox: ((i + 0.5) / n - 0.5) * 1.7,
            len,
            thick,
            ph: Math.random() * Math.PI * 2,
            pts: Array.from({ length: SEG + 1 }, (_, k) => ({ x, y: y + R * 0.1 + (len / SEG) * k })),
          };
        }),
      };
    }

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      jellies = [...Array.from({ length: near }, () => make(false)), ...Array.from({ length: far }, () => make(true))].sort(
        (a, b) => a.depth - b.depth // las lejanas se dibujan primero
      );
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      hasPointer = true;
    }

    function update(j: Jelly, time: number) {
      // Contracción: la campana se encoge y la medusa se impulsa hacia arriba; después se deja llevar y se hunde un poco
      j.phase += 0.032 + 0.006 * j.depth;
      const thrust = Math.pow(Math.max(0, Math.sin(j.phase)), 2.2);
      j.vy += -thrust * 0.05 * speed * (0.6 + 0.6 * j.depth) + 0.0035;
      j.vx += Math.sin(time * 0.0003 + j.phase * 0.2) * 0.0016;
      // Se apartan del puntero lateralmente
      if (hasPointer) {
        const dx = j.x - px;
        const dy = j.y - py;
        const d = Math.hypot(dx, dy);
        const RR = avoid * (0.5 + 0.5 * j.depth);
        if (d < RR) {
          const f = Math.pow(1 - d / RR, 2);
          j.vx += (dx / (d || 1)) * f * 0.12;
          j.vy += (dy / (d || 1)) * f * 0.05;
        }
      }
      j.vx *= 0.98;
      j.vy *= 0.97;
      j.x += j.vx;
      j.y += j.vy;
      j.tilt += (Math.max(-0.35, Math.min(0.35, j.vx * 1.4)) - j.tilt) * 0.05;
      // Al salir por arriba reaparece por abajo; por los lados, por el lado contrario
      if (j.y < -j.R * 4) {
        j.y = h + j.R * 2;
        j.x = Math.random() * w;
      }
      if (j.y > h + j.R * 5) j.y = -j.R * 3;
      if (j.x < -j.R * 2) j.x = w + j.R * 2;
      else if (j.x > w + j.R * 2) j.x = -j.R * 2;
      // Tentáculos: cada punto sigue al anterior con retardo y cuelga hacia abajo (en el sistema de la medusa)
      const c = Math.cos(j.tilt);
      const s = Math.sin(j.tilt);
      const bellW = j.R * (1 + 0.16 * Math.sin(j.phase)); // ancho de la campana (se encoge al contraerse)
      for (const st of j.strands) {
        const rx = st.ox * bellW * 0.5;
        const root = st.pts[0];
        root.x = j.x + rx * c;
        root.y = j.y + rx * s + j.R * 0.08;
        const seg = st.len / SEG;
        for (let k = 1; k <= SEG; k++) {
          const p = st.pts[k];
          const prev = st.pts[k - 1];
          // Posición de reposo: colgando en la dirección "abajo" de la medusa, con un ligero vaivén
          const hang = -s;
          const tx = prev.x + (hang + Math.sin(time * 0.0012 + st.ph + k * 0.5) * 0.18) * seg;
          const ty = prev.y + c * seg;
          p.x += (tx - p.x) * 0.22;
          p.y += (ty - p.y) * 0.22;
          const ex = p.x - prev.x;
          const ey = p.y - prev.y;
          const len = Math.hypot(ex, ey) || 1;
          p.x = prev.x + (ex / len) * seg;
          p.y = prev.y + (ey / len) * seg;
        }
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function draw(j: Jelly) {
      const a = alpha * mul * (0.12 + 0.88 * Math.pow(j.depth, 1.5));
      ctx!.lineWidth = lineWidth * (0.5 + 0.5 * j.depth);

      // Tentáculos
      if (!j.far) {
        for (const st of j.strands) {
          ctx!.beginPath();
          ctx!.moveTo(st.pts[0].x, st.pts[0].y);
          for (let k = 1; k <= SEG; k++) ctx!.lineTo(st.pts[k].x, st.pts[k].y);
          ctx!.lineWidth = lineWidth * (0.5 + 0.5 * j.depth) * (st.thick ? 2.2 : 1);
          setAlpha(a * (st.thick ? 0.5 : 0.7));
          ctx!.stroke();
        }
      } else {
        ctx!.beginPath();
        for (const st of j.strands) {
          ctx!.moveTo(st.pts[0].x, st.pts[0].y);
          for (let k = 1; k <= SEG; k += 2) ctx!.lineTo(st.pts[k].x, st.pts[k].y);
        }
        ctx!.lineWidth = lineWidth * 0.5;
        setAlpha(a * 0.8);
        ctx!.stroke();
      }

      // Campana: cúpula con borde festoneado. Se dibuja en el sistema local de la medusa (1 unidad = su radio)
      const c = Math.cos(j.tilt) * j.R;
      const s = Math.sin(j.tilt) * j.R;
      const sq = Math.sin(j.phase);
      const bw = 1 + 0.16 * sq; // más ancha al relajarse...
      const bh = 0.82 - 0.12 * sq; // ...y más baja
      ctx!.setTransform(c, s, -s, c, j.x, j.y);
      ctx!.lineWidth = (lineWidth * (0.5 + 0.5 * j.depth)) / j.R;
      const SC = 8; // festones del borde
      ctx!.beginPath();
      ctx!.moveTo(-bw, 0);
      ctx!.bezierCurveTo(-bw, -bh * 1.35, bw, -bh * 1.35, bw, 0);
      for (let k = 1; k <= SC; k++) {
        const x1 = bw - ((2 * bw) / SC) * (k - 0.5);
        const x2 = bw - ((2 * bw) / SC) * k;
        ctx!.quadraticCurveTo(x1, 0.16 + 0.03 * Math.sin(j.phase + k), x2, 0);
      }
      ctx!.closePath();
      setAlpha(a * (j.far ? 0.45 : 0.22));
      ctx!.fill();
      if (!j.far) {
        setAlpha(a);
        ctx!.stroke();
        // Nervios: arcos concéntricos y radiales dentro de la campana
        ctx!.beginPath();
        for (const r of [0.45, 0.72]) {
          ctx!.moveTo(-bw * r, 0);
          ctx!.bezierCurveTo(-bw * r, -bh * 1.35 * r, bw * r, -bh * 1.35 * r, bw * r, 0);
        }
        for (let k = -3; k <= 3; k++) {
          ctx!.moveTo(0, -bh * 0.18);
          ctx!.lineTo(k * bw * 0.28, -0.04);
        }
        setAlpha(a * 0.35);
        ctx!.stroke();
        // Gónadas: cuatro círculos tenues en el centro
        ctx!.beginPath();
        for (let k = 0; k < 4; k++) {
          const ang = (k / 4) * Math.PI * 2 + 0.6;
          ctx!.moveTo(Math.cos(ang) * 0.17 + 0.12, -bh * 0.3 + Math.sin(ang) * 0.1);
          ctx!.arc(Math.cos(ang) * 0.17, -bh * 0.3 + Math.sin(ang) * 0.1, 0.12, 0, Math.PI * 2);
        }
        setAlpha(a * 0.3);
        ctx!.fill();
      }
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
    }

    function animate(time: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--jelly-color").trim() || style.color;
      const k = style.getPropertyValue("--jelly-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      for (const j of jellies) {
        update(j, time);
        draw(j);
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
      style={color ? ({ "--jelly-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
