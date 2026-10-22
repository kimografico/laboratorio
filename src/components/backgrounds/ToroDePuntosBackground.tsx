// Fondo de hero: Toro de puntos
import { useEffect, useRef } from 'react';

export interface ToroDePuntosBackgroundProps {
  /** Puntos mayor (20 a 120) */
  nu?: number;
  /** Puntos menor (8 a 40) */
  nv?: number;
  /** Radio tubo (0.15 a 0.6) */
  r?: number;
  /** Tamaño (px) (80 a 400) */
  size?: number;
  /** Punto (0.5 a 3) */
  dot?: number;
  /** Giro (0 a 2) */
  spin?: number;
  /** Inclinación (0 a 2) */
  tilt?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  nu: 80,
  nv: 22,
  r: 0.44,
  size: 325,
  dot: 1.5,
  spin: 0.5,
  tilt: 1,
  alpha: 0.7,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const ay=t*.0004*P.spin+(m.sx/W-.5)*P.tilt*2,ax=1+(m.sy/H-.5)*P.tilt,ca=Math.cos(ax),sa=Math.sin(ax),cb=Math.cos(ay),sb=Math.sin(ay);c.fillStyle=ink;
for(let i=0;i<P.nu;i++){const u=i/P.nu*6.2832;for(let j=0;j<P.nv;j++){const v=j/P.nv*6.2832,rr=1+P.r*Math.cos(v),x=rr*Math.cos(u),y=rr*Math.sin(u),z=P.r*Math.sin(v);
const y2=y*ca-z*sa,z2=y*sa+z*ca,x2=x*cb+z2*sb,z3=-x*sb+z2*cb,k=3/(3+z3),d=(z3+1.6)/3.2;c.globalAlpha=P.alpha*Math.min(1,Math.max(.1,1-d*.8));c.beginPath();c.arc(W/2+x2*P.size*k,H/2+y2*P.size*k,P.dot*k*(1.3-d*.5),0,6.2832);c.fill()}}}

export default function ToroDePuntosBackground(props: ToroDePuntosBackgroundProps) {
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
      const ink = style.getPropertyValue('--toro-de-puntos-color').trim() || style.color;
      const k = style.getPropertyValue('--toro-de-puntos-opacity').trim();
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
      style={color ? ({ '--toro-de-puntos-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
