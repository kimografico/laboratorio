// @ts-nocheck
// Guirnalda de luces 2: Guirnaldas de luces colgantes que oscilan; el puntero las empuja.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface Lights2BackgroundProps {
  /** Guirnaldas (reinicia la escena) */
  rows?: number;
  /** Bombillas (reinicia la escena) */
  bulbs?: number;
  /** Holgura (reinicia la escena) */
  slack?: number;
  /** Empuje */
  push?: number;
  /** Parpadeo */
  spd?: number;
  className?: string;
}

const DEFAULTS = { rows: 3, bulbs: 16, slack: 0.2, push: 1, spd: 2 };

export default function Lights2Background(props: Lights2BackgroundProps) {
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
      setup(s){s.r=[];const n=P.bulbs*3;for(let j=0;j<P.rows;j++){const y=H*(.15+.7*(j+.3)/P.rows),pts=[];for(let i=0;i<=n;i++){const x=i/n*W,yy=y+Math.sin(i/n*Math.PI)*H*.06;pts.push({x,y:yy,px:x,py:yy})}s.r.push({p:pts,len:W*(1+P.slack)/n,y})}},
      draw(s,t,dt){for(const r of s.r){const p=r.p,n=p.length-1;
        for(const a of p){const vx=(a.x-a.px)*.99,vy=(a.y-a.py)*.99;a.px=a.x;a.py=a.y;a.x+=vx;a.y+=vy+900*dt*dt;
         if(ptr.on){const dx=a.x-ptr.x,dy=a.y-ptr.y,d=Math.hypot(dx,dy);if(d<90&&d>0){const f=(1-d/90)*P.push*3;a.x+=dx/d*f;a.y+=dy/d*f}}}
        for(let it=0;it<8;it++){p[0].x=0;p[0].y=r.y;p[n].x=W;p[n].y=r.y;for(let i=0;i<n;i++){const a=p[i],b=p[i+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,k=(d-r.len)/d*.5;a.x+=dx*k;a.y+=dy*k;b.x-=dx*k;b.y-=dy*k}}
        g.strokeStyle='#3a3350';g.lineWidth=2;g.beginPath();p.forEach((a,i)=>i?g.lineTo(a.x,a.y):g.moveTo(a.x,a.y));g.stroke();
        for(let i=1;i<n;i+=3){const a=p[i],h=(i/3*40+t/1000*P.spd*60)%360,on=.5+.5*Math.sin(t/1000*P.spd*3+i);g.fillStyle=`hsl(${h},90%,${35+30*on}%)`;g.globalAlpha=.25;g.beginPath();dot(g,a.x,a.y+8,16);g.fill();g.globalAlpha=1;g.beginPath();dot(g,a.x,a.y+8,5);g.fill()}}}
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
  }, [props.rows, props.bulbs, props.slack, props.push, props.spd]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#14101f" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
