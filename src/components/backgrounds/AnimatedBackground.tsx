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
  /** Color de relleno si no hay imagen */
  fill?: string;
  /** Color de fondo del contenedor */
  background?: string;
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
  fill = "#000000",
  background = "#e0dad5",
  className,
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    function animate() {
      ctx!.clearRect(0, 0, width, height);
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
        ctx!.fillStyle = fill;
        ctx!.fill();
      }
      ctx!.restore();
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onPointer(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });

    resize();
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      img.onload = null;
    };
  }, [image, size, radius, proximity, growth, ease, fill]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ backgroundColor: background }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
