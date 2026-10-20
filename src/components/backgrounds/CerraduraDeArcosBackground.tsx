// Fondo de hero: Cerradura de arcos
import { useEffect, useRef } from 'react';

export interface CerraduraDeArcosBackgroundProps {
  /** Anillos (4 a 30) */
  rings?: number;
  /** Separación (px) (8 a 40) */
  gap?: number;
  /** Grosor (0.1 a 0.9) */
  thick?: number;
  /** Velocidad (0 a 2) */
  speed?: number;
  /** Impulso puntero (0 a 10) */
  boost?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  rings: 30,
  gap: 25,
  thick: 0.35,
  speed: 0.25,
  boost: 6,
  alpha: 0.4,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.a=[];S.v=[];S.seg=[];for(let k=0;k<P.rings;k++){S.a.push(Math.random()*6.28);S.v.push(0);const n=2+Math.floor(Math.random()*4),sg=[];let s=Math.random()*6.28;for(let i=0;i<n;i++){const l=.3+Math.random()*(6.28/n-.5);sg.push([s,l]);s+=6.28/n}S.seg.push(sg)}}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const cx=W/2,cy=H/2,pd=Math.hypot(m.sx-cx,m.sy-cy),ta=Math.atan2(m.sy-cy,m.sx-cx);c.strokeStyle=ink;c.globalAlpha=P.alpha;c.lineWidth=P.gap*P.thick;c.lineCap='round';
for(let k=0;k<P.rings;k++){const r=P.gap*(k+2),near=Math.exp(-Math.pow((pd-r)/(P.gap*2),2)),base=(k%2?-1:1)*P.speed*(.3+k*.04),tg=(base+(m.on?near*P.boost*(k%2?-1:1):0))*.001;
S.v[k]+=(tg-S.v[k])*.05;S.a[k]+=S.v[k]*dt;c.beginPath();for(const sg of S.seg[k]){const a0=sg[0]+S.a[k];c.moveTo(cx+r*Math.cos(a0),cy+r*Math.sin(a0));c.arc(cx,cy,r,a0,a0+sg[1])}c.stroke()}}

export default function CerraduraDeArcosBackground(props: CerraduraDeArcosBackgroundProps) {
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
      const ink = style.getPropertyValue('--cerradura-de-arcos-color').trim() || style.color;
      const k = style.getPropertyValue('--cerradura-de-arcos-opacity').trim();
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
      style={color ? ({ '--cerradura-de-arcos-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
