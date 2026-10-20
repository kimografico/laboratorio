// Fondo de hero: Superfórmula
import { useEffect, useRef } from 'react';

export interface SuperformulaBackgroundProps {
  /** Capas (1 a 14) */
  layers?: number;
  /** Simetría m (1 a 16) */
  m?: number;
  /** n1 (0.2 a 4) */
  n1?: number;
  /** n2 (0.2 a 6) */
  n2?: number;
  /** n3 (0.2 a 6) */
  n3?: number;
  /** Tamaño (40 a 400) */
  size?: number;
  /** Efecto puntero (0 a 1) */
  mouse?: number;
  /** Giro (0 a 2) */
  spin?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  layers: 14,
  m: 16,
  n1: 1,
  n2: 1.7,
  n3: 1.7,
  size: 150,
  mouse: 0.5,
  spin: 0.4,
  alpha: 0.5,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {c.strokeStyle=ink;c.lineWidth=1;const mm=P.m+Math.sin(t*.0003)*1.5+(m.sx/W-.5)*P.mouse*6;
for(let k=0;k<P.layers;k++){const f=1-k/P.layers*.9,px=(m.sx-W/2)*P.mouse*.2*(1-f),py=(m.sy-H/2)*P.mouse*.2*(1-f),rot=t*.0002*P.spin*(k%2?-1:1);c.globalAlpha=P.alpha*(.3+.7*f);c.beginPath();
for(let i=0;i<=200;i++){const a=i/200*6.2832,r=Math.min(3,Math.pow(Math.pow(Math.abs(Math.cos(mm*a/4)),P.n2)+Math.pow(Math.abs(Math.sin(mm*a/4)),P.n3),-1/P.n1)),x=W/2+px+P.size*f*r*Math.cos(a+rot),y=H/2+py+P.size*f*r*Math.sin(a+rot);i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.stroke()}}

export default function SuperformulaBackground(props: SuperformulaBackgroundProps) {
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
      const ink = style.getPropertyValue('--superformula-color').trim() || style.color;
      const k = style.getPropertyValue('--superformula-opacity').trim();
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
      style={color ? ({ '--superformula-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
