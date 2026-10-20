// Fondo de hero: Fuego
import { useEffect, useRef } from 'react';

export interface FuegoBackgroundProps {
  /** Celda (px) (1 a 10) */
  cell?: number;
  /** Base de brasas (0 a 1) */
  base?: number;
  /** Ancho brasas (0.1 a 1.5) */
  bwidth?: number;
  /** Enfriamiento (0.01 a 0.20) */
  decay?: number;
  /** Enfriamiento puntero (0.01 a 0.20) */
  pdecay?: number;
  /** Viento (-1 a 1) */
  wind?: number;
  /** Radio puntero (10 a 120) */
  rad?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Color fijo (por defecto #ff7300). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  cell: 2,
  base: 1,
  bwidth: 1.5,
  decay: 0.03,
  pdecay: 0.15,
  wind: 0.45,
  rad: 20,
  alpha: 0.8,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.C=Math.ceil(W/P.cell);S.R=Math.ceil(H/P.cell);S.h=new Float32Array(S.C*S.R);S.q=new Float32Array(S.C*S.R);S.o=document.createElement('canvas');S.o.width=S.C;S.o.height=S.R;S.x=S.o.getContext('2d')}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const C=S.C,R=S.R,h=S.h,q=S.q;
const bw=P.bwidth,floor=bw <= 1 ? .4*bw : .4+.6*(bw-1),fw=bw <= 1 ? 1+8*(1-bw) : 1-.6*(bw-1);for(let x=0;x<C;x++){const wave=(Math.sin(x*.3+t*.003)+1)/2,focus=Math.pow(wave,fw);h[(R-1)*C+x]=P.base*(floor+(1-floor)*focus);q[(R-1)*C+x]=0}
if(m.on){const cx=m.sx/P.cell,cy=m.sy/P.cell,rr=P.rad/P.cell;for(let j=Math.max(0,Math.floor(cy-rr));j<Math.min(R,cy+rr);j++)for(let i=Math.max(0,Math.floor(cx-rr));i<Math.min(C,cx+rr);i++)if(Math.hypot(i-cx,j-cy)<rr){h[j*C+i]=1;q[j*C+i]=1}}
for(let y=0;y<R-1;y++)for(let x=0;x<C;x++){const s=h[(y+1)*C+x],pq=q[(y+1)*C+x],r=Math.floor(Math.random()*3),dx=Math.min(C-1,Math.max(0,x-r+1+Math.round(P.wind))),v=s-(r&1)*(P.decay+(P.pdecay-P.decay)*pq);h[y*C+dx]=v>0?v:0;q[y*C+dx]=v>0?pq:0}
const img=S.x.createImageData(C,R),d=img.data;for(let i=0;i<h.length;i++)d[4*i+3]=Math.pow(Math.min(1,h[i]),1.6)*255*P.alpha;S.x.putImageData(img,0,0);
c.imageSmoothingEnabled=true;c.drawImage(S.o,0,0,C,R,0,0,W,H);c.globalCompositeOperation='source-in';c.fillStyle=ink;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}

export default function FuegoBackground(props: FuegoBackgroundProps) {
  const { color = "#ff7300", className, ...rest } = props;
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
      const ink = style.getPropertyValue('--fuego-color').trim() || style.color;
      const k = style.getPropertyValue('--fuego-opacity').trim();
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
      style={color ? ({ '--fuego-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
