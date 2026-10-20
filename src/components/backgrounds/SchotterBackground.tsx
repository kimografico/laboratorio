// Fondo de hero: Schotter
import { useEffect, useRef } from 'react';

export interface SchotterBackgroundProps {
  /** Tamaño (px) (16 a 60) */
  s?: number;
  /** Desorden (0 a 2) */
  chaos?: number;
  /** Desorden puntero (0 a 3) */
  mouse?: number;
  /** Alcance (50 a 300) */
  reach?: number;
  /** Grosor (0.5 a 2.5) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  s: 32,
  chaos: 1,
  mouse: 1.5,
  reach: 130,
  lw: 1,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.C=Math.ceil(W/P.s);S.R=Math.ceil(H/P.s);const n=S.C*S.R;S.sd=Float32Array.from({length:3*n},()=>Math.random()*2-1);S.e=new Float32Array(n)}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const s=P.s;c.strokeStyle=ink;c.lineWidth=P.lw;c.globalAlpha=P.alpha;c.beginPath();
for(let j=0;j<S.R;j++)for(let i=0;i<S.C;i++){const k=j*S.C+i,x=(i+.5)*s,y=(j+.5)*s,tg=P.chaos*j/S.R+P.mouse*Math.max(0,1-Math.hypot(x-m.sx,y-m.sy)/P.reach)*(m.on?1:0);S.e[k]+=(tg-S.e[k])*.1;const e=S.e[k],a=S.sd[3*k]*e*.8,ox=S.sd[3*k+1]*e*s*.4,oy=S.sd[3*k+2]*e*s*.4,h=s*.4;
for(let q=0;q<4;q++){const b=a+q*Math.PI/2+Math.PI/4,px=x+ox+Math.cos(b)*h*1.414,py=y+oy+Math.sin(b)*h*1.414;q?c.lineTo(px,py):c.moveTo(px,py)}c.closePath()}c.stroke()}

export default function SchotterBackground(props: SchotterBackgroundProps) {
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
      const ink = style.getPropertyValue('--schotter-color').trim() || style.color;
      const k = style.getPropertyValue('--schotter-opacity').trim();
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
      style={color ? ({ '--schotter-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
