import { useEffect, useRef } from "react";

export interface IsoBackgroundProps {
  /** Ancho de cada columna (px): más pequeño, terreno más fino y más coste */
  size?: number;
  /** Altura máxima de las columnas (px) */
  height?: number;
  /** Velocidad con que el relieve se mueve (1 = normal, 0 = quieto) */
  speed?: number;
  /** Cuánto levanta el puntero el terreno a su alrededor (px de altura) */
  lift?: number;
  /** Radio de la colina que levanta el puntero (px) */
  radius?: number;
  /** Opacidad de la cara superior (0-1). Las caras laterales usan 1.8x y 2.6x este valor */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la página */
  color?: string;
  className?: string;
}

export default function IsoBackground({
  size = 80,
  height = 90,
  speed = 1,
  lift = 120,
  radius = 220,
  alpha = 0.06,
  color,
  className,
}: IsoBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Estilo computado vivo: el color, los tonos y la opacidad del tema se leen de aquí en cada fotograma
    const style = getComputedStyle(canvas);
    let w = 0;
    let h = 0;
    let hasPointer = false;
    let tx = 0;
    let ty = 0;
    let bx = 0; // posición suavizada de la colina del puntero
    let by = 0;
    let amp = 0;
    let frame = 0;
    let raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      bx = w / 2;
      by = h / 2;
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      tx = clientX - rect.left;
      ty = clientY - rect.top;
      if (!hasPointer) {
        bx = tx;
        by = ty;
      }
      hasPointer = true;
    }

    function animate(time: number) {
      raf = requestAnimationFrame(animate);
      // El relieve se mueve despacio: se calcula a 30 fps y los fotogramas impares conservan el dibujo anterior
      if (frame++ % 2 === 1) return;

      // Tema: color, tonos y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--iso-color").trim() || style.color;
      const k = style.getPropertyValue("--iso-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      // Tonos opcionales: un color plano por cara (superior, izquierda, derecha), definidos por la página
      const tones = [1, 2, 3].map((n) => style.getPropertyValue(`--iso-tone-${n}`).trim());
      const hasTones = tones.every(Boolean);
      const alphas = hasTones ? [mul, mul, mul] : [alpha * mul, alpha * 1.8 * mul, alpha * 2.6 * mul];

      bx += (tx - bx) * 0.08;
      by += (ty - by) * 0.08;
      amp += ((hasPointer ? 1 : 0) - amp) * 0.03;

      const a = size / 2; // media anchura y media altura de cada rombo (proyección isométrica 2:1)
      const b = size / 4;
      const t = time * 0.0005 * speed;
      const r2 = radius * radius;
      const y0 = -height - size; // la fila de origen queda por encima del borde superior
      const sMax = Math.ceil((h + height + size * 2 - y0) / b);
      const dMax = Math.ceil(w / 2 / a) + 2;

      ctx!.clearRect(0, 0, w, h);
      ctx!.lineJoin = "round";
      // Se dibuja de atrás adelante (s = c + r creciente). Las columnas de una misma fila no se solapan entre sí, así
      // que se agrupan: cada fila borra la silueta de todas sus columnas de una vez (lo que tapan de las filas de
      // atrás, sin dobles opacidades y sin color de fondo) y pinta cada tipo de cara con un solo relleno
      for (let s = 0; s <= sMax; s++) {
        const yb = y0 + s * b; // base de las columnas de esta fila
        if (yb < -height - b * 2 || yb > h + b * 4) continue;
        const ws: number[] = []; // x de cada columna y su altura
        const hs: number[] = [];
        for (let d = -dMax; d <= dMax; d++) {
          if ((s + d) & 1) continue; // retícula isométrica: c y r deben ser enteros
          const c = (s + d) / 2;
          const r = (s - d) / 2;
          const x = w / 2 + d * a;
          if (x < -a * 2 || x > w + a * 2) continue;
          // Relieve: dos ondas lentas sobre la retícula + la colina que sigue al puntero
          const f = 0.5 + 0.3 * Math.sin(0.28 * c + 0.17 * r + t) + 0.2 * Math.sin(0.19 * r - 0.31 * c - t * 0.7 + 1.7);
          let hh = height * (0.12 + 0.88 * f * f); // nunca del todo plano: siempre hay relieve
          const dx = x - bx;
          const dy = yb - by;
          hh += amp * lift * Math.exp(-(dx * dx + dy * dy) / r2);
          ws.push(x);
          hs.push(hh);
        }
        if (!ws.length) continue;

        // Silueta de las columnas de la fila (hexágonos): se borra lo que había detrás
        ctx!.globalCompositeOperation = "destination-out";
        ctx!.globalAlpha = 1;
        ctx!.beginPath();
        for (let i = 0; i < ws.length; i++) {
          const x = ws[i];
          const top = yb - hs[i];
          ctx!.moveTo(x, top - b);
          ctx!.lineTo(x + a, top);
          ctx!.lineTo(x + a, yb);
          ctx!.lineTo(x, yb + b);
          ctx!.lineTo(x - a, yb);
          ctx!.lineTo(x - a, top);
          ctx!.closePath();
        }
        ctx!.fill();
        ctx!.globalCompositeOperation = "source-over";

        // Tres tonos planos: cara superior, izquierda y derecha, cada una de un tirón
        for (let face = 0; face < 3; face++) {
          ctx!.beginPath();
          for (let i = 0; i < ws.length; i++) {
            const x = ws[i];
            const top = yb - hs[i];
            if (face === 0) {
              ctx!.moveTo(x, top - b);
              ctx!.lineTo(x + a, top);
              ctx!.lineTo(x, top + b);
              ctx!.lineTo(x - a, top);
            } else if (face === 1) {
              ctx!.moveTo(x - a, top);
              ctx!.lineTo(x, top + b);
              ctx!.lineTo(x, yb + b);
              ctx!.lineTo(x - a, yb);
            } else {
              ctx!.moveTo(x, top + b);
              ctx!.lineTo(x + a, top);
              ctx!.lineTo(x + a, yb);
              ctx!.lineTo(x, yb + b);
            }
            ctx!.closePath();
          }
          ctx!.fillStyle = hasTones ? tones[face] : ink;
          ctx!.globalAlpha = Math.min(1, alphas[face]);
          ctx!.fill();
        }
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
  }, [size, height, speed, lift, radius, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--iso-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
