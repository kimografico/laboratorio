// Fondo de hero: Conjunto de Julia
import { useEffect, useRef } from 'react';

export interface ConjuntoDeJuliaBackgroundProps {
  /** Celda (px) (3 a 12) */
  cell?: number;
  /** Iteraciones (10 a 80) */
  iter?: number;
  /** Zoom (0.5 a 3) */
  zoom?: number;
  /** Efecto puntero (0 a 1.5) */
  mouse?: number;
  /** Deriva (0 a 3) */
  drift?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  cell: 3,
  iter: 32,
  zoom: 0.9,
  mouse: 0.6,
  drift: 1,
  alpha: 0.7,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.o=document.createElement('canvas');S.C=Math.ceil(W/P.cell);S.R=Math.ceil(H/P.cell);S.o.width=S.C;S.o.height=S.R;S.x=S.o.getContext('2d')}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const C=S.C,R=S.R,img=S.x.createImageData(C,R),d=img.data,cr=-.8+(m.sx/W-.5)*P.mouse+Math.sin(t*.0002)*.02*P.drift,ci=.156+(m.sy/H-.5)*P.mouse+Math.cos(t*.00017)*.02*P.drift,asp=W/H,sc=3/P.zoom;
for(let j=0;j<R;j++)for(let i=0;i<C;i++){let x=(i/C-.5)*sc*asp,y=(j/R-.5)*sc,n=0;while(n<P.iter&&x*x+y*y<4){const xt=x*x-y*y+cr;y=2*x*y+ci;x=xt;n++}d[4*(j*C+i)+3]=(n>=P.iter?0:Math.sqrt(n/P.iter)*255)*P.alpha}
S.x.putImageData(img,0,0);c.imageSmoothingEnabled=true;c.drawImage(S.o,0,0,C,R,0,0,W,H);c.globalCompositeOperation='source-in';c.fillStyle=ink;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over'}

export default function ConjuntoDeJuliaBackground(props: ConjuntoDeJuliaBackgroundProps) {
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
      const ink = style.getPropertyValue('--conjunto-de-julia-color').trim() || style.color;
      const k = style.getPropertyValue('--conjunto-de-julia-opacity').trim();
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
      style={color ? ({ '--conjunto-de-julia-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
