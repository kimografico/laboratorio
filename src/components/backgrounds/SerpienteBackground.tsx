// @ts-nocheck
// Serpiente: Una serpiente persigue la comida. Clic = pone comida; si no hay, sigue al puntero o vaga sola.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface SerpienteBackgroundProps {
  /** Longitud inicial (reinicia la escena) */
  len?: number;
  /** Grosor */
  w?: number;
  /** Velocidad */
  sp?: number;
  /** Crecimiento */
  grow?: number;
  className?: string;
}

const DEFAULTS = { len: 15, w: 9, sp: 170, grow: 3 };

export default function SerpienteBackground(props: SerpienteBackgroundProps) {
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
      setup(s){s.b=Array.from({length:P.len},()=>[W/2,H/2]);s.a=0;s.f=[]},
      click(s,x,y){s.f.push([x,y])},
      draw(s,t,dt){const h=s.b[0],tg=s.f[0]||(ptr.on?[ptr.x,ptr.y]:[W/2+Math.cos(t/1500)*W*.35,H/2+Math.sin(t/1100)*H*.3]);
       s.a+=Math.sin(Math.atan2(tg[1]-h[1],tg[0]-h[0])-s.a)*dt*5+Math.sin(t/300)*dt*1.5;h[0]+=Math.cos(s.a)*P.sp*dt;h[1]+=Math.sin(s.a)*P.sp*dt;
       if(s.f[0]&&Math.hypot(tg[0]-h[0],tg[1]-h[1])<P.w*1.6){s.f.shift();for(let i=0;i<P.grow;i++)s.b.push([...s.b[s.b.length-1]])}
       for(let i=1;i<s.b.length;i++){const a=s.b[i-1],c=s.b[i],dx=c[0]-a[0],dy=c[1]-a[1],d=Math.hypot(dx,dy)||1,k=P.w*.8;if(d>k){c[0]=a[0]+dx/d*k;c[1]=a[1]+dy/d*k}}
       g.fillStyle='#e3503e';g.beginPath();for(const f of s.f)dot(g,f[0],f[1],P.w*.5);g.fill();
       for(let i=s.b.length-1;i>=0;i--){g.fillStyle=`hsl(${95+i*2},60%,${52-i*.2}%)`;g.beginPath();dot(g,s.b[i][0],s.b[i][1],P.w*(.6+.4*(1-i/s.b.length)));g.fill()}
       g.fillStyle='#111';g.beginPath();for(const sg of[-1,1])dot(g,h[0]+Math.cos(s.a)*P.w*.3-Math.sin(s.a)*sg*P.w*.35,h[1]+Math.sin(s.a)*P.w*.3+Math.cos(s.a)*sg*P.w*.35,P.w*.14);g.fill()}
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
  }, [props.len, props.w, props.sp, props.grow]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#1e3320" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
