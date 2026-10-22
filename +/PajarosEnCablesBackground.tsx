// @ts-nocheck
// Pájaros en cables: Pájaros posados en cables. Si te acercas echan a volar y aterrizan en otro sitio.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface PajarosEnCablesBackgroundProps {
  /** Pájaros (reinicia la escena) */
  n?: number;
  /** Cables (reinicia la escena) */
  wires?: number;
  /** Distancia de susto */
  scare?: number;
  /** Tamaño */
  size?: number;
  className?: string;
}

const DEFAULTS = { n: 22, wires: 4, scare: 110, size: 9 };

export default function PajarosEnCablesBackground(props: PajarosEnCablesBackgroundProps) {
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
      setup(s){s.w=Array.from({length:P.wires},(_,i)=>H*(.2+.6*(i+.5)/P.wires));s.b=Array.from({length:P.n},()=>{const w=R()*P.wires|0;return{x:R()*W,y:s.w[w],st:0,vx:0,tx:0,ty:0,p:R()*9,f:R()<.5?-1:1}})},
      draw(s,t,dt){g.strokeStyle='#44505c';g.lineWidth=1.5;g.beginPath();for(const y of s.w){g.moveTo(0,y);g.lineTo(W,y)}g.stroke();const z=P.size;
       for(const b of s.b){if(b.st==0&&ptr.on&&Math.hypot(b.x-ptr.x,b.y-ptr.y)<P.scare){b.st=1;b.tx=R()*W;b.ty=s.w[R()*P.wires|0]}
        if(b.st==1){b.p+=dt*26;const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy)||1;b.vx=dx/d*280;b.x+=b.vx*dt;b.y+=(dy/d*280-Math.sin(t/160)*50)*dt;if(d<10){b.st=0;b.x=b.tx;b.y=b.ty}b.f=b.vx<0?-1:1}
        const f=b.f;g.fillStyle='#2e3a46';g.beginPath();g.ellipse(b.x,b.y-z*.9,z*1.1,z*.8,0,0,TAU);dot(g,b.x+f*z*.9,b.y-z*1.5,z*.5);g.fill();
        g.beginPath();g.moveTo(b.x-f*z*.9,b.y-z*1.1);g.lineTo(b.x-f*z*2.1,b.y-z*.5);g.lineTo(b.x-f*z*1.1,b.y-z*.5);g.fill();
        g.fillStyle='#e0a030';g.beginPath();g.moveTo(b.x+f*z*1.35,b.y-z*1.6);g.lineTo(b.x+f*z*1.95,b.y-z*1.45);g.lineTo(b.x+f*z*1.35,b.y-z*1.3);g.fill();
        if(b.st){g.strokeStyle='#2e3a46';g.lineWidth=2;g.beginPath();g.moveTo(b.x,b.y-z);g.lineTo(b.x-f*z*.4,b.y-z-Math.sin(b.p)*z*2.2);g.stroke();g.strokeStyle='#44505c';g.lineWidth=1.5}}}
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
  }, [props.n, props.wires, props.scare, props.size]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#cfe6f2" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
