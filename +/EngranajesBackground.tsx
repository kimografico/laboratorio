// @ts-nocheck
// Engranajes: Rejilla de engranajes encajados. El puntero acelera los cercanos.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface EngranajesBackgroundProps {
  /** Tamaño (reinicia la escena) */
  cell?: number;
  /** Dientes (reinicia la escena) */
  teeth?: number;
  /** Velocidad */
  sp?: number;
  /** Impulso del puntero */
  boost?: number;
  /** Alcance */
  rad?: number;
  className?: string;
}

const DEFAULTS = { cell: 90, teeth: 12, sp: 0.5, boost: 2.5, rad: 200 };

export default function EngranajesBackground(props: EngranajesBackgroundProps) {
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
      setup(s){s.g=[];const n=Math.ceil(W/P.cell)+1,m=Math.ceil(H/P.cell)+1;for(let j=0;j<m;j++)for(let i=0;i<n;i++)s.g.push({x:i*P.cell,y:j*P.cell,d:(i+j)&1?-1:1,a:0,o:(i+j)&1?Math.PI/P.teeth:0})},
      draw(s,t,dt){const R1=P.cell/2*.98,R0=R1*.82,T=P.teeth;g.fillStyle='#8ea1b8';
       for(const e of s.g){const d=ptr.on?Math.hypot(e.x-ptr.x,e.y-ptr.y):1e9,k=1+P.boost*Math.max(0,1-d/P.rad);e.a+=dt*P.sp*k;
        g.beginPath();for(let i=0;i<T*4;i++){const f=i/(T*4)*TAU,ph=i%4,r=(ph==1||ph==2)?R1:R0,a=e.d*e.a+e.o+f,x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y)}
        g.closePath();dot(g,e.x,e.y,R0*.3);g.fill('evenodd')}}
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
  }, [props.cell, props.teeth, props.sp, props.boost, props.rad]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#2a2f38" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
