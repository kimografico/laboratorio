// Fondo de hero: Anillos de árbol
import { useEffect, useRef } from 'react';

export interface AnillosDeArbolBackgroundProps {
  /** Separación (px) (8 a 40) */
  gap?: number;
  /** Ondulación (0 a 3) */
  wob?: number;
  /** Empuje (0 a 80) */
  push?: number;
  /** Alcance (50 a 300) */
  reach?: number;
  /** Velocidad (0 a 3) */
  speed?: number;
  /** Grosor (0.5 a 3) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  gap: 12,
  wob: 1.45,
  push: 30,
  reach: 225,
  speed: 1,
  lw: 0.8,
  alpha: 0.25,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const R=Math.hypot(W,H)/2,tm=t*.0004*P.speed;c.strokeStyle=ink;c.lineWidth=P.lw;c.globalAlpha=P.alpha;c.beginPath();
for(let r0=P.gap,k=1;r0<R;r0+=P.gap,k++){const A=P.wob*(2+r0*.03);for(let i=0;i<=90;i++){const a=i/90*6.2832,r=r0+A*(Math.sin(3*a+k*.2+tm)+.5*Math.sin(5*a-k*.15-tm*1.3)+.3*Math.sin(2*a+tm*.7));let x=W/2+r*Math.cos(a),y=H/2+r*Math.sin(a);
const dx=x-m.sx,dy=y-m.sy,d=Math.hypot(dx,dy);if(d<P.reach&&d>.01){const f=(1-d/P.reach)*P.push;x+=dx/d*f;y+=dy/d*f}i?c.lineTo(x,y):c.moveTo(x,y)}}c.stroke()}

export default function AnillosDeArbolBackground(props: AnillosDeArbolBackgroundProps) {
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
      const ink = style.getPropertyValue('--anillos-de-arbol-color').trim() || style.color;
      const k = style.getPropertyValue('--anillos-de-arbol-opacity').trim();
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
      style={color ? ({ '--anillos-de-arbol-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
