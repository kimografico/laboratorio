// @ts-nocheck
// Péndulo doble 2: Varios péndulos casi idénticos que se separan por caos. El puntero los atrae hacia su ángulo.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface PenduloDoble2BackgroundProps {
  /** Péndulos (reinicia la escena) */
  n?: number;
  /** Estela (reinicia la escena) */
  trail?: number;
  /** Velocidad */
  spd?: number;
  /** Amortiguación */
  damp?: number;
  /** Atracción */
  push?: number;
  /** Mostrar varillas */
  rod?: number;
  className?: string;
}

const DEFAULTS = { n: 12, trail: 160, spd: 1, damp: 0.02, push: 3, rod: 1 };

export default function PenduloDoble2Background(props: PenduloDoble2BackgroundProps) {
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
      setup(s){s.p=Array.from({length:P.n},(_,i)=>({a:2.2+i*.002,b:2.5+i*.002,u:0,v:0,tr:[],h:i/P.n*300+190}))},
      draw(s,t,dt){const L=Math.min(W,H)*.2,cx=W/2,cy=H*.42,gr=9.8,ta=ptr.on?Math.atan2(ptr.x-cx,ptr.y-cy):null;
       for(const p of s.p){const h=dt*P.spd/6;for(let i=0;i<6;i++){const d=p.a-p.b,den=3-Math.cos(2*d);
         const A=(-3*gr*Math.sin(p.a)-gr*Math.sin(p.a-2*p.b)-2*Math.sin(d)*(p.v*p.v+p.u*p.u*Math.cos(d)))/den,B=(2*Math.sin(d)*(2*p.u*p.u+2*gr*Math.cos(p.a)+p.v*p.v*Math.cos(d)))/den;
         p.u+=A*h-P.damp*p.u*h;p.v+=B*h-P.damp*p.v*h;if(ta!==null){p.u+=Math.sin(ta-p.a)*P.push*h;p.v+=Math.sin(ta-p.b)*P.push*h}p.a+=p.u*h;p.b+=p.v*h}
        const x1=cx+Math.sin(p.a)*L,y1=cy+Math.cos(p.a)*L,x2=x1+Math.sin(p.b)*L,y2=y1+Math.cos(p.b)*L;p.tr.push([x2,y2]);if(p.tr.length>P.trail)p.tr.splice(0,p.tr.length-P.trail);p.x1=x1;p.y1=y1;p.x2=x2;p.y2=y2}
       g.lineWidth=1.5;g.lineCap='round';for(const p of s.p){g.strokeStyle=`hsl(${p.h},80%,65%)`;g.globalAlpha=.7;g.beginPath();p.tr.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();
        if(P.rod){g.globalAlpha=.18;g.beginPath();g.moveTo(cx,cy);g.lineTo(p.x1,p.y1);g.lineTo(p.x2,p.y2);g.stroke()}}g.globalAlpha=1}
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
  }, [props.n, props.trail, props.spd, props.damp, props.push, props.rod]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#14121c" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
