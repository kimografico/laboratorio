// Fondo de hero: Electrocardiograma
import { useEffect, useRef } from 'react';

export interface ElectrocardiogramaBackgroundProps {
  /** Trazas (2 a 14) */
  rows?: number;
  /** Velocidad (0.2 a 3) */
  speed?: number;
  /** Amplitud (0.1 a 1.5) */
  amp?: number;
  /** Efecto puntero (0 a 3) */
  boost?: number;
  /** Grosor (0.5 a 3) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  rows: 7,
  speed: 1,
  amp: 0.7,
  boost: 1.2,
  lw: 1.2,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.n=Math.ceil(W/3)+2;S.h=Array.from({length:P.rows},()=>new Float32Array(S.n));S.ph=Array.from({length:P.rows},()=>Math.random());S.acc=0}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {S.acc+=dt*.06*P.speed;const g=(x: number,u: number)=>Math.exp(-Math.pow((u-x)/.02,2));
while(S.acc>=1){S.acc--;for(let r=0;r<P.rows;r++){const h=S.h[r];h.copyWithin(0,1);S.ph[r]=(S.ph[r]+.0045*(.8+.07*r))%1;const u=S.ph[r];h[S.n-1]=g(.3,u)-.25*g(.27,u)-.3*g(.33,u)+.15*Math.exp(-Math.pow((u-.5)/.06,2))+(Math.random()-.5)*.03}}
c.strokeStyle=ink;c.lineWidth=P.lw;c.lineJoin='round';c.globalAlpha=P.alpha;
for(let r=0;r<P.rows;r++){const y0=H*(r+.5)/P.rows,k=1+P.boost*Math.exp(-Math.pow((m.sy-y0)/(H*.2),2))*(m.on?1:0),h=S.h[r],A=H/P.rows*P.amp*k;c.beginPath();for(let i=0;i<S.n;i++){const x=i*3,y=y0-h[i]*A;i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}}

export default function ElectrocardiogramaBackground(props: ElectrocardiogramaBackgroundProps) {
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
      const ink = style.getPropertyValue('--electrocardiograma-color').trim() || style.color;
      const k = style.getPropertyValue('--electrocardiograma-opacity').trim();
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
      style={color ? ({ '--electrocardiograma-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
