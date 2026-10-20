// Fondo de hero: Túnel
import { useEffect, useRef } from 'react';

export interface TunelBackgroundProps {
  /** Anillos (6 a 40) */
  rings?: number;
  /** Lados (3 a 8) */
  sides?: number;
  /** Velocidad (-2 a 3) */
  speed?: number;
  /** Torsión (0 a 3) */
  twist?: number;
  /** Giro (-2 a 2) */
  spin?: number;
  /** Grosor (0.5 a 3) */
  lw?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  rings: 22,
  sides: 4,
  speed: 1,
  twist: 0.8,
  spin: 0.3,
  lw: 1,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const R=Math.hypot(W,H)*.55,ph=((t*.0005*P.speed)%1+1)%1;c.strokeStyle=ink;
for(let k=0;k<P.rings;k++){const f=(k+ph)/P.rings,r=R*Math.pow(f,2.4),cx=m.sx+(W/2-m.sx)*f,cy=m.sy+(H/2-m.sy)*f,rot=f*P.twist+t*.0002*P.spin;c.lineWidth=P.lw*(.3+f*2);c.globalAlpha=P.alpha*Math.min(1,f*3)*(1-f*.4);c.beginPath();
for(let i=0;i<=P.sides;i++){const a=rot+i*6.2832/P.sides,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}}

export default function TunelBackground(props: TunelBackgroundProps) {
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
      const ink = style.getPropertyValue('--tunel-color').trim() || style.color;
      const k = style.getPropertyValue('--tunel-opacity').trim();
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
      style={color ? ({ '--tunel-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
