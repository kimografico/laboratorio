// @ts-nocheck
// Hojas de otoño: Hojas que caen balanceándose. El movimiento del puntero genera viento.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface HojasDeOtonoBackgroundProps {
  /** Hojas (reinicia la escena) */
  n?: number;
  /** Caída */
  gr?: number;
  /** Balanceo */
  sway?: number;
  /** Viento del ratón */
  wind?: number;
  /** Tamaño */
  size?: number;
  className?: string;
}

const DEFAULTS = { n: 60, gr: 60, sway: 1.2, wind: 1.2, size: 14 };

export default function HojasDeOtonoBackground(props: HojasDeOtonoBackgroundProps) {
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
      setup(s){s.l=Array.from({length:P.n},()=>({x:R()*W,y:R()*H,a:R()*TAU,p:R()*TAU,vx:0,vy:0,h:10+R()*30,k:.6+R()*.8}));s.px=-1;s.py=0;s.wx=0;s.wy=0},
      draw(s,t,dt){if(ptr.on){if(s.px>=0){s.wx=s.wx*.8+(ptr.x-s.px)*.2;s.wy=s.wy*.8+(ptr.y-s.py)*.2}s.px=ptr.x;s.py=ptr.y}else s.px=-1;s.wx*=.9;s.wy*=.9;
       for(const l of s.l){l.p+=dt*2*l.k;if(ptr.on){const d=Math.hypot(l.x-ptr.x,l.y-ptr.y);if(d<200){l.vx+=s.wx*P.wind*(1-d/200)*.5;l.vy+=s.wy*P.wind*(1-d/200)*.3}}
        l.vx*=.97;l.vy*=.97;l.x+=Math.sin(l.p)*40*P.sway*dt+l.vx;l.y+=P.gr*l.k*dt+l.vy;l.a+=Math.cos(l.p)*dt*P.sway+l.vx*.02;
        if(l.y>H+20){l.y=-20;l.x=R()*W}if(l.x<-20)l.x=W+20;if(l.x>W+20)l.x=-20;
        g.fillStyle=`hsl(${l.h},75%,48%)`;g.save();g.translate(l.x,l.y);g.rotate(l.a);g.beginPath();g.ellipse(0,0,P.size*.7*Math.max(.25,Math.abs(Math.cos(l.p))),P.size*.4,0,0,TAU);g.fill();g.restore()}}
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
  }, [props.n, props.gr, props.sway, props.wind, props.size]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#e9dcc0" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
