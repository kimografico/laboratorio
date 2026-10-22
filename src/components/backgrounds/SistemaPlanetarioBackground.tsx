// @ts-nocheck
// Sistema planetario: Una estrella y planetas con órbitas keplerianas. Clic = lanza un planeta; el puntero actúa como una segunda masa que perturba las órbitas.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface SistemaPlanetarioBackgroundProps {
  /** Planetas iniciales (reinicia la escena) */
  n?: number;
  /** Gravedad de la estrella */
  gm?: number;
  /** Masa del puntero */
  pm?: number;
  /** Estela */
  trail?: number;
  /** Excentricidad */
  ecc?: number;
  className?: string;
}

const DEFAULTS = { n: 6, gm: 8, pm: 0.12, trail: 220, ecc: 0.15 };

export default function SistemaPlanetarioBackground(props: SistemaPlanetarioBackgroundProps) {
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
      add(s,r,a){const v=Math.sqrt(P.gm*1e6/r)*(1+(R()*2-1)*P.ecc);s.b.push({x:W/2+Math.cos(a)*r,y:H/2+Math.sin(a)*r,vx:-Math.sin(a)*v,vy:Math.cos(a)*v,h:R()*360,t:[],z:2.5+R()*2.5})},
      setup(s){s.b=[];for(let i=0;i<P.n;i++)this.add(s,Math.min(W,H)*(.12+.33*(i+R()*.6)/P.n),R()*TAU)},
      click(s,x,y){this.add(s,Math.max(40,Math.hypot(x-W/2,y-H/2)),Math.atan2(y-H/2,x-W/2));if(s.b.length>40)s.b.shift()},
      draw(s,t,dt){const GM=P.gm*1e6,N=8,h=dt/N,cx=W/2,cy=H/2;
       for(let k=0;k<N;k++)for(const b of s.b){let dx=cx-b.x,dy=cy-b.y,r2=dx*dx+dy*dy+400,r=Math.sqrt(r2),a=GM/(r2*r);b.vx+=dx*a*h;b.vy+=dy*a*h;
        if(ptr.on&&P.pm>0){dx=ptr.x-b.x;dy=ptr.y-b.y;r2=dx*dx+dy*dy+900;r=Math.sqrt(r2);a=GM*P.pm/(r2*r);b.vx+=dx*a*h;b.vy+=dy*a*h}b.x+=b.vx*h;b.y+=b.vy*h}
       s.b=s.b.filter(b=>{const r=Math.hypot(b.x-cx,b.y-cy);return r>14&&r<Math.max(W,H)*3});
       if(s.b.length<P.n&&R()<dt*2)this.add(s,Math.min(W,H)*(.15+.3*R()),R()*TAU);
       g.lineWidth=1.2;for(const b of s.b){b.t.push([b.x,b.y]);while(b.t.length>P.trail)b.t.shift();const m=b.t.length>>1;g.strokeStyle=`hsla(${b.h},80%,65%,.22)`;g.beginPath();b.t.slice(0,m+1).forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.strokeStyle=`hsla(${b.h},80%,65%,.6)`;g.beginPath();b.t.slice(m).forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()}
       const gr=g.createRadialGradient(cx,cy,6,cx,cy,60);gr.addColorStop(0,'rgba(255,210,120,.6)');gr.addColorStop(1,'rgba(255,210,120,0)');g.fillStyle=gr;g.beginPath();dot(g,cx,cy,60);g.fill();g.fillStyle='#ffe29a';g.beginPath();dot(g,cx,cy,12);g.fill();
       for(const b of s.b){g.fillStyle=`hsl(${b.h},80%,65%)`;g.beginPath();dot(g,b.x,b.y,b.z);g.fill()}
       if(ptr.on&&P.pm>0){g.strokeStyle='rgba(180,200,255,.5)';g.lineWidth=1.5;g.beginPath();g.arc(ptr.x,ptr.y,6+P.pm*30,0,TAU);g.stroke()}}
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
  }, [props.n, props.gm, props.pm, props.trail, props.ecc]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#05060d" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
