// Fondo de hero: Interferencia de puntos
import { useEffect, useRef } from 'react';

export interface InterferenciaDePuntosBackgroundProps {
  /** Paso (px) (8 a 28) */
  step?: number;
  /** Long. de onda (30 a 300) */
  wave?: number;
  /** Velocidad (0 a 3) */
  speed?: number;
  /** Easing puntero (0.01 a 1) */
  ease?: number;
  /** Tamaño (0.3 a 1.5) */
  size?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  step: 12,
  wave: 110,
  speed: 1.9,
  ease: 0.04,
  size: 1.05,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const n=P.step,sr=[[W*.3+Math.cos(t*.0003)*W*.1,H*.5+Math.sin(t*.0004)*H*.2],[W*.7+Math.sin(t*.00035)*W*.1,H*.5+Math.cos(t*.0003)*H*.2],[m.sx,m.sy]],kk=6.2832/P.wave,w=t*.003*P.speed;
c.fillStyle=ink;c.globalAlpha=P.alpha;c.beginPath();
for(let y=n/2;y<H;y+=n)for(let x=n/2;x<W;x+=n){let s=0;for(const q of sr)s+=Math.cos(Math.hypot(x-q[0],y-q[1])*kk-w);const v=(s/3+1)/2,r=n*.5*P.size*v*v;if(r>.2){c.moveTo(x+r,y);c.arc(x,y,r,0,6.2832)}}c.fill()}

export default function InterferenciaDePuntosBackground(props: InterferenciaDePuntosBackgroundProps) {
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
      m.sx += (m.x - m.sx) * P.ease;
      m.sy += (m.y - m.sy) * P.ease;
      // Tinta y opacidad leidas del CSS de la pagina en cada fotograma
      const ink = style.getPropertyValue('--interferencia-de-puntos-color').trim() || style.color;
      const k = style.getPropertyValue('--interferencia-de-puntos-opacity').trim();
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
      style={color ? ({ '--interferencia-de-puntos-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
