// @ts-nocheck
// Churretes: Clic = salpicadura de pintura que gotea y se funde con las demás.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface ChurretesBackgroundProps {
  /** Tamaño */
  size?: number;
  /** Chorretones */
  drips?: number;
  /** Velocidad */
  spd?: number;
  /** Longitud máx. */
  len?: number;
  /** Vida (s) */
  life?: number;
  className?: string;
}

const DEFAULTS = { size: 24, drips: 3, spd: 90, len: 260, life: 14 };

export default function ChurretesBackground(props: ChurretesBackgroundProps) {
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
      setup(s){s.b=[];s.h=R()*360;for(let i=0;i<3;i++)this.add(s,W*(.25+.25*i),H*.25)},
      add(s,x,y){const r=P.size*(.6+.8*R());s.b.push({x,y,r,h:(s.h+R()*40)%360,a:0,d:Array.from({length:P.drips},()=>({x:x+(R()-.5)*r*1.4,y0:y,y,w:r*(.15+.2*R()),v:P.spd*(.3+.9*R()),m:P.len*(.2+.8*R())}))})},
      click(s,x,y){s.h=R()*360;this.add(s,x,y);if(s.b.length>60)s.b.shift()},
      draw(s,t,dt){s.b=s.b.filter(b=>(b.a+=dt)<P.life);
       for(const b of s.b){const f=Math.min(1,(P.life-b.a)/2);g.fillStyle=`hsl(${b.h},75%,50%)`;g.beginPath();dot(g,b.x,b.y,b.r*f);
        for(const d of b.d){const k=1-(d.y-d.y0)/d.m;if(d.y-d.y0<d.m)d.y+=d.v*dt*Math.max(.05,k);g.rect(d.x-d.w/2*f,d.y0,d.w*f,d.y-d.y0);dot(g,d.x,d.y,d.w*.85*f)}g.fill()}}
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
  }, [props.size, props.drips, props.spd, props.len, props.life]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#f2ede2" }}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={fid} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={6} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
        </defs>
      </svg>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "url(#" + fid + ")" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
