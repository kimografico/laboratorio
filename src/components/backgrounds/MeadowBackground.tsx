import { useEffect, useRef } from "react";

export interface MeadowBackgroundProps {
  /** Separación entre briznas de hierba (px): más bajo, césped más denso y más costoso */
  spacing?: number;
  /** Altura de las briznas (px) */
  blade?: number;
  /** Intensidad del viento que mece la hierba */
  wind?: number;
  /** Radio en el que el puntero aparta la hierba (px) */
  radius?: number;
  /** Cuánto se inclina la hierba al paso del puntero */
  bend?: number;
  /** Distancia que debe recorrer el puntero para que brote una planta (px) */
  plantEvery?: number;
  /** Altura de las plantas (px) */
  plantSize?: number;
  /** Velocidad de crecimiento de las plantas (px por segundo) */
  growth?: number;
  /** Segundos que dura una planta completa antes de marchitarse */
  life?: number;
  /** Segundos que tarda en marchitarse */
  wither?: number;
  /** Máximo de plantas a la vez */
  maxPlants?: number;
  /** Plantas que brotan solas por segundo */
  ambient?: number;
  /** Si las ramas terminan en flor */
  flowers?: boolean;
  lineWidth?: number;
  /** Opacidad de las briznas (0-1) */
  alpha?: number;
  /** Opcional: fija el color de la hierba. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  /** Color de los tallos y las hojas (tono de la paleta) */
  plantColor?: string;
  /** Color de las flores (tono de la paleta) */
  flowerColor?: string;
  className?: string;
}

type Branch = { pts: number[]; ang: number; left: number; gen: number; since: number; next: number; side: number };
type Plant = { branches: Branch[]; leaves: number[]; flowers: number[]; doneAt: number; seed: number };

