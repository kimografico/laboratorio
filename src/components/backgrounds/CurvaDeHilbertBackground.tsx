// Fondo de hero: Curva de Hilbert
import { useEffect, useRef } from 'react';

export interface CurvaDeHilbertBackgroundProps {
  /** Nivel (3 a 6) */
  lv?: number;
  /** Repulsión (0 a 80) */
  push?: number;
  /** Alcance (50 a 300) */
  reach?: number;
  /** Velocidad (0 a 3) */
  speed?: number;
  /** Cola (0.02 a 0.5) */
  tail?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  lv: 5,
  push: 40,
  reach: 150,
  speed: 1,
  tail: 0.15,
  alpha: 0.3,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {const n=1<<P.lv,N=n*n;S.N=N;S.q=new Float32Array(2*N);S.p=new Float32Array(2*N);for(let d=0;d<N;d++){let x=0,y=0,t=d;for(let s=1;s<n;s*=2){const rx=1&(t>>1),ry=1&(t^rx);if(!ry){if(rx){x=s-1-x;y=s-1-y}const q=x;x=y;y=q}x+=s*rx;y+=s*ry;t>>=2}S.q[2*d]=(x+.5)/n;S.q[2*d+1]=(y+.5)/n}}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const z=Math.min(W,H)*.9,ox=(W-z)/2,oy=(H-z)/2,N=S.N,q=S.q,p=S.p;
for(let i=0;i<N;i++){let x=ox+q[2*i]*z,y=oy+q[2*i+1]*z;const dx=x-m.sx,dy=y-m.sy,d=Math.hypot(dx,dy);if(d<P.reach&&d>.01){const f=(1-d/P.reach)*P.push;x+=dx/d*f;y+=dy/d*f}p[2*i]=x;p[2*i+1]=y}
c.strokeStyle=ink;c.lineWidth=1;c.globalAlpha=P.alpha;c.beginPath();c.moveTo(p[0],p[1]);for(let i=1;i<N;i++)c.lineTo(p[2*i],p[2*i+1]);c.stroke();
const hd=Math.floor(t*N*P.speed*.00004)%N,L=Math.floor(N*P.tail),s0=(hd-L+N)%N;c.lineWidth=2.2;c.lineCap='round';c.globalAlpha=Math.min(1,P.alpha*2.5);c.beginPath();c.moveTo(p[2*s0],p[2*s0+1]);
for(let i=1;i<=L;i++){const k=(s0+i)%N;c.lineTo(p[2*k],p[2*k+1])}c.stroke()}

export default function CurvaDeHilbertBackground(props: CurvaDeHilbertBackgroundProps) {
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
      const ink = style.getPropertyValue('--curva-de-hilbert-color').trim() || style.color;
      const k = style.getPropertyValue('--curva-de-hilbert-opacity').trim();
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
      style={color ? ({ '--curva-de-hilbert-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
