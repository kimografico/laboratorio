// @ts-nocheck
// Nubes: Nubes blandas que se funden al cruzarse. El puntero sopla viento.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface NubesBackgroundProps {
  /** Nubes (reinicia la escena) */
  n?: number;
  /** Esponjosidad (reinicia la escena) */
  puff?: number;
  /** Tamaño (reinicia la escena) */
  size?: number;
  /** Viento */
  wind?: number;
  className?: string;
}

const DEFAULTS = { n: 8, puff: 6, size: 70, wind: 1.2 };

export default function NubesBackground(props: NubesBackgroundProps) {
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
      setup(s){s.c=Array.from({length:P.n},()=>({x:R()*W,y:R()*H,v:6+R()*14,ox:0,oy:0,k:Array.from({length:P.puff},()=>[(R()-.5)*P.size*2.2,(R()-.5)*P.size*.6,P.size*(.4+.5*R())])}))},
      draw(s,t,dt){g.fillStyle='#fff';g.beginPath();for(const c of s.c){c.x+=c.v*dt;if(c.x>W+P.size*2)c.x=-P.size*2;
        if(ptr.on){const dx=c.x-ptr.x,dy=c.y-ptr.y,d=Math.hypot(dx,dy)||1;if(d<300){const f=(1-d/300)*P.wind*140*dt;c.ox+=dx/d*f;c.oy+=dy/d*f}}
        c.ox*=.97;c.oy*=.97;for(const[a,b,r]of c.k)dot(g,c.x+c.ox+a,c.y+c.oy+b,r*(1+.06*Math.sin(t/900+a)))}g.fill()}
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
  }, [props.n, props.puff, props.size, props.wind]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#6fb5e8" }}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={fid} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={14} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
        </defs>
      </svg>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "url(#" + fid + ")" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
