import { useEffect, useRef } from "react";

export interface DoublePendulumBackgroundProps {
  /** Alcance total del péndulo, con todos los brazos estirados (px) */
  size?: number;
  /** Brazos: 2 = péndulo doble, 3 = triple (más caótico, como el problema de los tres cuerpos) */
  arms?: 2 | 3;
  /** Escala del tiempo de la simulación (1 = normal) */
  speed?: number;
  /** Puntos de la estela de la bola final */
  trail?: number;
  /** Cuánto empuja el puntero al rozar la bola final (0-1) */
  push?: number;
  /** Radio de influencia del puntero (px) */
  radius?: number;
  /** Posición horizontal del pivote, como fracción del ancho (0-1) */
  pivot?: number;
  /** Opacidad de los brazos (0-1); la estela usa un poco menos */
  alpha?: number;
  lineWidth?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

// Aceleraciones angulares de una cadena de n péndulos de masas iguales (ángulos desde la vertical):
// Σ_j μ_máx(i,j) l_i l_j cos(θi−θj) θ̈_j = −Σ_j μ_máx(i,j) l_i l_j sin(θi−θj) θ̇_j² − μ_i g l_i sin θ_i, con μ_i = n − i
function accel(t: number[], w: number[], L: number[], g: number): number[] {
  const n = t.length;
  const A: number[][] = [];
  const r: number[] = [];
  for (let i = 0; i < n; i++) {
    A.push([]);
    let rhs = -(n - i) * g * L[i] * Math.sin(t[i]);
    for (let j = 0; j < n; j++) {
      const mu = n - Math.max(i, j);
      A[i].push(mu * L[i] * L[j] * Math.cos(t[i] - t[j]));
      rhs -= mu * L[i] * L[j] * Math.sin(t[i] - t[j]) * w[j] * w[j];
    }
    r.push(rhs);
  }
  // Eliminación gaussiana con pivote parcial (n es 2 o 3)
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
    [A[c], A[p]] = [A[p], A[c]];
    [r[c], r[p]] = [r[p], r[c]];
    for (let i = c + 1; i < n; i++) {
      const f = A[i][c] / A[c][c];
      for (let j = c; j < n; j++) A[i][j] -= f * A[c][j];
      r[i] -= f * r[c];
    }
  }
  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = r[i];
    for (let j = i + 1; j < n; j++) sum -= A[i][j] * x[j];
    x[i] = sum / A[i][i];
  }
  return x;
}

