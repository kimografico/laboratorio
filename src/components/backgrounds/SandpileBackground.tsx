import { useEffect, useRef } from "react";

export interface SandpileBackgroundProps {
  /** Tamaño de cada celda (px) */
  cell?: number;
  /** Granos que el puntero deja caer por fotograma en su celda */
  rate?: number;
  /** Pasadas de derrumbe por fotograma: más pasadas, las avalanchas avanzan más deprisa */
  sweeps?: number;
  /** Granos que caen solos por segundo en celdas al azar */
  ambient?: number;
  /** Granos que se pierden por segundo en celdas al azar (erosión): mantiene el montón en movimiento */
  erode?: number;
  /** Color de las avalanchas recientes */
  flash?: string;
  /** Color de la arena en reposo */
  color?: string;
  background?: string;
  className?: string;
}

export default function SandpileBackground({
  cell = 5,
  rate = 12,
  sweeps = 1,
  ambient = 15,
  erode = 90,
  flash = "#96701d",
  color = "rgba(0, 0, 0, 0.5)",
  background = "#e0dad5",
  className,
}: SandpileBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    // Altura de cada celda: estable con 0-3 granos; con 4 o más se derrumba y reparte uno a cada vecino
    let h = new Uint8Array(0);
    let hot = new Float32Array(0);
    let pcell = -1;
    let accA = 0;
    let accE = 0;
    let last = -1;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.max(4, Math.ceil(width / cell));
      rows = Math.max(4, Math.ceil(height / cell));
      h = new Uint8Array(cols * rows);
      hot = new Float32Array(cols * rows);
      for (let i = 0; i < h.length; i++) h[i] = Math.floor(Math.random() * 4);
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const i = Math.floor((clientX - rect.left) / cell);
      const j = Math.floor((clientY - rect.top) / cell);
      pcell = i >= 0 && i < cols && j >= 0 && j < rows ? j * cols + i : -1;
    }

    // Una pasada: toda celda con 4 o más granos reparte uno a cada vecino. Los granos que cruzan el borde se pierden.
    // El resultado final (estable) no depende del orden de los derrumbes
    function topple() {
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const c = j * cols + i;
          if (h[c] >= 4) {
            const q = h[c] >> 2;
            h[c] -= q * 4;
            hot[c] = 1;
            if (i > 0) h[c - 1] += q;
            if (i < cols - 1) h[c + 1] += q;
            if (j > 0) h[c - cols] += q;
            if (j < rows - 1) h[c + cols] += q;
          }
        }
      }
    }

    function animate(time: number) {
      const dt = last < 0 ? 16.67 : Math.min(time - last, 100);
      last = time;

      if (pcell >= 0) h[pcell] = Math.min(250, h[pcell] + rate);
      accA += (dt * ambient) / 1000;
      while (accA >= 1) {
        const c = Math.floor(Math.random() * h.length);
        h[c] = Math.min(250, h[c] + 1);
        accA -= 1;
      }
      accE += (dt * erode) / 1000;
      while (accE >= 1) {
        const c = Math.floor(Math.random() * h.length);
        if (h[c] > 0) h[c]--;
        accE -= 1;
      }

      for (let s = 0; s < sweeps; s++) topple();

      ctx!.clearRect(0, 0, width, height);
      const size = cell - 1;
      // Arena en reposo: tres niveles de opacidad según la altura; las celdas que acaban de derrumbarse, en otro color
      ctx!.fillStyle = color;
      for (let level = 1; level <= 3; level++) {
        ctx!.beginPath();
        for (let c = 0; c < h.length; c++) {
          if (h[c] === level) {
            const i = c % cols;
            ctx!.rect(i * cell, ((c - i) / cols) * cell, size, size);
          }
        }
        ctx!.globalAlpha = level / 3 * 0.9;
        ctx!.fill();
      }
      ctx!.fillStyle = flash;
      for (let c = 0; c < h.length; c++) {
        if (hot[c] > 0.05) {
          const i = c % cols;
          ctx!.globalAlpha = hot[c] * 0.9;
          ctx!.fillRect(i * cell, ((c - i) / cols) * cell, size, size);
          hot[c] *= 0.9;
        }
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
  }, [cell, rate, sweeps, ambient, erode, flash, color]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
