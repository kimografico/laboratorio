// @ts-nocheck
// Brasas: Ascuas que suben y se enfrían. El puntero sopla sobre ellas; clic = chispazo.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface BrasasBackgroundProps {
  /** Emisión */
  rate?: number;
  /** Ascenso */
  rise?: number;
  /** Tamaño */
  size?: number;
  /** Soplido */
  blow?: number;
  className?: string;
}

const DEFAULTS = { rate: 140, rise: 90, size: 2.5, blow: 1.2 };

export default function BrasasBackground(props: BrasasBackgroundProps) {
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
      setup(s){s.e=[];s.acc=0},
      add(s,x,y,v){s.e.push({x,y,vx:(R()-.5)*v,vy:-(.5+R())*P.rise,l:0,m:2+R()*3,p:R()*TAU,r:P.size*(.5+R())})},
      click(s,x,y){for(let i=0;i<60;i++)this.add(s,x,y,300)},
      draw(s,t,dt){s.acc+=P.rate*dt;while(s.acc>1){s.acc--;this.add(s,R()*W,H+5,30)}
       s.e=s.e.filter(e=>(e.l+=dt)<e.m);g.globalCompositeOperation='lighter';
       for(const e of s.e){e.p+=dt*4;e.vx+=Math.sin(e.p)*40*dt;if(ptr.on){const dx=e.x-ptr.x,dy=e.y-ptr.y,d=Math.hypot(dx,dy)||1;if(d<180){const f=(1-d/180)*P.blow*600*dt;e.vx+=dx/d*f;e.vy+=dy/d*f}}
        e.vx*=.98;e.x+=e.vx*dt;e.y+=e.vy*dt;const u=e.l/e.m;g.fillStyle=`hsl(${50-45*u},100%,${55-25*u}%)`;
        g.globalAlpha=(1-u)*.15;g.beginPath();dot(g,e.x,e.y,e.r*4);g.fill();g.globalAlpha=1-u;g.beginPath();dot(g,e.x,e.y,e.r*(1-.5*u));g.fill()}
       g.globalAlpha=1;g.globalCompositeOperation='source-over'}
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
  }, [props.rate, props.rise, props.size, props.blow]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#120806" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
