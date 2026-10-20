// Fondo de hero: Radar
import { useEffect, useRef } from 'react';

export interface RadarBackgroundProps {
  /** Ecos (5 a 120) */
  n?: number;
  /** Anillos (2 a 10) */
  rings?: number;
  /** Giro (0.1 a 3) */
  speed?: number;
  /** Desvanecer (0.5 a 8) */
  decay?: number;
  /** Estela (0.2 a 2) */
  tail?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  n: 40,
  rings: 5,
  speed: 0.8,
  decay: 3,
  tail: 0.9,
  alpha: 0.6,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.b=Array.from({length:P.n},()=>[Math.random()*W,Math.random()*H])}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const cx=W/2,cy=H/2,R=Math.hypot(W,H)/2,sw=(t*.001*P.speed)%6.2832;c.strokeStyle=ink;c.fillStyle=ink;c.lineWidth=1;c.globalAlpha=P.alpha*.2;c.beginPath();
for(let k=1;k<=P.rings;k++){c.moveTo(cx+R*k/P.rings,cy);c.arc(cx,cy,R*k/P.rings,0,6.2832)}c.moveTo(cx-R,cy);c.lineTo(cx+R,cy);c.moveTo(cx,cy-R);c.lineTo(cx,cy+R);c.stroke();
for(let i=0;i<40;i++){c.globalAlpha=P.alpha*(1-i/40)*.5;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+R*Math.cos(sw-i*.03*P.tail),cy+R*Math.sin(sw-i*.03*P.tail));c.stroke()}
const pts=m.on?S.b.concat([[m.x,m.y,1]]):S.b;
for(const b of pts){const a=Math.atan2(b[1]-cy,b[0]-cx),dl=(((sw-a)%6.2832)+6.2832)%6.2832,k=Math.exp(-dl*P.decay);if(k<.03)continue;c.globalAlpha=P.alpha*k;c.beginPath();c.arc(b[0],b[1],b[2]?5:2.5,0,6.2832);c.fill()}}

export default function RadarBackground(props: RadarBackgroundProps) {
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
      const ink = style.getPropertyValue('--radar-color').trim() || style.color;
      const k = style.getPropertyValue('--radar-opacity').trim();
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
      style={color ? ({ '--radar-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
