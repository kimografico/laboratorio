// Fondo de hero: Tabla de Lissajous
import { useEffect, useRef } from 'react';

export interface TablaDeLissajousBackgroundProps {
  /** Celda (px) (40 a 140) */
  cell?: number;
  /** Velocidad (0 a 2) */
  speed?: number;
  /** Alcance puntero (50 a 400) */
  reach?: number;
  /** Grosor (0.5 a 3) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  cell: 80,
  speed: 0.5,
  reach: 200,
  lw: 1,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const n=P.cell,C=Math.ceil(W/n),R=Math.ceil(H/n);c.strokeStyle=ink;c.lineWidth=P.lw;c.globalAlpha=P.alpha;c.beginPath();
for(let j=0;j<R;j++)for(let i=0;i<C;i++){const cx=(i+.5)*n,cy=(j+.5)*n,k=Math.max(0,1-Math.hypot(cx-m.sx,cy-m.sy)/P.reach),a=n*.38*(1+.35*k),ph=t*.001*P.speed+k*2,fa=1+i%5,fb=1+j%5;
for(let s=0;s<=64;s++){const u=s/64*6.2832,x=cx+a*Math.sin(fa*u+ph),y=cy+a*Math.sin(fb*u);s?c.lineTo(x,y):c.moveTo(x,y)}}c.stroke()}

export default function TablaDeLissajousBackground(props: TablaDeLissajousBackgroundProps) {
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
      const ink = style.getPropertyValue('--tabla-de-lissajous-color').trim() || style.color;
      const k = style.getPropertyValue('--tabla-de-lissajous-opacity').trim();
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
      style={color ? ({ '--tabla-de-lissajous-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
