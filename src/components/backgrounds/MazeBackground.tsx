import { useEffect, useRef } from "react";

export interface MazeBackgroundProps {
  /** Tamaño de cada celda del laberinto (px) */
  cell?: number;
  /** Celdas que se excavan por fotograma mientras se genera */
  genSpeed?: number;
  /** Segundos que se mantiene el laberinto completo antes de disolverse y generar otro */
  hold?: number;
  /** Velocidad a la que la luz recorre los pasillos (celdas por segundo) */
  waveSpeed?: number;
  /** Anchura del frente de luz (en celdas) */
  waveWidth?: number;
  /** Segundos que dura cada onda de luz */
  waveLife?: number;
  /** Ondas que nacen solas por segundo en celdas al azar (además de las del puntero) */
  ambient?: number;
  lineWidth?: number;
  /** Opacidad de los muros (0-1) */
  alpha?: number;
  /** Opcional: fija el color de los muros. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  /** Color de la luz que recorre los pasillos (tonalidad de la paleta) */
  glow?: string;
  /** Opacidad máxima de la luz (0-1) */
  glowOpacity?: number;
  className?: string;
}

type Wave = { dist: Int16Array; start: number };

export default function MazeBackground({
  cell = 30,
  genSpeed = 8,
  hold = 14,
  waveSpeed = 14,
  waveWidth = 2.5,
  waveLife = 4,
  ambient = 0.4,
  lineWidth = 1.2,
  alpha = 0.45,
  color,
  glow = "#d9822b",
  glowOpacity = 0.55,
  className,
}: MazeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    let wallR = new Uint8Array(0);
    let wallB = new Uint8Array(0);
    let visited = new Uint8Array(0);
    let stack: number[] = [];
    let glowMap = new Float32Array(0);
    let waves: Wave[] = [];
    let state: "gen" | "hold" | "dissolve" = "gen";
    let stateAt = 0;
    let fade = 1;
    let originCell = -1;
    let lastWave = 0;
    let acc = 0;
    let pcell = -1;
    let last = -1;
    let raf = 0;

    function generate(start: number) {
      wallR = new Uint8Array(cols * rows).fill(1);
      wallB = new Uint8Array(cols * rows).fill(1);
      visited = new Uint8Array(cols * rows);
      glowMap = new Float32Array(cols * rows);
      waves = [];
      visited[start] = 1;
      stack = [start];
      state = "gen";
      fade = 1;
      originCell = -1;
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.max(2, Math.floor(width / cell));
      rows = Math.max(2, Math.floor(height / cell));
      ox = (width - cols * cell) / 2;
      oy = (height - rows * cell) / 2;
      generate(Math.floor(Math.random() * cols * rows));
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const i = Math.floor((clientX - rect.left - ox) / cell);
      const j = Math.floor((clientY - rect.top - oy) / cell);
      pcell = i >= 0 && i < cols && j >= 0 && j < rows ? j * cols + i : -1;
    }

    function carve(steps: number) {
      for (let s = 0; s < steps && stack.length; s++) {
        const c = stack[stack.length - 1];
        const i = c % cols;
        const j = (c - i) / cols;
        const opts: number[] = [];
        if (i > 0 && !visited[c - 1]) opts.push(0);
        if (i < cols - 1 && !visited[c + 1]) opts.push(1);
        if (j > 0 && !visited[c - cols]) opts.push(2);
        if (j < rows - 1 && !visited[c + cols]) opts.push(3);
        if (!opts.length) {
          stack.pop();
          continue;
        }
        const o = opts[Math.floor(Math.random() * opts.length)];
        let n = c;
        if (o === 0) {
          n = c - 1;
          wallR[n] = 0;
        } else if (o === 1) {
          n = c + 1;
          wallR[c] = 0;
        } else if (o === 2) {
          n = c - cols;
          wallB[n] = 0;
        } else {
          n = c + cols;
          wallB[c] = 0;
        }
        visited[n] = 1;
        stack.push(n);
      }
    }

    function bfs(from: number) {
      const dist = new Int16Array(cols * rows).fill(-1);
      const q = [from];
      dist[from] = 0;
      for (let h = 0; h < q.length; h++) {
        const c = q[h];
        const i = c % cols;
        const next: number[] = [];
        if (i < cols - 1 && !wallR[c]) next.push(c + 1);
        if (i > 0 && !wallR[c - 1]) next.push(c - 1);
        if (c + cols < cols * rows && !wallB[c]) next.push(c + cols);
        if (c - cols >= 0 && !wallB[c - cols]) next.push(c - cols);
        for (const n of next) {
          if (dist[n] < 0) {
            dist[n] = dist[c] + 1;
            q.push(n);
          }
        }
      }
      return dist;
    }

    function pulse(from: number, time: number) {
      waves.push({ dist: bfs(from), start: time });
      if (waves.length > 4) waves.shift();
      lastWave = time;
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate(time: number) {
      const dt = last < 0 ? 16.67 : Math.min(time - last, 100);
      last = time;

      if (state === "gen") {
        carve(genSpeed);
        if (!stack.length) {
          state = "hold";
          stateAt = time;
        }
      } else if (state === "hold") {
        if (pcell >= 0 && pcell !== originCell && time - lastWave > 120) {
          originCell = pcell;
          pulse(pcell, time);
        }
        acc += (dt * ambient) / 1000;
        while (acc >= 1) {
          pulse(Math.floor(Math.random() * cols * rows), time);
          acc -= 1;
        }
        if (time - stateAt > hold * 1000) {
          state = "dissolve";
          stateAt = time;
        }
      } else {
        fade = Math.max(0, 1 - (time - stateAt) / 1500);
        if (fade <= 0) generate(pcell >= 0 ? pcell : Math.floor(Math.random() * cols * rows));
      }

      glowMap.fill(0);
      waves = waves.filter((w) => (time - w.start) / 1000 < waveLife);
      for (const w of waves) {
        const age = (time - w.start) / 1000;
        const r = waveSpeed * age;
        const k = 1 - age / waveLife;
        for (let c = 0; c < glowMap.length; c++) {
          const d = w.dist[c];
          if (d < 0) continue;
          const x = (d - r) / waveWidth;
          glowMap[c] += Math.exp(-x * x) * k + 0.25 * Math.exp(-d / 10) * k * k;
        }
      }

      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--maze-color").trim() || style.color;
      const kOp = style.getPropertyValue("--maze-opacity").trim();
      const mul = kOp !== "" && Number.isFinite(Number(kOp)) ? Number(kOp) : 1;

      setAlpha(fade * mul);
      ctx!.fillStyle = glow;
      for (let c = 0; c < glowMap.length; c++) {
        const g = glowMap[c];
        if (g < 0.03) continue;
        const i = c % cols;
        const j = (c - i) / cols;
        setAlpha(fade * Math.min(1, g) * glowOpacity * mul);
        ctx!.fillRect(ox + i * cell + 1, oy + j * cell + 1, cell - 1, cell - 1);
      }

      setAlpha(fade * alpha * mul);
      ctx!.strokeStyle = ink;
      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";
      ctx!.beginPath();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const c = j * cols + i;
          const right = i < cols - 1 ? c + 1 : c;
          const below = j < rows - 1 ? c + cols : c;
          const x = ox + i * cell;
          const y = oy + j * cell;
          if (wallR[c] && (visited[c] || visited[right])) {
            ctx!.moveTo(x + cell, y);
            ctx!.lineTo(x + cell, y + cell);
          }
          if (wallB[c] && (visited[c] || visited[below])) {
            ctx!.moveTo(x, y + cell);
            ctx!.lineTo(x + cell, y + cell);
          }
          if (j === 0 && visited[c]) {
            ctx!.moveTo(x, y);
            ctx!.lineTo(x + cell, y);
          }
          if (i === 0 && visited[c]) {
            ctx!.moveTo(x, y);
            ctx!.lineTo(x, y + cell);
          }
        }
      }
      ctx!.stroke();
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
  }, [cell, genSpeed, hold, waveSpeed, waveWidth, waveLife, ambient, lineWidth, alpha, glow, glowOpacity]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--maze-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
