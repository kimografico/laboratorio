import { useEffect, useRef } from "react";

export interface PenroseBackgroundProps {
  /** Lado aproximado de cada rombo (px) */
  size?: number;
  /** Giro lento del teselado entero (vueltas por minuto; 0 = quieto) */
  spin?: number;
  /** Cuánto se encogen los rombos bajo el puntero (0-1) */
  shrink?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Amplitud de la respiración ambiental que recorre el patrón (fracción del tamaño, 0-0.2) */
  wave?: number;
  /** Persistencia de la estela (0-1): más alto, los rombos tardan más en recuperarse */
  decay?: number;
  /** Opacidad de los rombos flacos (0-1) */
  alpha?: number;
  /** Opacidad de los rombos gordos, como fracción de `alpha` (0-1) */
  secondary?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

const PHI = (1 + Math.sqrt(5)) / 2;

export default function PenroseBackground({
  size = 70,
  spin = 0.3,
  shrink = 0.5,
  radius = 200,
  wave = 0.03,
  decay = 0.97,
  alpha = 0.18,
  secondary = 0.5,
  color,
  className,
}: PenroseBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let raf = 0;
    let theta = 0;
    let frame = 0;
    let n = 0;
    let pts = new Float32Array(0); // 4 vértices por rombo (los triángulos del borde repiten el último)
    let gs = new Float32Array(0); // centro de cada rombo
    let kinds = new Uint8Array(0); // 0 = flaco, 1 = gordo
    let level = new Float32Array(0);
    let shown = new Float32Array(0);

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const R = (Math.hypot(w, h) / 2) * 1.02 + 1;
      const depth = Math.max(2, Math.min(9, Math.round(Math.log(R / size) / Math.log(PHI))));

      // Rueda inicial de 10 triángulos y subdivisión de Robinson (P3)
      let tris: number[][] = [];
      for (let i = 0; i < 10; i++) {
        let bx = Math.cos(((2 * i - 1) * Math.PI) / 10);
        let by = Math.sin(((2 * i - 1) * Math.PI) / 10);
        let cx = Math.cos(((2 * i + 1) * Math.PI) / 10);
        let cy = Math.sin(((2 * i + 1) * Math.PI) / 10);
        if (i % 2 === 0) [bx, by, cx, cy] = [cx, cy, bx, by];
        tris.push([0, 0, 0, bx, by, cx, cy]);
      }
      for (let d = 0; d < depth; d++) {
        const next: number[][] = [];
        for (const [k, ax, ay, bx, by, cx, cy] of tris) {
          if (k === 0) {
            const px = ax + (bx - ax) / PHI;
            const py = ay + (by - ay) / PHI;
            next.push([0, cx, cy, px, py, bx, by], [1, px, py, cx, cy, ax, ay]);
          } else {
            const qx = bx + (ax - bx) / PHI;
            const qy = by + (ay - by) / PHI;
            const rx = bx + (cx - bx) / PHI;
            const ry = by + (cy - by) / PHI;
            next.push([1, rx, ry, cx, cy, ax, ay], [1, qx, qy, rx, ry, bx, by], [0, rx, ry, qx, qy, ax, ay]);
          }
        }
        tris = next;
      }

      // Con relleno plano no se puede dibujar cada mitad por separado (quedaría una costura): se unen las dos
      // mitades que comparten la base BC en un solo rombo (A1, B, A2, C)
      const key = (x: number, y: number) => `${Math.round(x * 1e4)},${Math.round(y * 1e4)}`;
      const open = new Map<string, number[]>();
      const shapes: number[][] = [];
      for (const t of tris) {
        const [k, ax, ay, bx, by, cx, cy] = t;
        const k1 = key(bx, by);
        const k2 = key(cx, cy);
        const id = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
        const prev = open.get(id);
        if (prev) {
          shapes.push([k, prev[1], prev[2], bx, by, ax, ay, cx, cy]);
          open.delete(id);
        } else open.set(id, t);
      }
      // Triángulos sin pareja (borde de la rueda, fuera de pantalla): se dibujan como triángulos
      for (const t of open.values()) shapes.push([t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[5], t[6]]);

      n = shapes.length;
      pts = new Float32Array(n * 8);
      gs = new Float32Array(n * 2);
      kinds = new Uint8Array(n);
      level = new Float32Array(n);
      shown = new Float32Array(n);
      shapes.forEach((s, i) => {
        kinds[i] = s[0];
        let sx = 0;
        let sy = 0;
        for (let j = 0; j < 4; j++) {
          pts[i * 8 + j * 2] = s[1 + j * 2] * R;
          pts[i * 8 + j * 2 + 1] = s[2 + j * 2] * R;
          sx += pts[i * 8 + j * 2];
          sy += pts[i * 8 + j * 2 + 1];
        }
        gs[i * 2] = sx / 4;
        gs[i * 2 + 1] = sy / 4;
      });
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left - w / 2;
      const y = clientY - rect.top - h / 2;
      // El patrón gira: el puntero se pasa al sistema de coordenadas del teselado
      const c = Math.cos(-theta);
      const s = Math.sin(-theta);
      const lx = x * c - y * s;
      const ly = x * s + y * c;
      for (let i = 0; i < n; i++) {
        const d = Math.hypot(gs[i * 2] - lx, gs[i * 2 + 1] - ly);
        const influence = 1 - Math.min(d / radius, 1);
        level[i] = Math.max(level[i], influence * influence);
      }
    }

