import { useEffect, useRef } from "react";

export interface FibonacciGroveBackgroundProps {
  /** Árboles vivos a la vez; los que nacen con un clic pueden superarlo un poco */
  max?: number;
  /** Altura del árbol más cercano (px) */
  size?: number;
  /** Mínimo de niveles de ramificación de un árbol (2-15). Cada árbol elige al azar entre `minLevels` y `maxLevels` */
  minLevels?: number;
  /** Máximo de niveles de ramificación de un árbol (hasta 15: unas 2.500 ramas) */
  maxLevels?: number;
  /** Apertura de las ramas laterales (radianes) */
  spread?: number;
  /** Grosor del tronco del árbol más cercano (px); la copa es mucho más fina */
  trunk?: number;
  /** Alto de la franja de césped, como fracción de la pantalla (0-0.3) */
  grass?: number;
  /** Segundos que tarda en crecer cada árbol */
  grow?: number;
  /** Segundos que se mantiene en pie, ya crecido */
  life?: number;
  /** Segundos que tarda en desvanecerse */
  fade?: number;
  /** Segundos entre árboles que nacen solos (0 = solo con clic) */
  interval?: number;
  /** Balanceo de la corriente por nivel de rama (radianes) */
  sway?: number;
  /** Cuánto se doblan ramas y briznas para apartarse del puntero (0-1) */
  avoid?: number;
  /** Alcance del puntero (px) */
  radius?: number;
  /** Persistencia de la reacción al puntero (0.9 rápido – 0.99 lento) */
  heal?: number;
  /** Opacidad del césped (0-1); los árboles son totalmente opacos */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

type Tree = { D: number; rx: number; ry: number; L: number; tilt: number; phase: number; speed: number; seed: number; depth: number; born: number };
type Blade = { x: number; y: number; hgt: number; phase: number };

const diff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// Hash determinista: la forma de cada rama es fija y no parpadea entre fotogramas
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export default function FibonacciGroveBackground({
  max = 5,
  size = 520,
  minLevels = 5,
  maxLevels = 15,
  spread = 0.7,
  trunk = 9,
  grass = 0.09,
  grow = 8,
  life = 14,
  fade = 5,
  interval = 4,
  sway = 0.05,
  avoid = 0.35,
  radius = 220,
  heal = 0.985,
  alpha = 0.32,
  color,
  className,
}: FibonacciGroveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    // Nunca menos de 5 ni más de 15 niveles, aunque se pasen otros valores
    const lo = Math.max(5, Math.min(15, Math.round(minLevels)));
    const hi = Math.max(lo, Math.min(15, Math.round(maxLevels)));
    const LMAX = 15;
    let w = 0;
    let h = 0;
    let gTop = 0; // y donde empieza el césped
    let px = -9999;
    let py = -9999;
    let sx = -9999; // puntero suavizado: nada pega saltos si el ratón se teletransporta
    let sy = -9999;
    let energy = 0; // sube al mover el ratón y baja solo: un puntero quieto deja de empujar
    let hasPointer = false;
    let trees: Tree[] = [];
    let blades: Blade[] = [];
    let nextPlant = 0;
    let now = 0;
    let raf = 0;
    // Un buffer de segmentos por nivel: así cada nivel se traza de una vez con su grosor
    const bufs = Array.from({ length: LMAX }, (_, d) => new Float32Array(4 * 2 ** d));
    const counts = new Int32Array(LMAX);

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      gTop = h * (1 - grass);
      trees = [];
      nextPlant = 0;
      const gh = h - gTop;
      blades = Array.from({ length: Math.round(w / 3.5) }, () => {
        const y = gTop + Math.random() * gh;
        // Las briznas de abajo (más cercanas) son más altas
        return { x: Math.random() * w, y, hgt: (5 + 14 * Math.random()) * (0.5 + (y - gTop) / Math.max(1, gh)), phase: Math.random() * 6.28 };
      });
    }

