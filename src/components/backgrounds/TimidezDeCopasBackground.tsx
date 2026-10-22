// @ts-nocheck
// Timidez de copas: Vista cenital del dosel: las copas crecen hasta casi tocarse y dejan canales de cielo entre ellas (crown shyness). El puntero es una brisa que las hace oscilar; clic = planta un árbol.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface TimidezDeCopasBackgroundProps {
  /** Árboles (reinicia la escena) */
  n?: number;
  /** Separación entre copas (reinicia la escena) */
  gap?: number;
  /** Crecimiento */
  grow?: number;
  /** Resolución de copa (reinicia la escena) */
  rays?: number;
  /** Radio máximo */
  maxr?: number;
  /** Balanceo (px) */
  sway?: number;
  /** Fuerza de la brisa del ratón */
  gust?: number;
  /** Radio de la brisa */
  rad?: number;
  /** Brisa ambiental */
  amb?: number;
  className?: string;
}

const DEFAULTS = { n: 70, gap: 9, grow: 40, rays: 160, maxr: 160, sway: 8, gust: 1, rad: 220, amb: 0.35 };

export default function TimidezDeCopasBackground(props: TimidezDeCopasBackgroundProps) {
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
      tree(x,y){return{x,y,r:new Float32Array(P.rays).fill(6),rm:6,h:95+R()*50,l:40+R()*9,ph:R()*TAU,ox:0,oy:0,vx:0,vy:0,nb:[],bk:new Uint8Array(P.rays)}},
      rAt(t,a){const K=P.rays,u=(((a%TAU)+TAU)%TAU)/TAU*K,i=u|0,f=u-i;return t.r[i%K]*(1-f)+t.r[(i+1)%K]*f},
      setup(s){s.t=[];s.lx=null;s.ly=0;s.pvx=0;s.pvy=0;let k=0;while(s.t.length<P.n&&k++<P.n*60){const x=R()*W,y=R()*H;if(s.t.every(t=>Math.hypot(t.x-x,t.y-y)>16+P.gap))s.t.push(this.tree(x,y))}},
      click(s,x,y){if(s.t.every(t=>Math.hypot(t.x-x,t.y-y)>16+P.gap)){s.t.push(this.tree(x,y));if(s.t.length>200)s.t.shift()}},
      step(s,t,dt){const K=P.rays,ds=P.grow*dt;let vx=0,vy=0;if(ptr.on&&s.lx!=null){vx=ptr.x-s.lx;vy=ptr.y-s.ly}s.lx=ptr.on?ptr.x:null;s.ly=ptr.y;s.pvx=s.pvx*.85+vx*.15;s.pvy=s.pvy*.85+vy*.15;
       for(const a of s.t){a.rm=Math.max(...a.r);a.nb=[]}
       for(const a of s.t)for(const b of s.t)if(a!==b&&Math.hypot(a.x-b.x,a.y-b.y)<a.rm+b.rm+P.gap+ds+4)a.nb.push(b);
       s.fr=(s.fr||0)+1;for(const a of s.t)for(let k=0;k<K;k++){if(a.bk[k]&&(s.fr+k)%6)continue;const nr=a.r[k]+ds;if(nr>P.maxr)continue;const ang=k*TAU/K,px=a.x+Math.cos(ang)*nr,py=a.y+Math.sin(ang)*nr;let bl=false;
        for(const b of a.nb){const dx=px-b.x,dy=py-b.y,d=Math.hypot(dx,dy);if(d>b.rm+P.gap+2)continue;if(d<this.rAt(b,Math.atan2(dy,dx))+P.gap){bl=true;break}}
        a.bk[k]=bl?1:0;if(!bl)a.r[k]=nr}
       const T=t/1000;for(const a of s.t){const wv=.5+.5*Math.sin(a.x*.006-T*1.3+a.y*.003),th=.6+Math.sin(T*.11)*.8;let fx=Math.cos(th)*wv*P.amb,fy=Math.sin(th)*wv*P.amb*.6;
        if(ptr.on){const d=Math.hypot(a.x-ptr.x,a.y-ptr.y),q2=Math.exp(-((d/P.rad)**2));fx+=Math.max(-2,Math.min(2,s.pvx/12))*q2*P.gust;fy+=Math.max(-2,Math.min(2,s.pvy/12))*q2*P.gust}
        a.vx+=((fx*P.sway-a.ox)*28-a.vx*5)*dt;a.vy+=((fy*P.sway-a.oy)*28-a.vy*5)*dt;a.ox+=a.vx*dt;a.oy+=a.vy*dt}},
      draw(s,t,dt){this.step(s,t,dt);const K=P.rays;
       const poly=(a,sc)=>{g.beginPath();for(let k=0;k<K;k++){const ang=k*TAU/K,r=a.r[k]*sc,f=.3+.7*(a.r[k]/a.rm),fl=Math.sin(t*.004+k*.7+a.ph)*P.sway*.1,x=a.x+Math.cos(ang)*r+a.ox*f+fl,y=a.y+Math.sin(ang)*r+a.oy*f+fl;k?g.lineTo(x,y):g.moveTo(x,y)}g.closePath()};
       for(const a of s.t){g.fillStyle=`hsl(${a.h},45%,${a.l-14}%)`;poly(a,1);g.fill();g.fillStyle=`hsl(${a.h},48%,${a.l-6}%)`;poly(a,.82);g.fill();g.fillStyle=`hsl(${a.h},52%,${a.l+4}%)`;poly(a,.55);g.fill();g.fillStyle='#4a3524';g.beginPath();dot(g,a.x+a.ox*.3,a.y+a.oy*.3,3);g.fill()}}
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
  }, [props.n, props.gap, props.grow, props.rays, props.maxr, props.sway, props.gust, props.rad, props.amb]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#cfe6f5" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
