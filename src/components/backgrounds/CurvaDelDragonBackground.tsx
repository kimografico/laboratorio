// Fondo de hero: Curva del dragón
import { useEffect, useRef } from 'react';

export interface CurvaDelDragonBackgroundProps {
  /** Iteraciones (6 a 15) */
  lv?: number;
  /** Despliegue (0 a 3) */
  speed?: number;
  /** Giro puntero (0 a 2) */
  mouse?: number;
  /** Grosor (0.4 a 2.5) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  lv: 13,
  speed: 0.6,
  mouse: 1,
  lw: 0.8,
  alpha: 0.55,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {let p=[0,0,1,0];for(let i=0;i<P.lv;i++){const n=p.length,lx=p[n-2],ly=p[n-1],q=[];for(let k=n-4;k>=0;k-=2){const dx=p[k]-lx,dy=p[k+1]-ly;q.push(lx-dy,ly+dx)}p=p.concat(q)}
let a=1e9,b=1e9,e=-1e9,d=-1e9;for(let k=0;k<p.length;k+=2){a=Math.min(a,p[k]);e=Math.max(e,p[k]);b=Math.min(b,p[k+1]);d=Math.max(d,p[k+1])}S.p=p;S.cx=(a+e)/2;S.cy=(b+d)/2;S.s=Math.min(W/(e-a),H/(d-b))*.9}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const N=S.p.length/2,n=Math.floor(N*Math.min(1,.15+((t*.00008*P.speed)%1.3))),ang=(m.sx/W-.5)*P.mouse*1.5+t*.00005,sc=S.s*(1+(m.sy/H-.5)*P.mouse*.4),ca=Math.cos(ang),sa=Math.sin(ang);
c.strokeStyle=ink;c.lineWidth=P.lw;c.lineJoin='round';c.globalAlpha=P.alpha;c.beginPath();
for(let i=0;i<n;i++){const x=(S.p[2*i]-S.cx)*sc,y=(S.p[2*i+1]-S.cy)*sc,px=W/2+x*ca-y*sa,py=H/2+x*sa+y*ca;i?c.lineTo(px,py):c.moveTo(px,py)}c.stroke()}

export default function CurvaDelDragonBackground(props: CurvaDelDragonBackgroundProps) {
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
      const ink = style.getPropertyValue('--curva-del-dragon-color').trim() || style.color;
      const k = style.getPropertyValue('--curva-del-dragon-opacity').trim();
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
      style={color ? ({ '--curva-del-dragon-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
