import { useEffect, useRef } from "react";

export interface MatrixBackgroundProps {
  /** Tamaño de la celda y del carácter (px) */
  size?: number;
  /** Caracteres que caen */
  chars?: string;
  /** Velocidad de caída (filas por fotograma): más bajo, más lento */
  speed?: number;
  /** Longitud de la estela (caracteres) */
  length?: number;
  /** Columnas a cada lado del puntero que también sueltan caracteres */
  spread?: number;
  /** Opacidad de la cabeza de cada gota (0-1); la estela se desvanece */
  alpha?: number;
  /** Opcional: fija el color de los caracteres. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Drop = { col: number; y: number; speed: number; len: number; chars: string[] };

export default function MatrixBackground({
  size = 18,
  chars = "01",
  speed = 0.22,
  length = 12,
  spread = 1,
  alpha = 0.3,
  color,
  className,
}: MatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const glyphs = Array.from(chars);
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let drops: Drop[] = [];
    let cooldown: number[] = [];
    let raf = 0;

    const rand = () => glyphs[Math.floor(Math.random() * glyphs.length)];

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / size);
      rows = Math.ceil(height / size);
      cooldown = new Array(cols).fill(0);
      drops = [];
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const col = Math.floor((clientX - rect.left) / size);
      const row = Math.floor((clientY - rect.top) / size);
      for (let dc = -spread; dc <= spread; dc++) {
        const c = col + dc;
        if (c < 0 || c >= cols || cooldown[c] > 0 || drops.length > 250) continue;
        if (Math.random() > (dc === 0 ? 0.9 : 0.35)) continue;
        cooldown[c] = 14;
        drops.push({
          col: c,
          y: row,
          speed: speed * (0.6 + Math.random() * 0.8),
          len: Math.round(length * (0.6 + Math.random() * 0.8)),
          chars: [rand()],
        });
      }
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.font = `${size * 0.9}px ui-monospace, Menlo, Consolas, monospace`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--matrix-color").trim() || style.color;
      const k = style.getPropertyValue("--matrix-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.fillStyle = ink;

      for (let c = 0; c < cols; c++) if (cooldown[c] > 0) cooldown[c]--;

      for (const d of drops) {
        const before = Math.floor(d.y);
        d.y += d.speed;
        if (Math.floor(d.y) !== before) {
          d.chars.unshift(rand());
          if (d.chars.length > d.len) d.chars.pop();
        } else if (Math.random() < 0.03) {
          d.chars[Math.floor(Math.random() * d.chars.length)] = rand();
        }
        const head = Math.floor(d.y);
        for (let i = 0; i < d.chars.length; i++) {
          const row = head - i;
          if (row < 0 || row >= rows) continue;
          setAlpha(alpha * Math.pow(1 - i / d.len, 1.6) * mul);
          ctx!.fillText(d.chars[i], d.col * size + size / 2, row * size + size / 2);
        }
      }
      ctx!.globalAlpha = 1;
      drops = drops.filter((d) => Math.floor(d.y) - d.len < rows);
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
  }, [size, chars, speed, length, spread, alpha]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--matrix-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
