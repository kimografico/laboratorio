// Fondo de hero: Ecualizador espejo
import { useEffect, useRef } from 'react';

export interface EcualizadorEspejoBackgroundProps {
  /** Separación (px) (5 a 30) */
  gap?: number;
  /** Grosor barra (0.1 a 0.9) */
  ratio?: number;
  /** Amplitud (0.1 a 1) */
  amp?: number;
  /** Velocidad (0 a 3) */
  speed?: number;
  /** Joroba puntero (0 a 1.5) */
  bump?: number;
  /** Opacidad (0.05 a 1) */
  alpha?: number;
  /** Opcional: fija el color. Por defecto se hereda del CSS de la pagina (color). */
  color?: string;
  className?: string;
}

const DEFAULTS = {
  gap: 12,
  ratio: 0.35,
  amp: 0.5,
  speed: 1,
  bump: 0.8,
  alpha: 0.45,
};

type Params = typeof DEFAULTS;
type Pointer = { x: number; y: number; sx: number; sy: number; on: boolean };

function init(W: number, H: number, P: Params, S: any) {S.h=new Float32Array(Math.ceil(W/P.gap)+1)}

function frame(c: CanvasRenderingContext2D, W: number, H: number, P: Params, S: any, t: number, m: Pointer, ink: string, dt: number) {c.strokeStyle=ink;c.globalAlpha=P.alpha;c.lineWidth=P.gap*P.ratio;c.lineCap='round';const k=t*.0015*P.speed;c.beginPath();
for(let i=0;i<S.h.length;i++){const x=i*P.gap,nz=Math.abs(Math.sin(x*.012+k)+Math.sin(x*.031-k*.8)*.7+Math.sin(x*.005+k*.4))/2.7,g=Math.exp(-Math.pow((x-m.sx)/130,2))*Math.max(0,1-Math.abs(m.sy-H/2)/H),tg=H*.5*P.amp*(.08+.92*nz)+H*.35*P.bump*g*(m.on?1:0);
S.h[i]+=(tg-S.h[i])*.12;const h=S.h[i];c.moveTo(x,H/2-h);c.lineTo(x,H/2+h)}c.stroke()}

export default function EcualizadorEspejoBackground(props: EcualizadorEspejoBackgroundProps) {
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
      const ink = style.getPropertyValue('--ecualizador-espejo-color').trim() || style.color;
      const k = style.getPropertyValue('--ecualizador-espejo-opacity').trim();
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
      style={color ? ({ '--ecualizador-espejo-color': color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
    </div>
  );
}
