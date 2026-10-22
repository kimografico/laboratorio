// @ts-nocheck
// Red neuronal: Neuronas que se disparan y propagan impulsos por las conexiones. El puntero las excita.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface RedNeuronalBackgroundProps {
  /** Neuronas (reinicia la escena) */
  n?: number;
  /** Conexiones (reinicia la escena) */
  k?: number;
  /** Velocidad impulso */
  sp?: number;
  /** Alcance */
  rad?: number;
  /** Disparo espontáneo */
  rnd?: number;
  className?: string;
}

const DEFAULTS = { n: 60, k: 3, sp: 200, rad: 100, rnd: 0.1 };

export default function RedNeuronalBackground(props: RedNeuronalBackgroundProps) {
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
      setup(s){s.n=Array.from({length:P.n},()=>({x:R()*W,y:R()*H,c:0,f:0,e:[]}));s.n.forEach((a,i)=>{a.e=s.n.map((b,j)=>[j,Math.hypot(a.x-b.x,a.y-b.y)]).filter(e=>e[0]!=i).sort((u,v)=>u[1]-v[1]).slice(0,P.k)});s.s=[]},
      fire(s,i){const a=s.n[i];a.f=1;a.c=-.5;for(const[j,d]of a.e)s.s.push({i,j,u:0,d})},
      draw(s,t,dt){g.strokeStyle='rgba(120,150,255,.18)';g.lineWidth=1;g.beginPath();for(const a of s.n)for(const[j]of a.e){g.moveTo(a.x,a.y);g.lineTo(s.n[j].x,s.n[j].y)}g.stroke();
       s.n.forEach((a,i)=>{if(ptr.on&&Math.hypot(a.x-ptr.x,a.y-ptr.y)<P.rad)a.c+=dt*2;if(R()<dt*P.rnd)a.c+=1;if(a.c<0)a.c+=dt*.6;else a.c=Math.max(0,a.c-dt*.15);if(a.c>=1&&a.f<.3)this.fire(s,i);a.f*=Math.pow(.05,dt)});
       s.s=s.s.filter(p=>{p.u+=dt*P.sp/p.d;if(p.u>=1){const b=s.n[p.j];if(b.c>=0)b.c+=.55;return false}return true});
       g.fillStyle='#bcd2ff';g.beginPath();for(const p of s.s){const a=s.n[p.i],b=s.n[p.j];dot(g,a.x+(b.x-a.x)*p.u,a.y+(b.y-a.y)*p.u,2.5)}g.fill();
       for(const a of s.n){g.fillStyle=`hsl(220,85%,${35+55*a.f}%)`;g.beginPath();dot(g,a.x,a.y,3+5*a.f);g.fill()}}
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
  }, [props.n, props.k, props.sp, props.rad, props.rnd]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#0c1020" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
