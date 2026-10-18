import { useEffect, useRef } from "react";

export interface AnimatedBackgroundProps {
  /** URL de la imagen que se ve a través de los círculos. Si no se pasa, se rellenan de color sólido. */
  image?: string;
  /** Separación entre círculos (px) */
  size?: number;
  /** Radio base de cada círculo (px) */
  radius?: number;
  /** Distancia de influencia del puntero (px) */
  proximity?: number;
  /** Crecimiento máximo del radio cerca del puntero (px) */
  growth?: number;
  /** Suavizado de la animación (0.02 - 0.15) */
  ease?: number;
  /** Opcional: fija el color de los círculos. Por defecto se hereda del CSS de la página (`color`). */
  color?: string;
  className?: string;
}

type Dot = { x: number; y: number; r: number; grow: number };

export default function AnimatedBackground({
  image,
  size = 30,
  radius = 1,
  proximity = 125,
  growth = 60,
  ease = 0.075,
  color,
  className,
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let raf = 0;

    const img = new Image();
    let imageLoaded = false;
    if (image) {
      img.onload = () => (imageLoaded = true);
      img.src = image;
    }

    function build() {
      const columns = Math.ceil(width / size) + 1;
      const rows = Math.ceil(height / size) + 1;
      dots = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          dots.push({ x: col * size, y: row * size, r: radius, grow: 0 });
        }
      }
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      build();
    }

    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      for (const d of dots) {
        const distance = Math.hypot(d.x - px, d.y - py);
        const t = 1 - Math.min(Math.max(distance / proximity, 0), 1);
        d.grow = t * growth;
      }
    }

    function drawImage() {
      ctx!.clip();
      const { naturalWidth: iw, naturalHeight: ih } = img;
      const ratio = Math.max(width / iw, height / ih);
      const w = iw * ratio;
      const h = ih * ratio;
      ctx!.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
    }

    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      // Tinta y opacidad leídas del CSS de la página en cada fotograma
      const ink = style.getPropertyValue("--animated-color").trim() || style.color;
      const k = style.getPropertyValue("--animated-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      ctx!.save();
      ctx!.beginPath();
      for (const d of dots) {
        d.r += (radius + d.grow - d.r) * ease;
        ctx!.moveTo(d.x, d.y);
        ctx!.arc(d.x, d.y, Math.max(d.r, 0), 0, Math.PI * 2);
      }
      if (imageLoaded) {
        drawImage();
      } else {
        setAlpha(mul);
        ctx!.fill();
      }
      ctx!.restore();
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
      img.onload = null;
    };
  }, [image, size, radius, proximity, growth, ease]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--animated-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
