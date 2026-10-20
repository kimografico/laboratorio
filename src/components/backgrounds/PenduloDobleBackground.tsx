// Fondo de hero: Péndulo doble
import { useEffect, useRef } from 'react';

export interface PenduloDobleBackgroundProps {
  /** Escala (px) (60 a 260) */
  size?: number;
  /** Velocidad (0.2 a 3) */
  speed?: number;
  /** Estela (50 a 1200) */
  trail?: number;
  /** Empuje puntero (0 a 10) */
  kick?: number;
  /** Fricción (0 a 0.05) */
  damp?: number;
  /** Grosor (0.5 a 3) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  size: 150,
  speed: 1.2,
  trail: 500,
  kick: 3,
  damp: 0.002,
  lw: 1.4,
  alpha: 0.6,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.a=2.4+Math.random()*.3;S.b=2.1;S.u=0;S.v=0;S.tr=[];S.px=W/2}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const px=W/2+(m.sx-W/2)*.5,py=H*.4+(m.sy-H/2)*.3,g=9.8,n=8,h=dt/1000*P.speed/n;S.u+=(px-S.px)*P.kick*.004;S.px=px;
for(let i=0;i<n;i++){const d=S.a-S.b,den=3-Math.cos(2*d),a1=(-3*g*Math.sin(S.a)-g*Math.sin(S.a-2*S.b)-2*Math.sin(d)*(S.v*S.v+S.u*S.u*Math.cos(d)))/den,a2=2*Math.sin(d)*(2*S.u*S.u+2*g*Math.cos(S.a)+S.v*S.v*Math.cos(d))/den;S.u+=a1*h;S.v+=a2*h;S.u*=1-P.damp;S.v*=1-P.damp;S.a+=S.u*h;S.b+=S.v*h}
const x1=px+Math.sin(S.a)*P.size,y1=py+Math.cos(S.a)*P.size,x2=x1+Math.sin(S.b)*P.size,y2=y1+Math.cos(S.b)*P.size;
S.tr.push(x2,y2);while(S.tr.length>P.trail*2)S.tr.splice(0,2);c.strokeStyle=ink;c.fillStyle=ink;c.lineWidth=P.lw;c.lineCap='round';const L=S.tr.length/2;
for(let i=1;i<L;i++){c.globalAlpha=P.alpha*i/L;c.beginPath();c.moveTo(S.tr[2*i-2],S.tr[2*i-1]);c.lineTo(S.tr[2*i],S.tr[2*i+1]);c.stroke()}
c.globalAlpha=P.alpha;c.beginPath();c.moveTo(px,py);c.lineTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.beginPath();c.moveTo(x1+4,y1);c.arc(x1,y1,4,0,6.2832);c.moveTo(x2+5,y2);c.arc(x2,y2,5,0,6.2832);c.fill()}

export default function PenduloDobleBackground(props: PenduloDobleBackgroundProps) {
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
      const ink = style.getPropertyValue('--pendulo-doble-color').trim() || style.color;
      const k = style.getPropertyValue('--pendulo-doble-opacity').trim();
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
      style={color ? ({ '--pendulo-doble-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
