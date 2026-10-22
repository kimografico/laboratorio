// @ts-nocheck
// Ecualizador: Barras de LED que bailan; el puntero inyecta energía (más arriba = más).
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface EcualizadorBackgroundProps {
  /** Barras (reinicia la escena) */
  n?: number;
  /** Segmentos */
  seg?: number;
  /** Velocidad */
  sp?: number;
  /** Impulso */
  boost?: number;
  className?: string;
}

const DEFAULTS = { n: 40, seg: 20, sp: 1.5, boost: 0.8 };

export default function EcualizadorBackground(props: EcualizadorBackgroundProps) {
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
      setup(s){s.b=Array.from({length:P.n},()=>({p:R()*9,h:0,pk:0}))},
      draw(s,t,dt){const bw=W/P.n,sh=H*.85/P.seg;for(let i=0;i<P.n;i++){const b=s.b[i];let v=.4+.2*Math.sin(t/1000*P.sp*2+b.p)+.2*Math.sin(t/1000*P.sp*3.7+i*.5+b.p*2);
        if(ptr.on)v+=P.boost*Math.exp(-((((i+.5)*bw-ptr.x)/(W*.12))**2))*(1-ptr.y/H);v=Math.max(0,Math.min(1,v));b.h+=(v-b.h)*.3;b.pk=Math.max(b.h,b.pk-dt*.3);
        const n=Math.round(b.h*P.seg);for(let j=0;j<n;j++){g.fillStyle=`hsl(${130-130*j/P.seg},85%,55%)`;g.fillRect(i*bw+1,H*.95-(j+1)*sh,bw-2,sh-2)}
        g.fillStyle='#fff';g.fillRect(i*bw+1,H*.95-(Math.round(b.pk*P.seg)+1)*sh,bw-2,sh-2)}}
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
  }, [props.n, props.seg, props.sp, props.boost]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#0b0b10" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
