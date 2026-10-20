// Fondo de hero: Tendido de cables
import { useEffect, useRef } from 'react';

export interface TendidoDeCablesBackgroundProps {
  /** Cables (2 a 16) */
  rows?: number;
  /** Holgura (0.02 a 0.4) */
  slack?: number;
  /** Gravedad (0.05 a 1) */
  g?: number;
  /** Alcance (30 a 250) */
  reach?: number;
  /** Empuje (0 a 30) */
  push?: number;
  /** Grosor (0.5 a 3) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  rows: 16,
  slack: 0.03,
  g: 0.35,
  reach: 110,
  push: 10,
  lw: 1.2,
  alpha: 0.55,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {const N=30;S.N=N;S.c=[];for(let i=0;i<P.rows;i++){const y=(i+1)*H/(P.rows+1),o:{x:number[],y:number[],a:number[],b:number[]}={x:[],y:[],a:[],b:[]};for(let j=0;j<N;j++){const x=j/(N-1)*W;o.x.push(x);o.y.push(y);o.a.push(x);o.b.push(y)}S.c.push(o)}}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const N=S.N,seg=W*(1+P.slack)/(N-1);c.strokeStyle=ink;c.lineWidth=P.lw;c.lineJoin='round';c.globalAlpha=P.alpha;c.beginPath();
for(const o of S.c){for(let j=1;j<N-1;j++){const vx=(o.x[j]-o.a[j])*.985,vy=(o.y[j]-o.b[j])*.985;o.a[j]=o.x[j];o.b[j]=o.y[j];o.x[j]+=vx;o.y[j]+=vy+P.g;
if(m.on){const dx=o.x[j]-m.sx,dy=o.y[j]-m.sy,d=Math.hypot(dx,dy);if(d<P.reach&&d>.01){const f=(1-d/P.reach)*P.push;o.x[j]+=dx/d*f;o.y[j]+=dy/d*f}}}
for(let it=0;it<12;it++)for(let j=0;j<N-1;j++){const wa=j==0?0:1,wb=j==N-2?0:1,tt=wa+wb;if(!tt)continue;const dx=o.x[j+1]-o.x[j],dy=o.y[j+1]-o.y[j],d=Math.hypot(dx,dy)||1,k=(d-seg)/d;o.x[j]+=dx*k*wa/tt;o.y[j]+=dy*k*wa/tt;o.x[j+1]-=dx*k*wb/tt;o.y[j+1]-=dy*k*wb/tt}
for(let j=0;j<N;j++)j?c.lineTo(o.x[j],o.y[j]):c.moveTo(o.x[j],o.y[j])}c.stroke()}

export default function TendidoDeCablesBackground(props: TendidoDeCablesBackgroundProps) {
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
      const ink = style.getPropertyValue('--tendido-de-cables-color').trim() || style.color;
      const k = style.getPropertyValue('--tendido-de-cables-opacity').trim();
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
      style={color ? ({ '--tendido-de-cables-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
