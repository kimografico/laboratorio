// @ts-nocheck
// Lombrices: Lombrices que reptan y se apartan del puntero (miedo negativo = lo persiguen).
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface LombricesBackgroundProps {
  /** Lombrices (reinicia la escena) */
  n?: number;
  /** Segmentos (reinicia la escena) */
  len?: number;
  /** Grosor */
  w?: number;
  /** Velocidad */
  sp?: number;
  /** Miedo */
  fear?: number;
  className?: string;
}

const DEFAULTS = { n: 10, len: 26, w: 6, sp: 70, fear: 0.6 };

export default function LombricesBackground(props: LombricesBackgroundProps) {
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
      setup(s){s.w=Array.from({length:P.n},()=>{const x=R()*W,y=R()*H;return{a:R()*TAU,t:R()*9,p:Array.from({length:P.len},()=>[x,y]),h:R()*30+330}})},
      draw(s,t,dt){for(const w of s.w){w.t+=dt;const h=w.p[0];w.a+=Math.sin(w.t*2.3+w.h)*dt*2.5;
        if(ptr.on){const dx=h[0]-ptr.x,dy=h[1]-ptr.y,d=Math.hypot(dx,dy);if(d<200)w.a+=Math.sin(Math.atan2(dy,dx)-w.a)*P.fear*dt*8*(1-d/200)}
        if(h[0]<40||h[0]>W-40||h[1]<40||h[1]>H-40)w.a+=Math.sin(Math.atan2(H/2-h[1],W/2-h[0])-w.a)*dt*4;
        h[0]+=Math.cos(w.a)*P.sp*dt;h[1]+=Math.sin(w.a)*P.sp*dt;
        for(let i=1;i<w.p.length;i++){const a=w.p[i-1],b=w.p[i],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;b[0]=a[0]+dx/d*P.w*.9;b[1]=a[1]+dy/d*P.w*.9}
        g.fillStyle=`hsl(${w.h},55%,65%)`;g.beginPath();w.p.forEach((k,i)=>dot(g,k[0],k[1],P.w*(.55+.45*(1-i/w.p.length))));g.fill()}}
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
  }, [props.n, props.len, props.w, props.sp, props.fear]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#3b2a20" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
