// @ts-nocheck
// Espirógrafo: Dos fasores girando: el puntero cambia la proporción entre ellos (X) y la velocidad (Y).
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface EspirografoBackgroundProps {
  /** Frecuencia A */
  n?: number;
  /** Frecuencia B */
  m?: number;
  /** Capas */
  layers?: number;
  /** Radio */
  r?: number;
  /** Proporción B */
  d?: number;
  /** Velocidad */
  speed?: number;
  /** Grosor */
  lw?: number;
  className?: string;
}

const DEFAULTS = { n: 5, m: -7, layers: 10, r: 0.3, d: 0.55, speed: 0.5, lw: 1.2 };

export default function EspirografoBackground(props: EspirografoBackgroundProps) {
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
      setup(s){s.ph=0;s.d=P.d},
      draw(s,t,dt){const k=Math.min(W,H)*P.r*2,dT=ptr.on?ptr.x/W*1.2:P.d;s.d+=(dT-s.d)*.08;s.ph+=dt*P.speed*(ptr.on?.3+ptr.y/H*2:1);
       g.lineWidth=P.lw;g.strokeStyle='#8fe3d0';g.lineJoin='round';
       for(let l=0;l<P.layers;l++){const u=l/P.layers,A=k*(.6+.5*u),B=A*s.d,ph=s.ph*(1+u)+u*Math.PI;g.globalAlpha=.15+.5*(1-u);g.beginPath();
        for(let i=0;i<=480;i++){const a=i/480*TAU,x=W/2+A*Math.cos(P.n*a)+B*Math.cos(P.m*a+ph),y=H/2+A*Math.sin(P.n*a)+B*Math.sin(P.m*a+ph);i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}
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
  }, [props.n, props.m, props.layers, props.r, props.d, props.speed, props.lw]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#101a22" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
