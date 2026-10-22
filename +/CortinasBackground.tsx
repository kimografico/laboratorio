// @ts-nocheck
// Cortinas: Una cortina de telas que se abre al pasar el puntero y ondea.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface CortinasBackgroundProps {
  /** Pliegues */
  n?: number;
  /** Apertura */
  open?: number;
  /** Alcance */
  rad?: number;
  /** Ondulación */
  sw?: number;
  className?: string;
}

const DEFAULTS = { n: 50, open: 140, rad: 200, sw: 8 };

export default function CortinasBackground(props: CortinasBackgroundProps) {
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
      draw(s,t,dt){s.x+=((ptr.on?ptr.x:W/2+Math.sin(t/2500)*W*.3)-s.x)*.08;s.y+=((ptr.on?ptr.y:H/2)-s.y)*.08;const bw=W/P.n;g.lineWidth=bw*1.02;g.lineJoin='round';
       for(let i=0;i<P.n;i++){const x0=(i+.5)*bw,dx=x0-s.x;g.strokeStyle=['#7a1e32','#5e1526','#92293f'][i%3];g.beginPath();
        for(let y=-20;y<=H+20;y+=20){const dy=y-s.y,f=Math.exp(-((dy/P.rad)**2))*Math.exp(-((dx/(P.rad*1.5))**2)),x=x0+dx/(Math.abs(dx)+30)*P.open*f+Math.sin(t/700+y/90+i)*P.sw;y>-20?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}
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
  }, [props.n, props.open, props.rad, props.sw]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#2a0f18" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
