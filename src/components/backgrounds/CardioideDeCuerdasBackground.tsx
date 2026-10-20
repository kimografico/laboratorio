// Fondo de hero: Cardioide de cuerdas
import { useEffect, useRef } from 'react';

export interface CardioideDeCuerdasBackgroundProps {
  /** Puntos (60 a 500) */
  n?: number;
  /** Factor (1.5 a 12) */
  k?: number;
  /** Efecto puntero (0 a 6) */
  mouse?: number;
  /** Deriva (0 a 1) */
  drift?: number;
  /** Radio (px) (100 a 500) */
  size?: number;
  /** Grosor (0.3 a 2) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  n: 260,
  k: 2,
  mouse: 2,
  drift: 0.15,
  size: 300,
  lw: 0.6,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const k=P.k+(m.sx/W-.5)*P.mouse+Math.sin(t*.0003)*P.drift,N=P.n,R=Math.min(P.size,Math.min(W,H)*.48);c.strokeStyle=ink;c.lineWidth=P.lw;c.globalAlpha=P.alpha;c.beginPath();
for(let i=0;i<N;i++){const a=i/N*6.2832-1.5708,b=i*k/N*6.2832-1.5708;c.moveTo(W/2+R*Math.cos(a),H/2+R*Math.sin(a));c.lineTo(W/2+R*Math.cos(b),H/2+R*Math.sin(b))}c.stroke();c.beginPath();c.moveTo(W/2+R,H/2);c.arc(W/2,H/2,R,0,6.2832);c.globalAlpha=P.alpha*.5;c.stroke()}

export default function CardioideDeCuerdasBackground(props: CardioideDeCuerdasBackgroundProps) {
  const { color, className, ...rest } = props;
  const P: Params = { ...DEFAULTS, ...rest };
  const key = JSON.stringify(P);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const m: Pointer = { x: 0, y: 0, sx: 0, sy: 0, on: false };
    let width = 0;
    let height = 0;
    let S: any = {};
    let last = 0;
    let raf = 0;

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      if (!m.on) {
        m.x = m.sx = width / 2;
        m.y = m.sy = height / 2;
      }
      S = {};
      init(width, height, P, S);
    }

    function setPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      m.x = clientX - rect.left;
      m.y = clientY - rect.top;
      if (!m.on) {
        m.sx = m.x;
        m.sy = m.y;
      }
      m.on = true;
    }

    function animate(t: number) {
      const dt = Math.min(t - last, 50);
      last = t;
      m.sx += (m.x - m.sx) * 0.12;
      m.sy += (m.y - m.sy) * 0.12;
      // Tinta y opacidad leidas del CSS de la pagina en cada fotograma
      const ink = style.getPropertyValue('--cardioide-de-cuerdas-color').trim() || style.color;
      const k = style.getPropertyValue('--cardioide-de-cuerdas-opacity').trim();
      canvas.style.opacity = k !== '' && Number.isFinite(Number(k)) ? k : '';
      ctx!.globalAlpha = 1;
      ctx!.clearRect(0, 0, width, height);
      frame(ctx!, width, height, P, S, t, m, ink, dt);
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => setPointer(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('touchmove', onTouch, { passive: true });

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div
      className={`bg-canvas ${className ?? ''}`.trim()}
      style={color ? ({ '--cardioide-de-cuerdas-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
