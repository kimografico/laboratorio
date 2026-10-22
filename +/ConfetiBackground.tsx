// @ts-nocheck
// Confeti: Clic = estallido. Con "Automático" cae confeti solo.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface ConfetiBackgroundProps {
  /** Piezas por clic */
  n?: number;
  /** Gravedad */
  gr?: number;
  /** Fuerza */
  pw?: number;
  /** Tamaño */
  size?: number;
  /** Automático */
  auto?: number;
  className?: string;
}

const DEFAULTS = { n: 120, gr: 380, pw: 800, size: 7, auto: 2 };

export default function ConfetiBackground(props: ConfetiBackgroundProps) {
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
      setup(s){s.c=[];s.t=0},
      burst(s,x,y,n){for(let i=0;i<n;i++){const a=R()*TAU,v=P.pw*(.2+.8*R());s.c.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-P.pw*.3,a:R()*TAU,va:(R()-.5)*12,tw:R()*TAU,h:R()*360})}},
      click(s,x,y){this.burst(s,x,y,P.n)},
      draw(s,t,dt){s.t+=dt;if(P.auto&&s.t>1/P.auto){s.t=0;this.burst(s,R()*W,R()*H*.5,P.n/2|0)}
       s.c=s.c.filter(p=>p.y<H+20);for(const p of s.c){p.vy+=P.gr*dt;p.vx*=.985;p.vy*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;p.a+=p.va*dt;p.tw+=dt*8;g.fillStyle=`hsl(${p.h},85%,60%)`;g.save();g.translate(p.x,p.y);g.rotate(p.a);g.fillRect(-P.size/2,-P.size/4*Math.cos(p.tw),P.size,P.size/2*Math.cos(p.tw));g.restore()}}
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
  }, [props.n, props.gr, props.pw, props.size, props.auto]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#1a1530" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