    // globalAlpha ignora en silencio los valores fuera de 0-1: siempre se limita
    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      // Todo es lento: se calcula a 30 fps (el fotograma impar conserva el dibujo anterior)
      raf = requestAnimationFrame(animate);
      if (frame++ % 2 === 1) return;
      ctx!.clearRect(0, 0, w, h);
      // Tema: tinta + opacidad, o dos tonos planos (--penrose-tone-1 flaco, --penrose-tone-2 gordo) si están ambos
      const ink = style.getPropertyValue("--penrose-color").trim() || style.color;
      const k = style.getPropertyValue("--penrose-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      const t1 = style.getPropertyValue("--penrose-tone-1").trim();
      const t2 = style.getPropertyValue("--penrose-tone-2").trim();
      const tones = t1 !== "" && t2 !== "";
      theta = time * spin * 1.0472e-4;

      for (let i = 0; i < n; i++) {
        shown[i] += (level[i] - shown[i]) * 0.12;
        level[i] *= decay;
      }

      // El giro se aplica a mano a los vértices: con ctx.rotate el trazado por CPU cuesta ~3 veces más
      const co = Math.cos(theta);
      const si = Math.sin(theta);
      const shape = (i: number) => {
        const gx = gs[i * 2];
        const gy = gs[i * 2 + 1];
        // 0.94 deja un canal fino entre rombos; la respiración viaja en diagonal
        const sc = 0.94 * (1 + wave * Math.sin(time * 0.0005 + gx * 0.004 + gy * 0.006)) * (1 - shrink * shown[i]);
        for (let j = 0; j < 4; j++) {
          const x = gx + (pts[i * 8 + j * 2] - gx) * sc;
          const y = gy + (pts[i * 8 + j * 2 + 1] - gy) * sc;
          const X = w / 2 + x * co - y * si;
          const Y = h / 2 + x * si + y * co;
          if (j === 0) ctx!.moveTo(X, Y);
          else ctx!.lineTo(X, Y);
        }
        ctx!.closePath();
      };
      // Rombos en reposo agrupados por tipo (un fill por grupo); los tocados por el puntero, uno a uno
      for (let kind = 0; kind < 2; kind++) {
        ctx!.fillStyle = tones ? (kind === 0 ? t1 : t2) : ink;
        setAlpha(tones ? 1 : alpha * mul * (kind === 0 ? 1 : secondary));
        ctx!.beginPath();
        for (let i = 0; i < n; i++) if (kinds[i] === kind && shown[i] <= 0.02) shape(i);
        ctx!.fill();
      }
      for (let i = 0; i < n; i++) {
        if (shown[i] <= 0.02) continue;
        ctx!.fillStyle = tones ? (kinds[i] === 0 ? t1 : t2) : ink;
        // Al encogerse se aclaran un poco: el hueco que dejan se lee como "luz" sin efectos
        setAlpha(tones ? 1 : alpha * mul * (kinds[i] === 0 ? 1 : secondary) * (1 + 1.2 * shown[i]));
        ctx!.beginPath();
        shape(i);
        ctx!.fill();
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
  }, [size, spin, shrink, radius, wave, decay, alpha, secondary]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--penrose-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
