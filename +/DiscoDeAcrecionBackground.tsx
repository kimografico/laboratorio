// @ts-nocheck
// Disco de acreción: Un agujero negro (el puntero) devora un disco de materia que orbita y espirala hacia dentro.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface DiscoDeAcrecionBackgroundProps {
  /** Partículas (reinicia la escena) */
  n?: number;
  /** Radio del disco (reinicia la escena) */
  rmax?: number;
  /** Inclinación */
  tilt?: number;
  /** Succión */
  pull?: number;
  /** Velocidad */
  sp?: number;
  className?: string;
}

const DEFAULTS = { n: 1200, rmax: 260, tilt: 0.35, pull: 0.5, sp: 1 };

export default function DiscoDeAcrecionBackground(props: DiscoDeAcrecionBackgroundProps) {
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
      setup(s){s.x=W/2;s.y=H/2;s.p=Array.from({length:P.n},()=>({r:P.rmax*(.15+.85*Math.sqrt(R())),a:R()*TAU}))},
      draw(s,t,dt){s.x+=((ptr.on?ptr.x:W/2)-s.x)*.08;s.y+=((ptr.on?ptr.y:H/2)-s.y)*.08;const hz=P.rmax*.1;g.globalCompositeOperation='lighter';
       for(const p of s.p){p.a+=dt*P.sp*3000*Math.pow(p.r,-1.5);p.r-=dt*P.pull*10*(P.rmax/p.r);if(p.r<hz){p.r=P.rmax*(.9+.1*R());p.a=R()*TAU}
        const u=p.r/P.rmax;g.fillStyle=`hsl(${200-170*Math.min(1,u*1.6)},100%,${80-40*u}%)`;g.globalAlpha=Math.max(.1,.5+.4*Math.cos(p.a-.8));g.beginPath();dot(g,s.x+Math.cos(p.a)*p.r,s.y+Math.sin(p.a)*p.r*P.tilt,1.3);g.fill()}
       g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle='#000';g.beginPath();dot(g,s.x,s.y,hz*1.1);g.fill();g.strokeStyle='#ffd9a0';g.lineWidth=1.5;g.globalAlpha=.7;g.beginPath();g.arc(s.x,s.y,hz*1.1,0,TAU);g.stroke();g.globalAlpha=1}
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
  }, [props.n, props.rmax, props.tilt, props.pull, props.sp]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#03030a" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
