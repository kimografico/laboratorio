// @ts-nocheck
// Nevada acumulada: La nieve cae y se acumula en el suelo formando un perfil que se asienta solo. El puntero la barre.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface NevadaAcumuladaBackgroundProps {
  /** Copos (reinicia la escena) */
  n?: number;
  /** Viento */
  wind?: number;
  /** Acumulación */
  acc?: number;
  /** Radio de barrido */
  rad?: number;
  /** Tamaño copo */
  size?: number;
  className?: string;
}

const DEFAULTS = { n: 800, wind: 0.15, acc: 4, rad: 70, size: 2 };

export default function NevadaAcumuladaBackground(props: NevadaAcumuladaBackgroundProps) {
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
      setup(s){s.f=Array.from({length:P.n},()=>({x:R()*W,y:R()*H,v:30+R()*50,p:R()*TAU,r:P.size*(.5+R())}));s.c=Math.ceil(W/4);s.h=new Float32Array(s.c)},
      draw(s,t,dt){const h=s.h,c=s.c;g.fillStyle='#fff';g.beginPath();
       for(const f of s.f){f.y+=f.v*dt;f.x+=(Math.sin(t/900+f.p)*20+P.wind*80)*dt;if(f.x<0)f.x+=W;if(f.x>W)f.x-=W;const i=Math.min(c-1,Math.max(0,f.x/4|0));if(f.y>H-h[i]){h[i]=Math.min(H*.5,h[i]+P.acc*.5*f.r);f.y=-5;f.x=R()*W}dot(g,f.x,f.y,f.r)}g.fill();
       if(ptr.on){const ci=ptr.x/4,rr=P.rad/4;for(let i=Math.max(0,(ci-rr)|0);i<Math.min(c,ci+rr);i++)if(ptr.y>H-h[i]-P.rad)h[i]*=1-.25*(1-Math.abs(i-ci)/rr)}
       for(let i=0;i<c-1;i++){const e=h[i]-h[i+1];if(Math.abs(e)>5){h[i]-=e*.1;h[i+1]+=e*.1}}
       g.fillStyle='#e8f0ff';g.beginPath();g.moveTo(0,H);for(let i=0;i<c;i++)g.lineTo(i*4,H-h[i]);g.lineTo(W,H);g.fill()}
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
  }, [props.n, props.wind, props.acc, props.rad, props.size]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#1b2a44" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
