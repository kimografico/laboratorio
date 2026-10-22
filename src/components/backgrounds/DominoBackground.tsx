// @ts-nocheck
// Dominó: Filas de fichas: tocar una desencadena la caída en cadena. Después se vuelven a levantar.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface DominoBackgroundProps {
  /** Altura (reinicia la escena) */
  h?: number;
  /** Separación (reinicia la escena) */
  gap?: number;
  /** Velocidad caída */
  sp?: number;
  /** Levantar tras (s) */
  up?: number;
  className?: string;
}

const DEFAULTS = { h: 30, gap: 14, sp: 3.5, up: 4 };

export default function DominoBackground(props: DominoBackgroundProps) {
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
      setup(s){s.d=[];const rows=Math.floor(H/(P.h*1.5)),n=Math.floor((W-60)/P.gap);s.r=rows;for(let j=0;j<rows;j++)for(let i=0;i<n;i++)s.d.push({x:30+i*P.gap,y:(j+.8)*H/rows,s:0,t:0,w:0,j,i})},
      hit(s,x,y){let b=null,bd=40;for(const d of s.d){const e=Math.hypot(d.x-x,d.y-y);if(e<bd&&d.s==0){bd=e;b=d}}if(b)b.s=1},
      click(s,x,y){this.hit(s,x,y)},
      draw(s,t,dt){if(ptr.on)this.hit(s,ptr.x,ptr.y);let pv=null;
       for(const d of s.d){if(d.s==0&&pv&&pv.j==d.j&&pv.s>0&&pv.s<3&&pv.t>.3)d.s=1;
        if(d.s==1){d.t+=dt*P.sp;if(d.t>=1){d.t=1;d.s=2;d.w=0}}else if(d.s==2){d.w+=dt;if(d.w>P.up)d.s=3}else if(d.s==3){d.t-=dt*1.5;if(d.t<=0){d.t=0;d.s=0}}pv=d}
       for(const d of s.d){const w=Math.max(3,P.gap*.45);g.save();g.translate(d.x+w/2,d.y);g.rotate(d.t*1.4);g.fillStyle=['#1d2b3a','#8a2f2f','#2f6a4a'][d.j%3];g.fillRect(-w,-P.h,w,P.h);g.restore()}}
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
  }, [props.h, props.gap, props.sp, props.up]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#e7dfcf" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