    // Planta un árbol con la base en el césped; con y se coloca a esa altura (si cae dentro de la franja)
    function plant(x: number, y?: number) {
      const gh = h - gTop;
      const ry = y !== undefined && y >= gTop ? Math.min(h - 2, y) : gTop + gh * (0.15 + 0.8 * Math.random());
      const depth = 0.5 + 0.5 * clamp01((ry - gTop) / Math.max(1, gh));
      if (trees.length >= max * 2) trees[0].born = Math.min(trees[0].born, now - (grow + life) * 1000); // el más viejo empieza a irse
      // Cada árbol se detiene tras un número distinto de iteraciones; la altura se normaliza para que
      // los de pocas iteraciones no queden diminutos (la suma de longitudes crece con los niveles)
      const Dt = lo + Math.floor(Math.random() * (hi - lo + 1));
      const hfac = (1 - Math.pow(0.86, Dt)) / 0.14;
      trees.push({
        D: Dt,
        rx: x,
        ry,
        L: size * 0.17 * (5.4 / hfac) * (0.5 + 0.6 * depth),
        tilt: (Math.random() - 0.5) * 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + 0.6 * depth,
        seed: Math.random() * 1000,
        depth,
        born: now,
      });
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const nx = clientX - rect.left;
      const ny = clientY - rect.top;
      if (hasPointer) energy = Math.min(1, energy + Math.hypot(nx - px, ny - py) * 0.004);
      else {
        sx = nx;
        sy = ny;
      }
      px = nx;
      py = ny;
      hasPointer = true;
    }

    // Un clic (o toque) planta un árbol en el césped, debajo del punto pulsado; se ignoran botones y enlaces
    function onDown(e: PointerEvent) {
      if ((e.target as Element | null)?.closest?.("a, button, input, select, textarea, label")) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || x > w || y < 0 || y > h) return;
      plant(x, y);
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    let reveal = 0;
    let cur: Tree = { D: 5, rx: 0, ry: 0, L: 0, tilt: 0, phase: 0, speed: 1, seed: 0, depth: 1, born: 0 };
    let ox1 = 0;
    let oy1 = 0;
    let oa = 0;

