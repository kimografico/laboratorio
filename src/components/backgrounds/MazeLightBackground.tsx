
import { useEffect, useRef } from "react";

export interface MazeBackgroundProps {
  /** Tamaño de cada celda del laberinto (px) */
  cell?: number;
  /** Celdas que se excavan por fotograma mientras se genera */
  genSpeed?: number;
  /** Segundos que se mantiene el laberinto completo antes de disolverse y generar otro */
  hold?: number;
  /** Opacidad de los muros (0-1) */
  alpha?: number;
  /** Opcional: fija el color de los muros */
  color?: string;
  /** Color de la luz del puntero */
  glow?: string;
  /** Opacidad máxima de la luz (0-1) */
  glowOpacity?: number;
  /** Número de rayos para el cálculo de visibilidad */
  rays?: number;
  /** Distancia máxima de la luz (en celdas) */
  lightRange?: number;
  /** Suavizado del degradado radial */
  lightSoftness?: number;
  className?: string;
}

type CellWalls = { right: boolean; bottom: boolean };

type Point = { x: number; y: number };

export default function MazeBackground({
  cell = 30,
  genSpeed = 8,
  hold = 14,
  alpha = 0.45,
  color = "",
  glow = "#d9822b",
  glowOpacity = 0.55,
  rays = 180,
  lightRange = 5,
  lightSoftness = 1,
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

    let walls: CellWalls[] = [];
    let visited = new Uint8Array(0);
    let stack: number[] = [];

    let state: "gen" | "hold" | "dissolve" = "gen";
    let stateAt = 0;
    let fade = 1;
    let mouseCell = -1;

    // Posición exacta del puntero, en coordenadas del canvas.
    let mouseX = -1;
    let mouseY = -1;

    let last = -1;
    let raf = 0;

    function generate(start: number) {
      walls = new Array(cols * rows)
        .fill(0)
        .map(() => ({ right: true, bottom: true }));

      visited = new Uint8Array(cols * rows);
      stack = [start];
      visited[start] = 1;

      state = "gen";
      stateAt = 0;
      fade = 1;
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;

      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      // Dibujamos en píxeles CSS, aunque el canvas tenga mayor resolución.
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.max(2, Math.floor(width / cell));
      rows = Math.max(2, Math.floor(height / cell));

      ox = (width - cols * cell) / 2;
      oy = (height - rows * cell) / 2;

      generate(Math.floor(Math.random() * cols * rows));
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();

      mouseX = clientX - rect.left;
      mouseY = clientY - rect.top;

      const i = Math.floor((mouseX - ox) / cell);
      const j = Math.floor((mouseY - oy) / cell);

      mouseCell =
        i >= 0 && i < cols && j >= 0 && j < rows
          ? j * cols + i
          : -1;
    }

    function carve(steps: number) {
      for (let s = 0; s < steps && stack.length; s++) {
        const c = stack[stack.length - 1];
        const i = c % cols;
        const j = Math.floor(c / cols);
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
          walls[n].right = false;
        } else if (o === 1) {
          n = c + 1;
          walls[c].right = false;
        } else if (o === 2) {
          n = c - cols;
          walls[n].bottom = false;
        } else {
          n = c + cols;
          walls[c].bottom = false;
        }

        visited[n] = 1;
        stack.push(n);
      }
    }

    /**
     * Comprueba si existe un muro entre dos celdas adyacentes.
     * Las paredes se almacenan en el borde derecho e inferior.
     */
    function hasWallBetween(
      ci: number,
      cj: number,
      ni: number,
      nj: number,
    ): boolean {
      if (
        ci < 0 || ci >= cols ||
        cj < 0 || cj >= rows ||
        ni < 0 || ni >= cols ||
        nj < 0 || nj >= rows
      ) {
        return true;
      }

      const current = cj * cols + ci;
      const next = nj * cols + ni;

      if (ni > ci) return walls[current].right;
      if (ni < ci) return walls[next].right;
      if (nj > cj) return walls[current].bottom;
      if (nj < cj) return walls[next].bottom;

      return false;
    }

    /**
     * Lanza un rayo desde la posición real del puntero.
     *
     * Recorre la cuadrícula mediante DDA, calculando las intersecciones
     * exactas con los límites de las celdas en lugar de avanzar en pasos
     * pequeños. Esto evita saltarse paredes y reduce errores en esquinas.
     */
    function castRay(
      originX: number,
      originY: number,
      angle: number,
    ): Point {
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      // Coordenadas del origen expresadas en celdas.
      const gx = (originX - ox) / cell;
      const gy = (originY - oy) / cell;

      let ci = Math.floor(gx);
      let cj = Math.floor(gy);

      const stepX = dx > 0 ? 1 : -1;
      const stepY = dy > 0 ? 1 : -1;

      const deltaX =
        Math.abs(dx) < 1e-10 ? Infinity : Math.abs(1 / dx);
      const deltaY =
        Math.abs(dy) < 1e-10 ? Infinity : Math.abs(1 / dy);

      let maxX =
        Math.abs(dx) < 1e-10
          ? Infinity
          : (dx > 0 ? ci + 1 - gx : gx - ci) / Math.abs(dx);

      let maxY =
        Math.abs(dy) < 1e-10
          ? Infinity
          : (dy > 0 ? cj + 1 - gy : gy - cj) / Math.abs(dy);

      let distance = 0;
      const maxDistance = Math.max(0, lightRange);

      while (distance < maxDistance) {
        const cornerTolerance = 1e-9;

        // El siguiente cruce está en una esquina de la cuadrícula.
        if (Math.abs(maxX - maxY) < cornerTolerance) {
          const nextX = ci + stepX;
          const nextY = cj + stepY;
          const nextDistance = maxX;

          // Una esquina bloquea el rayo si cualquiera de los dos
          // bordes que tiene que cruzar está cerrado.
          const blockedX = hasWallBetween(
            ci, cj, nextX, cj,
          );
          const blockedY = hasWallBetween(
            ci, cj, ci, nextY,
          );

          if (blockedX || blockedY) {
            distance = nextDistance;
            break;
          }

          ci = nextX;
          cj = nextY;
          distance = nextDistance;
          maxX += deltaX;
          maxY += deltaY;
        } else if (maxX < maxY) {
          const nextX = ci + stepX;
          const nextDistance = maxX;

          if (hasWallBetween(ci, cj, nextX, cj)) {
            distance = nextDistance;
            break;
          }

          ci = nextX;
          distance = nextDistance;
          maxX += deltaX;
        } else {
          const nextY = cj + stepY;
          const nextDistance = maxY;

          if (hasWallBetween(ci, cj, ci, nextY)) {
            distance = nextDistance;
            break;
          }

          cj = nextY;
          distance = nextDistance;
          maxY += deltaY;
        }

        // El rayo ha salido del laberinto.
        if (ci < 0 || ci >= cols || cj < 0 || cj >= rows) {
          break;
        }
      }

      // El pequeño margen evita que el relleno invada visualmente
      // la línea del muro por errores de antialiasing.
      const safeDistance = Math.max(0, distance - 0.002);

      return {
        x: originX + dx * safeDistance * cell,
        y: originY + dy * safeDistance * cell,
      };
    }

    /**
     * Calcula el polígono de visibilidad alrededor del puntero.
     * Los rayos se ordenan angularmente para formar un contorno continuo.
     */
    function castVisibilityPolygon(
      originX: number,
      originY: number,
    ): Point[] {
      const points: Point[] = [];
      const rayCount = Math.max(8, Math.floor(rays));

      for (let r = 0; r < rayCount; r++) {
        const angle = (r / rayCount) * Math.PI * 2;

        points.push(castRay(originX, originY, angle));
      }

      return points;
    }

    /**
     * Dibuja una luz continua, recortada por el polígono de visibilidad.
     * El degradado es radial, pero su límite espacial lo determinan
     * exclusivamente los muros y el alcance máximo de la luz.
     */
    function drawLight(visibility: Point[]) {
      if (visibility.length < 3) return;

      ctx!.save();

      ctx!.beginPath();
      ctx!.moveTo(visibility[0].x, visibility[0].y);

      for (let i = 1; i < visibility.length; i++) {
        ctx!.lineTo(visibility[i].x, visibility[i].y);
      }

      ctx!.closePath();
      ctx!.clip();

      const radius = Math.max(1, lightRange * cell);
      const gradient = ctx!.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        radius,
      );

      // Conserva el parámetro de suavizado existente.
      // Un valor alto concentra la transición hacia el exterior.
      const softness = Math.min(1, Math.max(0.05, lightSoftness));
      const fadeStart = Math.max(0, 1 - softness);

      gradient.addColorStop(0, glow);

      if (fadeStart > 0) {
        gradient.addColorStop(fadeStart, glow);
      }

      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx!.globalAlpha = glowOpacity;
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, width, height);

      ctx!.restore();
    }

    function animate(time: number) {
      if (last < 0) last = time;
      last = time;

      if (state === "gen") {
        carve(genSpeed);

        if (!stack.length) {
          state = "hold";
          stateAt = time;
        }
      } else if (state === "hold") {
        if (time - stateAt > hold * 1000) {
          state = "dissolve";
          stateAt = time;
        }
      } else {
        fade = Math.max(0, 1 - (time - stateAt) / 1500);

        if (fade <= 0) {
          generate(
            mouseCell >= 0
              ? mouseCell
              : Math.floor(Math.random() * cols * rows),
          );
        }
      }

      ctx!.clearRect(0, 0, width, height);

      const ink =
        style.getPropertyValue("--maze-color").trim() || style.color;

      const kOp = style.getPropertyValue("--maze-opacity").trim();
      const mul =
        kOp !== "" && Number.isFinite(Number(kOp))
          ? Number(kOp)
          : 1;

      // La luz parte de la posición exacta del puntero,
      // no del centro de la celda en la que se encuentra.
      if (
        mouseCell >= 0 &&
        visited[mouseCell] &&
        mouseX >= ox &&
        mouseX <= ox + cols * cell &&
        mouseY >= oy &&
        mouseY <= oy + rows * cell
      ) {
        const visibility = castVisibilityPolygon(mouseX, mouseY);

        ctx!.save();
        ctx!.globalAlpha = fade * mul;
        drawLight(visibility);
        ctx!.restore();
      }

      // Dibujado de los muros: se mantiene la lógica original.
      ctx!.globalAlpha = fade * alpha * mul;
      ctx!.strokeStyle = ink;
      ctx!.lineWidth = 1.5;
      ctx!.lineCap = "round";
      ctx!.beginPath();

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const c = j * cols + i;
          const w = walls[c];

          const x = ox + i * cell;
          const y = oy + j * cell;

          const cellVisited = visited[c];
          const rightVisited =
            i < cols - 1 ? visited[c + 1] : 0;
          const belowVisited =
            j < rows - 1 ? visited[c + cols] : 0;

          if (w.right && (cellVisited || rightVisited)) {
            ctx!.moveTo(x + cell, y);
            ctx!.lineTo(x + cell, y + cell);
          }

          if (w.bottom && (cellVisited || belowVisited)) {
            ctx!.moveTo(x, y + cell);
            ctx!.lineTo(x + cell, y + cell);
          }

          if (j === 0 && cellVisited) {
            ctx!.moveTo(x, y);
            ctx!.lineTo(x + cell, y);
          }

          if (i === 0 && cellVisited) {
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

    const onMouse = (e: MouseEvent) =>
      onPointer(e.clientX, e.clientY);

    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) onPointer(touch.clientX, touch.clientY);
    };

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
  }, [
    cell,
    genSpeed,
    hold,
    alpha,
    glow,
    glowOpacity,
    rays,
    lightRange,
    lightSoftness,
  ]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={
        color
          ? ({ "--maze-color": color } as React.CSSProperties)
          : undefined
      }
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          backgroundColor: "var(--panel)",
        }}
      />
    </div>
  );
}
