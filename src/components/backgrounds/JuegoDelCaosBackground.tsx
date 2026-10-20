// Fondo de hero: Juego del caos
import { useEffect, useRef } from 'react';

export interface JuegoDelCaosBackgroundProps {
  /** Vértices (3 a 8) */
  n?: number;
  /** Razón (0.3 a 0.8) */
  ratio?: number;
  /** Puntos/fotograma (50 a 1500) */
  pf?: number;
  /** Peso puntero (0 a 0.5) */
  mouse?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  n: 3,
  ratio: 0.5,
  pf: 400,
  mouse: 0.12,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.M=40000;S.b=new Float32Array(2*S.M);S.i=0;S.x=W/2;S.y=H/2;S.n=0}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const R=Math.min(W,H)*.45,v=[];for(let k=0;k<P.n;k++){const a=-Math.PI/2+k*6.2832/P.n;v.push([W/2+R*Math.cos(a),H/2+R*Math.sin(a)])}
for(let i=0;i<P.pf;i++){const o=m.on&&Math.random()<P.mouse?[m.x,m.y]:v[Math.floor(Math.random()*v.length)];S.x+=(o[0]-S.x)*P.ratio;S.y+=(o[1]-S.y)*P.ratio;S.b[2*S.i]=S.x;S.b[2*S.i+1]=S.y;S.i=(S.i+1)%S.M;S.n=Math.min(S.M,S.n+1)}
c.fillStyle=ink;c.globalAlpha=P.alpha;for(let i=0;i<S.n;i++)c.fillRect(S.b[2*i],S.b[2*i+1],1.2,1.2)}

export default function JuegoDelCaosBackground(props: JuegoDelCaosBackgroundProps) {
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
      const ink = style.getPropertyValue('--juego-del-caos-color').trim() || style.color;
      const k = style.getPropertyValue('--juego-del-caos-opacity').trim();
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
      style={color ? ({ '--juego-del-caos-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
