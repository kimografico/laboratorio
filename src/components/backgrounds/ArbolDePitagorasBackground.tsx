// Fondo de hero: Árbol de Pitágoras
import { useEffect, useRef } from 'react';

export interface ArbolDePitagorasBackgroundProps {
  /** Profundidad (3 a 11) */
  depth?: number;
  /** Ángulo (°) (20 a 70) */
  angle?: number;
  /** Efecto puntero (°) (0 a 30) */
  mouse?: number;
  /** Viento (0 a 12) */
  sway?: number;
  /** Base (30 a 200) */
  size?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  depth: 10,
  angle: 60,
  mouse: 20,
  sway: 9,
  size: 75,
  alpha: 0.55,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {c.strokeStyle=ink;c.lineWidth=1;c.globalAlpha=P.alpha;c.beginPath();
const rec=(x: number,y: number,L: number,a: number,d: number)=>{const ux=Math.cos(a),uy=Math.sin(a),nx=uy,ny=-ux,bx=x+L*ux,by=y+L*uy,cx=bx+L*nx,cy=by+L*ny,dx=x+L*nx,dy=y+L*ny;c.moveTo(x,y);c.lineTo(bx,by);c.lineTo(cx,cy);c.lineTo(dx,dy);c.closePath();if(d<=0||L<2)return;
const th=(P.angle+(m.sx/W-.5)*P.mouse*2+Math.sin(t*.001+d*.7)*P.sway*(1-d/P.depth+.2))*Math.PI/180,ex=dx+L*Math.cos(th)*Math.cos(a-th),ey=dy+L*Math.cos(th)*Math.sin(a-th);
rec(dx,dy,L*Math.cos(th),a-th,d-1);rec(ex,ey,L*Math.sin(th),a+Math.PI/2-th,d-1)};
rec(W/2-P.size/2,H-8,P.size,0,P.depth);c.stroke()}

export default function ArbolDePitagorasBackground(props: ArbolDePitagorasBackgroundProps) {
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
      const ink = style.getPropertyValue('--arbol-de-pitagoras-color').trim() || style.color;
      const k = style.getPropertyValue('--arbol-de-pitagoras-opacity').trim();
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
      style={color ? ({ '--arbol-de-pitagoras-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