export default function DoublePendulumBackground({
  size = 620,
  arms = 2,
  speed = 0.7,
  trail = 260,
  push = 0.6,
  radius = 110,
  pivot = 0.5,
  alpha = 0.4,
  lineWidth = 1.1,
  color,
  className,
}: DoublePendulumBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const n = arms === 3 ? 3 : 2;
    const T = Math.max(20, Math.round(trail));
    let w = 0;
    let h = 0;
    let px = -9999;
    let py = -9999;
    let pvx = 0;
    let pvy = 0;
    let hasPointer = false;
    let last = 0;
    let raf = 0;
    // Estado: ángulos y velocidades angulares. Brazos algo más cortos hacia la punta
    const L = Array.from({ length: n }, (_, i) => (size / n) * (1 - 0.08 * i));
    const t = Array.from({ length: n }, () => 1.2 + 1.8 * Math.random());
    const om = new Array<number>(n).fill(0);
    const g = size * 3;
    const tr = new Float32Array(T * 2);
    let head = 0;
    let count = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
    }

    function onMove(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const nx = clientX - rect.left;
      const ny = clientY - rect.top;
      if (hasPointer) {
        pvx = Math.max(-40, Math.min(40, pvx + (nx - px) * 0.5));
        pvy = Math.max(-40, Math.min(40, pvy + (ny - py) * 0.5));
      }
      px = nx;
      py = ny;
      hasPointer = true;
    }

    // Un clic da un empujón aleatorio: el caos hace el resto
    function onDown(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      if (clientX < rect.left || clientY < rect.top || clientX > rect.right || clientY > rect.bottom) return;
      for (let i = 0; i < n; i++) om[i] += (Math.random() - 0.5) * (4 + 2 * i);
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    // Un paso RK4 sobre el estado [θ..., ω...]: estable con el caos y sin perder energía poco a poco
    function rk4(hs: number) {
      const d = (tt: number[], ww: number[]): number[] => [...ww, ...accel(tt, ww, L, g)];
      const add = (k: number[], f: number): [number[], number[]] => [t.map((v, i) => v + k[i] * f), om.map((v, i) => v + k[n + i] * f)];
      const k1 = d(t, om);
      const k2 = d(...add(k1, hs / 2));
      const k3 = d(...add(k2, hs / 2));
      const k4 = d(...add(k3, hs));
      for (let i = 0; i < n; i++) {
        t[i] += ((k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * hs) / 6;
        om[i] += ((k1[n + i] + 2 * k2[n + i] + 2 * k3[n + i] + k4[n + i]) * hs) / 6;
        // Los ángulos se envuelven por separado: las fuerzas solo dependen de senos y cosenos
        t[i] %= Math.PI * 2;
      }
    }

    function animate(time: number) {
      const dt = last === 0 ? 0.016 : Math.min(0.05, (time - last) / 1000);
      last = time;
      ctx!.clearRect(0, 0, w, h);
      const ink = style.getPropertyValue("--double-pendulum-color").trim() || style.color;
      const k = style.getPropertyValue("--double-pendulum-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      pvx *= 0.9;
      pvy *= 0.9;

      const sdt = dt * speed;
      const nsub = Math.max(1, Math.ceil(sdt / 0.004));
      for (let i = 0; i < nsub; i++) rk4(sdt / nsub);

      const X = [w * pivot];
      const Y = [0];
      for (let i = 0; i < n; i++) {
        X.push(X[i] + Math.sin(t[i]) * L[i]);
        Y.push(Y[i] + Math.cos(t[i]) * L[i]);
      }
      const ex = X[n];
      const ey = Y[n];
      if (hasPointer) {
        const d = Math.hypot(ex - px, ey - py);
        if (d < radius) {
          // El puntero empuja la bola final en la dirección tangencial a su giro
          const f = (1 - d / radius) * push * 0.2;
          om[n - 1] += ((pvx * Math.cos(t[n - 1]) - pvy * Math.sin(t[n - 1])) / L[n - 1]) * f;
        }
      }
      tr[head * 2] = ex;
      tr[head * 2 + 1] = ey;
      head = (head + 1) % T;
      count = Math.min(T, count + 1);

      const a = alpha * mul;
      ctx!.lineWidth = lineWidth;
      // Estela en tramos de opacidad creciente: mucho más barato que un trazo por segmento
      const CH = 10;
      for (let c = 0; c < CH; c++) {
        const i0 = Math.floor((count * c) / CH);
        const i1 = Math.min(count - 1, Math.floor((count * (c + 1)) / CH));
        if (i1 <= i0) continue;
        ctx!.beginPath();
        for (let i = i0; i <= i1; i++) {
          const j = (head - count + i + T * 2) % T;
          if (i === i0) ctx!.moveTo(tr[j * 2], tr[j * 2 + 1]);
          else ctx!.lineTo(tr[j * 2], tr[j * 2 + 1]);
        }
        setAlpha(a * ((c + 1) / CH));
        ctx!.stroke();
      }
      ctx!.beginPath();
      ctx!.moveTo(X[0], Y[0]);
      for (let i = 1; i <= n; i++) ctx!.lineTo(X[i], Y[i]);
      setAlpha(a * 0.6);
      ctx!.stroke();
      ctx!.beginPath();
      for (let i = 1; i <= n; i++) {
        const r = i === n ? 5 : 3.5;
        ctx!.moveTo(X[i] + r, Y[i]);
        ctx!.arc(X[i], Y[i], r, 0, Math.PI * 2);
      }
      setAlpha(a * 0.3);
      ctx!.fill();
      setAlpha(a);
      ctx!.stroke();
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onMove(e.touches[0].clientX, e.touches[0].clientY);
    const onDownEvt = (e: PointerEvent) => onDown(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("pointerdown", onDownEvt);

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("pointerdown", onDownEvt);
    };
  }, [size, arms, speed, trail, push, radius, pivot, alpha, lineWidth]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--double-pendulum-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
