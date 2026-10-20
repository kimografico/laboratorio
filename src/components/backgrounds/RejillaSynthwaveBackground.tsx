// Fondo de hero: Rejilla synthwave
import { useEffect, useRef } from 'react';

export interface RejillaSynthwaveBackgroundProps {
  /** Columnas (4 a 24) */
  cols?: number;
  /** Filas (4 a 30) */
  rows?: number;
  /** Velocidad (-2 a 3) */
  speed?: number;
  /** Horizonte (0.3 a 0.8) */
  hor?: number;
  /** Sol (px) (0 a 300) */
  sun?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  cols: 12,
  rows: 14,
  speed: 1,
  hor: 0.55,
  sun: 120,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const hy=H*P.hor+(m.sy-H/2)*.1,vx=W/2+(m.sx-W/2)*.4,ph=((t*.0004*P.speed)%1+1)%1;c.strokeStyle=ink;c.fillStyle=ink;c.lineWidth=1;
c.globalAlpha=P.alpha*.25;c.beginPath();c.moveTo(vx+P.sun,hy);c.arc(vx,hy,P.sun,0,Math.PI,true);c.fill();
c.globalAlpha=P.alpha;c.beginPath();c.moveTo(0,hy);c.lineTo(W,hy);
for(let i=-P.cols;i<=P.cols;i++){c.moveTo(vx,hy);c.lineTo(vx+i*(W/P.cols)*.6,H)}
for(let k=0;k<P.rows;k++){const f=(k+ph)/P.rows,y=hy+(H-hy)*f*f;c.moveTo(0,y);c.lineTo(W,y)}c.stroke()}

export default function RejillaSynthwaveBackground(props: RejillaSynthwaveBackgroundProps) {
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
      const ink = style.getPropertyValue('--rejilla-synthwave-color').trim() || style.color;
      const k = style.getPropertyValue('--rejilla-synthwave-opacity').trim();
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
      style={color ? ({ '--rejilla-synthwave-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
