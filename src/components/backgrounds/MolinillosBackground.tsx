// @ts-nocheck
// Molinillos: Molinillos de viento: el movimiento del puntero los hace girar.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface MolinillosBackgroundProps {
  /** Tamaño (reinicia la escena) */
  cell?: number;
  /** Alcance */
  rad?: number;
  /** Viento */
  gain?: number;
  /** Fricción */
  fric?: number;
  /** Aspas */
  blades?: number;
  className?: string;
}

const DEFAULTS = { cell: 64, rad: 170, gain: 1, fric: 0.985, blades: 4 };

export default function MolinillosBackground(props: MolinillosBackgroundProps) {
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
      setup(s){s.m=[];const n=Math.ceil(W/P.cell),m=Math.ceil(H/P.cell);for(let j=0;j<m;j++)for(let i=0;i<n;i++)s.m.push({x:(i+.5)*P.cell,y:(j+.5)*P.cell,a:R()*TAU,w:0,h:R()*360});s.lx=null;s.ly=0},
      draw(s,t,dt){let vx=0,vy=0;if(ptr.on&&s.lx!=null){vx=ptr.x-s.lx;vy=ptr.y-s.ly}s.lx=ptr.on?ptr.x:null;s.ly=ptr.y;const sp=Math.hypot(vx,vy),z=P.cell*.42;
       for(const m of s.m){if(sp>0){const d=Math.hypot(m.x-ptr.x,m.y-ptr.y);if(d<P.rad){const cr=vx*(m.y-ptr.y)-vy*(m.x-ptr.x);m.w+=Math.sign(cr||1)*Math.min(sp,60)*P.gain*.35*(1-d/P.rad)}}
        m.w*=Math.pow(P.fric,dt*60);m.a+=m.w*dt;
        for(let k=0;k<P.blades;k++){const a0=m.a+k*TAU/P.blades;g.fillStyle=`hsl(${m.h+k*25},80%,${k%2?55:65}%)`;g.beginPath();g.moveTo(m.x,m.y);g.lineTo(m.x+Math.cos(a0)*z,m.y+Math.sin(a0)*z);g.lineTo(m.x+Math.cos(a0+.9)*z*.6,m.y+Math.sin(a0+.9)*z*.6);g.fill()}
        g.fillStyle='#333';g.beginPath();dot(g,m.x,m.y,2.5);g.fill()}}
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
  }, [props.cell, props.rad, props.gain, props.fric, props.blades]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#bfe3f2" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
