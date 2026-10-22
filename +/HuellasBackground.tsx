// @ts-nocheck
// Huellas: Un animal camina siguiendo al puntero y deja huellas que se desvanecen.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface HuellasBackgroundProps {
  /** Paso (px) */
  step?: number;
  /** Duración (s) */
  life?: number;
  /** Tamaño */
  size?: number;
  /** Separación */
  spread?: number;
  className?: string;
}

const DEFAULTS = { step: 48, life: 6, size: 14, spread: 0.9 };

export default function HuellasBackground(props: HuellasBackgroundProps) {
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
      setup(s){s.p=[];s.l=null;s.side=1;s.x=W/2;s.y=H/2},
      draw(s,t,dt){const tx=ptr.on?ptr.x:W/2+Math.cos(t/2000)*W*.35,ty=ptr.on?ptr.y:H/2+Math.sin(t/1300)*H*.3;s.x+=(tx-s.x)*.1;s.y+=(ty-s.y)*.1;
       if(!s.l)s.l=[s.x,s.y];const dx=s.x-s.l[0],dy=s.y-s.l[1];
       if(Math.hypot(dx,dy)>P.step){const a=Math.atan2(dy,dx);s.p.push({x:s.x-Math.sin(a)*s.side*P.spread*P.size,y:s.y+Math.cos(a)*s.side*P.spread*P.size,a,t:0});s.side*=-1;s.l=[s.x,s.y]}
       s.p=s.p.filter(p=>(p.t+=dt)<P.life);g.fillStyle='#4a3a28';const z=P.size;
       for(const p of s.p){g.globalAlpha=.8*(1-p.t/P.life);g.save();g.translate(p.x,p.y);g.rotate(p.a+Math.PI/2);g.beginPath();g.moveTo(z*.55,z*.3);g.ellipse(0,z*.3,z*.55,z*.45,0,0,TAU);for(const[a,b]of[[-.62,-.15],[-.22,-.55],[.22,-.55],[.62,-.15]])dot(g,a*z,b*z,z*.2);g.fill();g.restore()}g.globalAlpha=1}
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
  }, [props.step, props.life, props.size, props.spread]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#d8c9a8" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
