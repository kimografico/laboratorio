// @ts-nocheck
// Hipnosis: Espiral de puntos que gira. El puntero la centra y su posición horizontal cambia la torsión.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface HipnosisBackgroundProps {
  /** Brazos */
  arms?: number;
  /** Torsión */
  tw?: number;
  /** Velocidad */
  sp?: number;
  /** Separación */
  gap?: number;
  /** Punto */
  size?: number;
  className?: string;
}

const DEFAULTS = { arms: 5, tw: 0.012, sp: 0.8, gap: 12, size: 3 };

export default function HipnosisBackground(props: HipnosisBackgroundProps) {
  const { className } = props;
  const cRef = useRef<HTMLCanvasElement>(null);
  const oRef = useRef<HTMLCanvasElement>(null);
  const fid = "goo-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const c = cRef.current!;
    const o = oRef.current!;
    const g = c.getContext("2d")!;
    const q = o.getContext("2d")!;
    const R = Math.random;
    const TAU = Math.PI * 2;
    const P: any = { ...DEFAULTS, ...props };
    const ptr = { x: -9999, y: -9999, on: false };
    let W = 0, H = 0, S: any = {}, raf = 0, last = 0;
    const dot = (k,x,y,r)=>{k.moveTo(x+r,y);k.arc(x,y,r,0,TAU)};
    const ant = (k,x,y,a,z)=>{const ca=Math.cos(a),sa=Math.sin(a);k.beginPath();dot(k,x-2*z*ca,y-2*z*sa,1.1*z);dot(k,x,y,.8*z);dot(k,x+1.6*z*ca,y+1.6*z*sa,.7*z);k.fill()};
    const E: any = {
      setup(s){s.x=W/2;s.y=H/2},
      draw(s,t,dt){s.x+=((ptr.on?ptr.x:W/2)-s.x)*.1;s.y+=((ptr.on?ptr.y:H/2)-s.y)*.1;const tw=ptr.on?(ptr.x/W-.5)*.1:P.tw,D=Math.hypot(W,H);
       for(let a=0;a<P.arms;a++){g.fillStyle=`hsl(${300+a*(60/P.arms)},90%,70%)`;g.beginPath();for(let r=P.gap;r<D;r+=P.gap){const an=a*TAU/P.arms+r*tw+t/1000*P.sp;dot(g,s.x+Math.cos(an)*r,s.y+Math.sin(an)*r,P.size*(.3+r/D*3))}g.fill()}}
    };

    const reset = () => { S = {}; if (E.setup) E.setup(S); };
    function resize() {
      W = c.width = o.width = c.clientWidth;
      H = c.height = o.height = c.clientHeight;
      reset();
    }
    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      ptr.on = ptr.x >= 0 && ptr.y >= 0 && ptr.x <= r.width && ptr.y <= r.height;
    };
    const onDown = (e: PointerEvent) => { onMove(e); if (ptr.on && E.click) E.click(S, ptr.x, ptr.y); };
    function loop(t: number) {
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      g.clearRect(0, 0, W, H);
      q.clearRect(0, 0, W, H);
      E.draw(S, t, dt);
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [props.arms, props.tw, props.sp, props.gap, props.size]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#1b1033" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
