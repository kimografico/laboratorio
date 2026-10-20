// Fondo de hero: Atractor de Lorenz
import { useEffect, useRef } from 'react';

export interface AtractorDeLorenzBackgroundProps {
  /** Rho (10 a 50) */
  rho?: number;
  /** Pasos/fotograma (1 a 12) */
  steps?: number;
  /** Estela (300 a 4000) */
  len?: number;
  /** Zoom (0.5 a 2.5) */
  zoom?: number;
  /** Giro puntero (0 a 2) */
  tilt?: number;
  /** Grosor (0.4 a 3) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  rho: 28,
  steps: 4,
  len: 1800,
  zoom: 1,
  tilt: 1,
  lw: 1,
  alpha: 0.7,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.p=[1,1,1];S.tr=[]}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {let [x,y,z]=S.p;const h=.006;for(let i=0;i<P.steps;i++){const dx=10*(y-x),dy=x*(P.rho-z)-y,dz=x*y-8/3*z;x+=dx*h;y+=dy*h;z+=dz*h;S.tr.push(x,y,z)}S.p=[x,y,z];while(S.tr.length>P.len*3)S.tr.splice(0,3*P.steps);
const A=(m.sx/W-.5)*3.1416*P.tilt+t*.0001,ca=Math.cos(A),sa=Math.sin(A),sc=Math.min(W,H)/55*P.zoom,L=S.tr.length/3;c.strokeStyle=ink;c.lineWidth=P.lw;c.lineJoin='round';
for(let q=0;q<4;q++){c.globalAlpha=P.alpha*(q+1)/4;c.beginPath();const a=Math.floor(L*q/4),b=Math.floor(L*(q+1)/4)+1;for(let i=a;i<Math.min(b,L);i++){const X=S.tr[3*i]*ca-S.tr[3*i+1]*sa,Z=S.tr[3*i+2]-25,px=W/2+X*sc,py=H/2-Z*sc;i==a?c.moveTo(px,py):c.lineTo(px,py)}c.stroke()}}

export default function AtractorDeLorenzBackground(props: AtractorDeLorenzBackgroundProps) {
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
      const ink = style.getPropertyValue('--atractor-de-lorenz-color').trim() || style.color;
      const k = style.getPropertyValue('--atractor-de-lorenz-opacity').trim();
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
      style={color ? ({ '--atractor-de-lorenz-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