const TAU = Math.PI * 2;

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export default function MeadowBackground({
  spacing = 9,
  blade = 14,
  wind = 1,
  radius = 110,
  bend = 1,
  plantEvery = 90,
  plantSize = 110,
  growth = 70,
  life = 16,
  wither = 6,
  maxPlants = 18,
  ambient = 0.1,
  flowers = true,
  lineWidth = 1,
  alpha = 0.45,
  color,
  plantColor = "rgba(30, 84, 40, 0.9)",
  flowerColor = "rgba(196, 70, 90, 0.95)",
  className,
}: MeadowBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const OFF = -9999;
    const LAYERS = 3;

    let width = 0;
    let height = 0;
    let bx = new Float32Array(0);
    let by = new Float32Array(0);
    let ba = new Float32Array(0);
    let bl = new Float32Array(0);
    let bp = new Float32Array(0);
    let layer = new Uint8Array(0);
    let order = new Uint32Array(0);
    let starts: number[] = [];
    let plants: Plant[] = [];
    let px = OFF;
    let py = OFF;
    let lastX = OFF;
    let lastY = OFF;
    let dist = 0;
    let acc = 0;
    let last = -1;
    let now = 0;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const n = cols * rows;
      bx = new Float32Array(n);
      by = new Float32Array(n);
      ba = new Float32Array(n);
      bl = new Float32Array(n);
      bp = new Float32Array(n);
      layer = new Uint8Array(n);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          bx[k] = (i + Math.random()) * spacing;
          by[k] = (j + Math.random()) * spacing;
          ba[k] = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
          const depth = Math.min(1, by[k] / height);
          bl[k] = blade * (0.55 + 0.45 * depth) * (0.7 + Math.random() * 0.6);
          bp[k] = Math.random() * TAU;
          layer[k] = Math.min(LAYERS - 1, Math.floor(depth * LAYERS));
        }
      }
      starts = new Array(LAYERS + 1).fill(0);
      for (let k = 0; k < n; k++) starts[layer[k] + 1]++;
      for (let l = 0; l < LAYERS; l++) starts[l + 1] += starts[l];
      const fillAt = starts.slice(0, LAYERS);
      order = new Uint32Array(n);
      for (let k = 0; k < n; k++) order[fillAt[layer[k]]++] = k;
      plants = [];
    }

    function plant(x: number, y: number) {
      const seed = Math.random() * 1000;
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      plants.push({
        branches: [{ pts: [x, y], ang: a, left: plantSize * (0.7 + Math.random() * 0.5), gen: 0, since: 0, next: 12 + 8 * hash(seed), side: 1 }],
        leaves: [],
        flowers: [],
        doneAt: -1,
        seed,
      });
      if (plants.length > maxPlants) plants.shift();
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
      if (lastX !== OFF) dist += Math.hypot(px - lastX, py - lastY);
      lastX = px;
      lastY = py;
      if (dist >= plantEvery) {
        dist = 0;
        plant(px, py);
      }
    }

    function grow(p: Plant, px_: number) {
      let remaining = px_;
      while (remaining > 0) {
        const d = Math.min(4, remaining);
        remaining -= d;
        const count = p.branches.length;
        for (let bi = 0; bi < count; bi++) {
          const b = p.branches[bi];
          if (b.left <= 0) continue;
          const n = b.pts.length;
          b.ang += (hash(p.seed + bi * 3.1 + n * 0.37) - 0.5) * 0.09 - Math.sin(b.ang + Math.PI / 2) * 0.01;
          const x = b.pts[n - 2] + Math.cos(b.ang) * d;
          const y = b.pts[n - 1] + Math.sin(b.ang) * d;
          b.pts.push(x, y);
          b.left -= d;
          b.since += d;
          if (b.since >= b.next && b.gen < 3 && b.left > 12) {
            b.since = 0;
            b.next = 12 + 10 * hash(p.seed + bi + n);
            b.side = -b.side;
            const lr = 0.9 + 0.4 * hash(p.seed + n);
            p.leaves.push(x, y, b.ang + 1.0 * lr, x, y, b.ang - 1.0 * lr);
            p.branches.push({ pts: [x, y], ang: b.ang + b.side * (0.6 + 0.4 * hash(p.seed + n * 2)), left: b.left * 0.55, gen: b.gen + 1, since: 0, next: 10 + 8 * hash(p.seed + n), side: 1 });
          }
          if (b.left <= 0 && flowers) p.flowers.push(x, y);
        }
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      now = time / 1000;
      const dt = last < 0 ? 16.67 : Math.min(time - last, 100);
      last = time;

      acc += (dt * ambient) / 1000;
      while (acc >= 1) {
        plant(width * (0.08 + Math.random() * 0.84), height * (0.3 + Math.random() * 0.65));
        acc -= 1;
      }
      for (const p of plants) {
        if (p.branches.some((b) => b.left > 0)) grow(p, (growth * dt) / 1000);
        else if (p.doneAt < 0) p.doneAt = now;
      }
      plants = plants.filter((p) => p.doneAt < 0 || now - p.doneAt < life + wither);

      ctx!.clearRect(0, 0, width, height);
      ctx!.lineCap = "round";

      // Hierba: cada brizna se mece con el viento y se inclina alejándose del puntero. Tres capas con distinto alfa dan profundidad
      const t = time * 0.002;
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--meadow-color").trim() || style.color;
      const k = style.getPropertyValue("--meadow-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.lineWidth = lineWidth;
      const r2 = radius * radius;
      for (let l = 0; l < LAYERS; l++) {
        ctx!.beginPath();
        for (let q = starts[l]; q < starts[l + 1]; q++) {
          const kk = order[q];
          let a = ba[kk] + Math.sin(t + bp[kk] + bx[kk] * 0.01) * 0.25 * wind;
          if (px !== OFF) {
            const dx = bx[kk] - px;
            const dy = by[kk] - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < r2) {
              const w = 1 - Math.sqrt(d2) / radius;
              a += (dx >= 0 ? 1 : -1) * w * w * 1.3 * bend;
            }
          }
          ctx!.moveTo(bx[kk], by[kk]);
          ctx!.lineTo(bx[kk] + Math.cos(a) * bl[kk], by[kk] + Math.sin(a) * bl[kk]);
        }
        setAlpha((0.45 + 0.55 * (l / (LAYERS - 1))) * alpha * mul);
        ctx!.stroke();
      }

      // Plantas (tonos de paleta: tallos y flores mantienen su propio color)
      for (const p of plants) {
        const a = p.doneAt < 0 ? 1 : Math.max(0, 1 - Math.max(0, now - p.doneAt - life) / wither);
        setAlpha(a * mul);
        ctx!.strokeStyle = plantColor;
        ctx!.lineWidth = lineWidth * 1.4;
        ctx!.beginPath();
        for (const b of p.branches) {
          ctx!.moveTo(b.pts[0], b.pts[1]);
          for (let i = 2; i < b.pts.length; i += 2) ctx!.lineTo(b.pts[i], b.pts[i + 1]);
        }
        ctx!.stroke();

        ctx!.fillStyle = plantColor;
        ctx!.beginPath();
        for (let i = 0; i < p.leaves.length; i += 3) {
          const ang = p.leaves[i + 2];
          ctx!.moveTo(p.leaves[i] + Math.cos(ang) * 9, p.leaves[i + 1] + Math.sin(ang) * 9);
          ctx!.ellipse(p.leaves[i] + Math.cos(ang) * 5, p.leaves[i + 1] + Math.sin(ang) * 5, 5, 2.2, ang, 0, TAU);
        }
        ctx!.fill();

        ctx!.fillStyle = flowerColor;
        ctx!.beginPath();
        for (let i = 0; i < p.flowers.length; i += 2) {
          ctx!.moveTo(p.flowers[i] + 4, p.flowers[i + 1]);
          ctx!.arc(p.flowers[i], p.flowers[i + 1], 4, 0, TAU);
        }
        ctx!.fill();
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
  }, [spacing, blade, wind, radius, bend, plantEvery, plantSize, growth, life, wither, maxPlants, ambient, flowers, lineWidth, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--meadow-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