    // Calcula una rama (ángulo con balanceo, tropismo y reacción al puntero), la guarda en su nivel y deja el
    // extremo en ox1/oy1/oa. Devuelve false si todavía no ha crecido hasta ese nivel
    function step(x: number, y: number, ang: number, len: number, d: number): boolean {
      const e = reveal - d;
      if (e <= 0) return false;
      const kk = e >= 1 ? 1 : e * e * (3 - 2 * e);
      let a = ang + diff(ang, -Math.PI / 2) * 0.1 + Math.sin(now * 0.0006 * cur.speed - d * 0.55 + cur.phase) * sway * (0.4 + 0.12 * d);
      if (energy > 0.002) {
        const dx = x - sx;
        const dy = y - sy;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const wgt = Math.pow(1 - dist / radius, 1.5) * energy * avoid;
          a += Math.max(-1, Math.min(1, diff(a, Math.atan2(dy, dx)))) * wgt;
        }
      }
      ox1 = x + Math.cos(a) * len * kk;
      oy1 = y + Math.sin(a) * len * kk;
      oa = a;
      const b = bufs[d];
      const o = counts[d]++ * 4;
      b[o] = x;
      b[o + 1] = y;
      b[o + 2] = ox1;
      b[o + 3] = oy1;
      return true;
    }

    // Árbol de los conejos de Fibonacci: regla A → A B, B → A. Cada rama "A" sigue y deja una rama lateral "B";
    // cada "B" madura en "A" al siguiente nivel. Por eso el número de ramas por nivel es 1, 1, 2, 3, 5, 8, 13...
    function rec(x: number, y: number, ang: number, len: number, d: number, type: number, side: number, id: number) {
      if (!step(x, y, ang, len, d) || d >= cur.D - 1) return;
      const x1 = ox1;
      const y1 = oy1;
      const a = oa;
      const v = 0.94 + 0.12 * hash(cur.seed + id * 0.37);
      if (type === 0) {
        rec(x1, y1, a + side * 0.1, len * 0.86 * v, d + 1, 0, -side, id * 2);
        rec(x1, y1, a + side * spread * (0.85 + 0.3 * hash(cur.seed + id * 0.61)), len * 0.7 * v, d + 1, 1, -side, id * 2 + 1);
      } else {
        rec(x1, y1, a - side * 0.12, len * 0.86 * v, d + 1, 0, side, id * 2);
      }
    }

    function drawGrass(front: boolean, a: number, time: number) {
      const mid = gTop + (h - gTop) * 0.5;
      ctx!.beginPath();
      for (const b of blades) {
        if (b.y > mid !== front) continue;
        let lean = Math.sin(time * 0.0012 + b.phase + b.x * 0.01) * 3;
        if (energy > 0.002) {
          const dx = b.x - sx;
          const dy = b.y - sy;
          const dist = Math.hypot(dx, dy);
          if (dist < radius * 0.7) lean += Math.sign(dx || 1) * (1 - dist / (radius * 0.7)) ** 1.5 * energy * avoid * 22;
        }
        ctx!.moveTo(b.x, b.y);
        ctx!.quadraticCurveTo(b.x + lean * 0.3, b.y - b.hgt * 0.6, b.x + lean, b.y - b.hgt);
      }
      setAlpha(a);
      ctx!.stroke();
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, w, h);
      now = time;
      const ink = style.getPropertyValue("--fibgrove-color").trim() || style.color;
      const k = style.getPropertyValue("--fibgrove-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      energy *= heal;
      sx += (px - sx) * 0.12;
      sy += (py - sy) * 0.12;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineCap = "round";
      ctx!.lineWidth = 1;

      // Árboles que nacen solos, mientras haya hueco
      if (interval > 0 && time >= nextPlant) {
        if (trees.length < max) plant(w * (0.05 + 0.9 * Math.random()));
        nextPlant = time + interval * 1000 * (0.7 + 0.6 * Math.random());
      }
      trees = trees.filter((t) => (time - t.born) / 1000 < grow + life + fade);
      trees.sort((a, b) => a.ry - b.ry);

      // Suelo plano + briznas de atrás; después los árboles; después las briznas de delante
      setAlpha(alpha * mul * 0.12);
      ctx!.fillRect(0, gTop + 3, w, h - gTop);
      drawGrass(false, alpha * mul * 0.5, time);

      for (const t of trees) {
        const age = (time - t.born) / 1000;
        const g = clamp01(age / grow);
        reveal = (1 - Math.pow(1 - g, 3)) * t.D;
        cur = t;
        counts.fill(0);
        rec(t.rx, t.ry, -Math.PI / 2 + t.tilt, t.L, 0, 0, 1, 1);
        // Aparece con un fundido corto y se desvanece al final de su vida
        const life01 = clamp01(age / 0.8) * (age > grow + life ? 1 - (age - grow - life) / fade : 1);
        // Totalmente opacos: solo el fundido de aparición y de desvanecimiento toca la opacidad
        const a = life01;
        const tw = trunk * (0.5 + 0.5 * t.depth);
        for (let d = 0; d < t.D; d++) {
          if (counts[d] === 0) continue;
          const b = bufs[d];
          ctx!.beginPath();
          for (let s = 0; s < counts[d]; s++) {
            ctx!.moveTo(b[s * 4], b[s * 4 + 1]);
            ctx!.lineTo(b[s * 4 + 2], b[s * 4 + 3]);
          }
          // Base gruesa, copa fina: el grosor baja ~36% en cada nivel
          ctx!.lineWidth = Math.max(0.6, tw * Math.pow(0.64, d));
          setAlpha(a);
          ctx!.stroke();
        }
      }
      ctx!.lineWidth = 1;
      drawGrass(true, alpha * mul * 0.6, time);
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onPointer(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("pointerdown", onDown);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [max, size, minLevels, maxLevels, spread, trunk, grass, grow, life, fade, interval, sway, avoid, radius, heal, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--fibgrove-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
