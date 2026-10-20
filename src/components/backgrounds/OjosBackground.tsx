// Fondo de hero: Ojos
import { useEffect, useRef } from 'react';

export interface OjosBackgroundProps {
  /** Paso (px) (30 a 120) */
  step?: number;
  /** Giro pupila (0 a 0.6) */
  look?: number;
  /** Parpadeo (0.2 a 3) */
  blink?: number;
  /** Grosor (0.5 a 2.5) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  step: 64,
  look: 0.3,
  blink: 1,
  lw: 1,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.C=Math.ceil(W/P.step);S.R=Math.ceil(H/P.step);S.b=Float32Array.from({length:S.C*S.R},()=>Math.random()*6000)}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const s=P.step,w=s*.4,h=s*.2;c.strokeStyle=ink;c.fillStyle=ink;c.lineWidth=P.lw;c.globalAlpha=P.alpha;
for(let j=0;j<S.R;j++)for(let i=0;i<S.C;i++){const k=j*S.C+i,x=(i+.5)*s,y=(j+.5)*s;let o=1;const d2=t-S.b[k];if(d2>0){o=Math.abs(d2-90)/90;if(d2>180){S.b[k]=t+(1500+Math.random()*6000)/P.blink;o=1}}o=Math.min(1,o);
c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x,y-h*2*o,x+w,y);c.quadraticCurveTo(x,y+h*2*o,x-w,y);c.stroke();
if(o>.4){const dx=m.sx-x,dy=m.sy-y,d=Math.hypot(dx,dy)||1,mv=Math.min(1,d/200)*P.look*s,pr=h*(.7+.5*Math.max(0,1-d/250));c.beginPath();c.arc(x+dx/d*Math.min(mv,w*.5),y+dy/d*Math.min(mv,h*.4),pr*Math.min(1,o*1.5),0,6.2832);c.fill()}}}

export default function OjosBackground(props: OjosBackgroundProps) {
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
      const ink = style.getPropertyValue('--ojos-color').trim() || style.color;
      const k = style.getPropertyValue('--ojos-opacity').trim();
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
      style={color ? ({ '--ojos-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
