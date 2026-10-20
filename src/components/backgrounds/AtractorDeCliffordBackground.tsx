// Fondo de hero: Atractor de Clifford
import { useEffect, useRef } from 'react';

export interface AtractorDeCliffordBackgroundProps {
  /** a (-2 a 2) */
  a?: number;
  /** b (-2 a 2) */
  b?: number;
  /** c (-2 a 2) */
  cc?: number;
  /** d (-2 a 2) */
  d?: number;
  /** Efecto puntero (0 a 1) */
  mouse?: number;
  /** Deriva (0 a 2) */
  drift?: number;
  /** Puntos (2000 a 40000) */
  n?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  a: -1.4,
  b: 1.6,
  cc: 1,
  d: 0.7,
  mouse: 0.75,
  drift: 2,
  n: 20000,
  alpha: 0.35,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const a=P.a+(m.sx/W-.5)*P.mouse+Math.sin(t*.0002)*.1*P.drift,b=P.b+(m.sy/H-.5)*P.mouse+Math.cos(t*.00017)*.1*P.drift,cc=P.cc,d=P.d,sc=Math.min(W,H)*.2,ox=W/2,oy=H/2;
let x=.1,y=.1;c.fillStyle=ink;c.globalAlpha=P.alpha;for(let i=0;i<P.n;i++){const nx=Math.sin(a*y)+cc*Math.cos(a*x);y=Math.sin(b*x)+d*Math.cos(b*y);x=nx;if(i>20)c.fillRect(ox+x*sc,oy+y*sc,1.2,1.2)}}

export default function AtractorDeCliffordBackground(props: AtractorDeCliffordBackgroundProps) {
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
      const ink = style.getPropertyValue('--atractor-de-clifford-color').trim() || style.color;
      const k = style.getPropertyValue('--atractor-de-clifford-opacity').trim();
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
      style={color ? ({ '--atractor-de-clifford-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
