// Fondo de hero: Luz y sombras
import { useEffect, useRef } from 'react';

export interface LuzYSombrasBackgroundProps {
  /** Obstáculos (2 a 30) */
  n?: number;
  /** Rayos (90 a 720) */
  rays?: number;
  /** Grosor (0.5 a 3) */
  lw?: number;
  /** Haces visibles (0 a 1) */
  beams?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  n: 12,
  rays: 360,
  lw: 1.2,
  beams: 0.4,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {const sg=[0,0,W,0,W,0,W,H,W,H,0,H,0,H,0,0];S.r=[];for(let i=0;i<P.n;i++){const w=40+Math.random()*100,h=30+Math.random()*90,x=Math.random()*(W-w),y=Math.random()*(H-h);S.r.push([x,y,w,h]);sg.push(x,y,x+w,y,x+w,y,x+w,y+h,x+w,y+h,x,y+h,x,y+h,x,y)}S.sg=sg}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const px=m.sx,py=m.sy,sg=S.sg,N=P.rays,pts=[];
for(let i=0;i<N;i++){const a=i/N*6.2832,dx=Math.cos(a),dy=Math.sin(a);let best=1e5;for(let k=0;k<sg.length;k+=4){const x1=sg[k],y1=sg[k+1],sx=sg[k+2]-x1,sy=sg[k+3]-y1,den=dx*sy-dy*sx;if(!den)continue;const T=((x1-px)*sy-(y1-py)*sx)/den,U=((x1-px)*dy-(y1-py)*dx)/den;if(T>0&&U>=0&&U<=1&&T<best)best=T}pts.push(px+dx*best,py+dy*best)}
c.fillStyle=ink;c.strokeStyle=ink;c.lineWidth=P.lw;c.globalAlpha=P.alpha*.3;c.beginPath();for(let i=0;i<N;i++)i?c.lineTo(pts[2*i],pts[2*i+1]):c.moveTo(pts[0],pts[1]);c.closePath();c.fill();
c.globalAlpha=P.alpha*P.beams*.5;c.beginPath();for(let i=0;i<N;i+=4){c.moveTo(px,py);c.lineTo(pts[2*i],pts[2*i+1])}c.stroke();
c.globalAlpha=P.alpha;c.beginPath();for(const r of S.r)c.rect(r[0],r[1],r[2],r[3]);c.stroke();c.beginPath();c.moveTo(px+5,py);c.arc(px,py,5,0,6.2832);c.fill()}

export default function LuzYSombrasBackground(props: LuzYSombrasBackgroundProps) {
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
      const ink = style.getPropertyValue('--luz-y-sombras-color').trim() || style.color;
      const k = style.getPropertyValue('--luz-y-sombras-opacity').trim();
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
      style={color ? ({ '--luz-y-sombras-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
