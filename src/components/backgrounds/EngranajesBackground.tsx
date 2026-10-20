// Fondo de hero: Engranajes
import { useEffect, useRef } from 'react';

export interface EngranajesBackgroundProps {
  /** Tamaño (px) (40 a 140) */
  step?: number;
  /** Dientes (6 a 24) */
  teeth?: number;
  /** Velocidad (0 a 3) */
  speed?: number;
  /** Control puntero (0 a 2) */
  ctrl?: number;
  /** Grosor (0.5 a 3) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  step: 76,
  teeth: 12,
  speed: 1,
  ctrl: 1.2,
  lw: 1.1,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const s=P.step,N=P.teeth,r0=s/2,ro=r0*1.1,ri=r0*.86,ta=6.2832/N;S.a=(S.a||0)+dt*.001*P.speed*(1+(m.sx/W-.5)*2*P.ctrl);
c.strokeStyle=ink;c.lineWidth=P.lw;c.lineJoin='round';c.globalAlpha=P.alpha;c.beginPath();
for(let j=0;j*s<H+s;j++)for(let i=0;i*s<W+s;i++){const x=(i+.5)*s,y=(j+.5)*s,od=(i+j)&1,rot=(od?-1:1)*S.a+(od?Math.PI/N:0);
for(let k=0;k<N;k++){const b=rot+k*ta;for(const q of [[0,ri],[.15,ro],[.5,ro],[.65,ri]]){const a=b+q[0]*ta,px=x+q[1]*Math.cos(a),py=y+q[1]*Math.sin(a);k||q[0]?c.lineTo(px,py):c.moveTo(px,py)}}
c.closePath();c.moveTo(x+r0*.2,y);c.arc(x,y,r0*.2,0,6.2832)}c.stroke()}

export default function EngranajesBackground(props: EngranajesBackgroundProps) {
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
      const ink = style.getPropertyValue('--engranajes-color').trim() || style.color;
      const k = style.getPropertyValue('--engranajes-opacity').trim();
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
      style={color ? ({ '--engranajes-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
