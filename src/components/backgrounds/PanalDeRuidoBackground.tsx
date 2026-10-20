// Fondo de hero: Panal de ruido
import { useEffect, useRef } from 'react';

export interface PanalDeRuidoBackgroundProps {
  /** Radio (px) (8 a 40) */
  s?: number;
  /** Velocidad (0 a 3) */
  speed?: number;
  /** Contraste (0.5 a 3) */
  contrast?: number;
  /** Radio lupa (40 a 400) */
  lens?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  s: 18,
  speed: 1,
  contrast: 1.3,
  lens: 170,
  alpha: 0.4,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {const s=P.s,w=s*1.732,k=t*.0004*P.speed;c.fillStyle=ink;c.globalAlpha=P.alpha;c.beginPath();
for(let r=0,y=0;y<H+s;r++,y+=s*1.5)for(let x=(r%2)*w/2;x<W+w;x+=w){let v=.5+(Math.sin(x*.012+k)+Math.sin(y*.015-k*.7)+Math.sin((x-y)*.008+k*.5))/6;v+=Math.max(0,1-Math.hypot(x-m.sx,y-m.sy)/P.lens)*.5;v=Math.pow(Math.min(1,Math.max(0,v)),P.contrast);const q=s*(.08+.92*v)*.98;
for(let i=0;i<6;i++){const a=(60*i-30)*Math.PI/180,px=x+q*Math.cos(a),py=y+q*Math.sin(a);i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath()}c.fill()}

export default function PanalDeRuidoBackground(props: PanalDeRuidoBackgroundProps) {
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
      const ink = style.getPropertyValue('--panal-de-ruido-color').trim() || style.color;
      const k = style.getPropertyValue('--panal-de-ruido-opacity').trim();
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
      style={color ? ({ '--panal-de-ruido-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
