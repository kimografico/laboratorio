import { useEffect, useRef } from "react";

export interface PhysarumBackgroundProps {
  /** Agentes por cada 10.000 px² del contenedor (8 ≈ 6.700 en 1200×700). Más agentes, red más densa y más margen para que la atracción no vacíe el fondo */
  density?: number;
  /** Pasos de cada agente por fotograma = píxeles que avanza: más pasos, la red evoluciona más deprisa */
  steps?: number;
  /** Distancia a la que cada agente huele el rastro (px) */
  sensor?: number;
  /** Ángulo entre los sensores laterales y el frontal (radianes) */
  sensorAngle?: number;
  /** Ángulo que gira el agente en cada paso (radianes) */
  turn?: number;
  /** Fracción del rastro que se conserva por fotograma (0.9 se borra rápido, 0.98 dura mucho) */
  persistence?: number;
  /** Cuánto se esparce el rastro a los píxeles vecinos por fotograma (0 = nada, 0.35 = muy difuso). Menos difusión, venas más finas */
  diffusion?: number;
  /** Grado de atracción del puntero: fracción de los agentes que acuden a él (0 = ninguno, solo actúa el alimento; 1 = un tercio; 3 = todos). */
  attraction?: number;
  /** Radio de la atracción (px): a partir de esta distancia el puntero no influye */
  reach?: number;
  /** Radio (px) dentro del cual un agente que acude se "consume" al llegar al puntero y vuelve a entrar por el borde de `reach` */
  sink?: number;
  /** Fuerza del "alimento" que el puntero deja en el mapa y que atrae a los agentes de forma indirecta */
  lure?: number;
  /** Radio del alimento del puntero (px) */
  lureRadius?: number;
  /** Intensidad de rastro a partir de la cual se dibuja una vena: más alto, venas más finas y menos numerosas */
  threshold?: number;
  /** Nitidez del borde de las venas (0 = degradado suave, 1 = borde casi duro) */
  sharpness?: number;
  /** Opacidad de las venas (0-1) */
  opacity?: number;
  /** Opcional: fija el color de las venas. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

const TAU = Math.PI * 2;
const MAX_AGENTS = 20000;

export default function PhysarumBackground({
  density = 12,
  steps = 4,
  sensor = 40,
  sensorAngle = 0.6,
  turn = 0.75,
  persistence = 0.95,
  diffusion = 0.35,
  attraction = 1.5,
  reach = 300,
  sink = 12,
  lure = 1.5,
  lureRadius = 30,
  threshold = 1.25,
  sharpness = 0.8,
  opacity = 0.5,
  color,
  className,
}: PhysarumBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const OFF = -9999;

    // Una celda por píxel: el mapa se vuelca tal cual sobre el canvas, sin ampliar ni interpolar.
    // El depósito se normaliza por el nº de pasos para que el rastro no dependa de `steps`
    const deposit = 15 / steps;
    const edge = 0.05 + (1 - sharpness) * 2.5;

    let width = 0;
    let height = 0;
    let n = 0;
    let t0 = new Float32Array(0);
    let t1 = new Float32Array(0);
    let tmp = new Float32Array(0);
    let img: ImageData | null = null;
    let ax = new Float32Array(0);
    let ay = new Float32Array(0);
    let aa = new Float32Array(0);
    let recruit = new Float32Array(0);
    let px = OFF;
    let py = OFF;
    let raf = 0;
    // Tinta y opacidad vivas (se actualizan en cada fotograma desde el CSS)
    let ink = "";
    let mul = 1;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      t0 = new Float32Array(width * height);
      t1 = new Float32Array(width * height);
      tmp = new Float32Array(width * height);
      // Máscara de alfa pura: el RGB se tiña con `ink` mediante source-in tras el putImageData
      img = ctx!.createImageData(width, height);
      for (let i = 0; i < width * height; i++) {
        img.data[4 * i] = 0;
        img.data[4 * i + 1] = 0;
        img.data[4 * i + 2] = 0;
        img.data[4 * i + 3] = 0;
      }
      n = Math.min(MAX_AGENTS, Math.round((density * width * height) / 10000));
      ax = new Float32Array(n);
      ay = new Float32Array(n);
      aa = new Float32Array(n);
      recruit = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        recruit[i] = Math.random();
        ax[i] = Math.random() * width;
        ay[i] = Math.random() * height;
        aa[i] = Math.random() * TAU;
      }
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      px = clientX - rect.left;
      py = clientY - rect.top;
    }

    function sample(x: number, y: number) {
      const i = ((Math.floor(x) % width) + width) % width;
      const j = ((Math.floor(y) % height) + height) % height;
      return t0[j * width + i];
    }

    function step() {
      for (let s = 0; s < steps; s++) {
        for (let k = 0; k < n; k++) {
          const a = aa[k];
          const l = sample(ax[k] + Math.cos(a - sensorAngle) * sensor, ay[k] + Math.sin(a - sensorAngle) * sensor);
          const c = sample(ax[k] + Math.cos(a) * sensor, ay[k] + Math.sin(a) * sensor);
          const r = sample(ax[k] + Math.cos(a + sensorAngle) * sensor, ay[k] + Math.sin(a + sensorAngle) * sensor);
          if (c > l && c > r) {
            // sigue recto
          } else if (c < l && c < r) {
            aa[k] += (Math.random() < 0.5 ? -1 : 1) * turn;
          } else if (l > r) {
            aa[k] -= turn;
          } else if (r > l) {
            aa[k] += turn;
          }

          if (px !== OFF && recruit[k] < attraction / 3) {
            const dx = px - ax[k];
            const dy = py - ay[k];
            const d = Math.hypot(dx, dy);
            if (d < sink || (d >= reach && Math.random() < 0.02)) {
              const th = Math.random() * TAU;
              const rr = reach * (0.8 + 0.2 * Math.random());
              const nx = px + Math.cos(th) * rr;
              const ny = py + Math.sin(th) * rr;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                ax[k] = nx;
                ay[k] = ny;
                aa[k] = th + Math.PI + (Math.random() - 0.5) * 0.6;
              } else {
                ax[k] = Math.random() * width;
                ay[k] = Math.random() * height;
                aa[k] = Math.random() * TAU;
              }
              continue;
            }
            if (d < reach) {
              let diff = Math.atan2(dy, dx) - aa[k];
              diff = Math.atan2(Math.sin(diff), Math.cos(diff));
              aa[k] += diff * (0.06 + 0.1 * (1 - d / reach));
            }
          }

          ax[k] = (ax[k] + Math.cos(aa[k]) + width) % width;
          ay[k] = (ay[k] + Math.sin(aa[k]) + height) % height;
          t0[Math.floor(ay[k]) * width + Math.floor(ax[k])] += deposit;
        }
      }

      if (px !== OFF && lure > 0) {
        const r = Math.ceil(lureRadius);
        for (let dj = -r; dj <= r; dj++) {
          for (let di = -r; di <= r; di++) {
            const d = Math.hypot(di, dj);
            if (d > lureRadius) continue;
            const i = (((Math.floor(px) + di) % width) + width) % width;
            const j = (((Math.floor(py) + dj) % height) + height) % height;
            t0[j * width + i] += lure * (1 - d / lureRadius);
          }
        }
      }

      const keep = 1 - diffusion;
      const d = img!.data;
      for (let j = 0; j < height; j++) {
        const row = j * width;
        tmp[row] = (t0[row + width - 1] + t0[row] + t0[row + 1]) / 3;
        for (let i = 1; i < width - 1; i++) tmp[row + i] = (t0[row + i - 1] + t0[row + i] + t0[row + i + 1]) / 3;
        tmp[row + width - 1] = (t0[row + width - 2] + t0[row + width - 1] + t0[row]) / 3;
      }
      for (let j = 0; j < height; j++) {
        const jm = ((j - 1 + height) % height) * width;
        const jc = j * width;
        const jp = ((j + 1) % height) * width;
        for (let i = 0; i < width; i++) {
          const k = jc + i;
          const v = (t0[k] * keep + ((tmp[jm + i] + tmp[k] + tmp[jp + i]) / 3) * diffusion) * persistence;
          t1[k] = v;
          const t = (v - threshold) / edge;
          // Máscara de alfa pura: RGB 0, se tiña con `ink` tras el putImageData
          d[4 * k] = 0;
          d[4 * k + 1] = 0;
          d[4 * k + 2] = 0;
          d[4 * k + 3] = (t <= 0 ? 0 : t >= 1 ? opacity * mul : t * t * (3 - 2 * t) * opacity * mul) * 255;
        }
      }
      const sw = t0;
      t0 = t1;
      t1 = sw;
    }

    function animate() {
      step();
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      ink = style.getPropertyValue("--physarum-color").trim() || style.color;
      const k = style.getPropertyValue("--physarum-opacity").trim();
      mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.putImageData(img!, 0, 0);
      // Tiña la máscara de alfa con la tinta viva de la página
      ctx!.globalCompositeOperation = "source-in";
      ctx!.fillStyle = ink;
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "source-over";
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
  }, [density, steps, sensor, sensorAngle, turn, persistence, diffusion, attraction, reach, sink, lure, lureRadius, threshold, sharpness, opacity]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--physarum-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
