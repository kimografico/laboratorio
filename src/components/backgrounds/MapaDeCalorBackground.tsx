// @ts-nocheck
// Mapa de calor: El puntero deja calor que se difunde y se enfría. Paleta térmica.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface MapaDeCalorBackgroundProps {
  /** Celda (reinicia la escena) */
  cell?: number;
  /** Difusión */
  dif?: number;
  /** Enfriamiento */
  dec?: number;
  /** Calor */
  str?: number;
  /** Radio */
  rad?: number;
  className?: string;
}

const DEFAULTS = { cell: 10, dif: 0.12, dec: 0.985, str: 0.15, rad: 3.5 };

export default function MapaDeCalorBackground(props: MapaDeCalorBackgroundProps) {
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
      setup(s){s.n=Math.ceil(W/P.cell);s.m=Math.ceil(H/P.cell);s.a=new Float32Array(s.n*s.m);s.b=new Float32Array(s.n*s.m)},
      draw(s,t,dt){const n=s.n,m=s.m,a=s.a,b=s.b;
       if(ptr.on){const ci=ptr.x/P.cell,cj=ptr.y/P.cell,r=P.rad;for(let j=Math.max(0,(cj-r)|0);j<Math.min(m,cj+r+1);j++)for(let i=Math.max(0,(ci-r)|0);i<Math.min(n,ci+r+1);i++){const d=Math.hypot(i-ci,j-cj);if(d<r)a[j*n+i]=Math.min(1,a[j*n+i]+P.str*(1-d/r))}}
       for(let j=0;j<m;j++)for(let i=0;i<n;i++){const k=j*n+i,u=j>0?a[k-n]:a[k],d=j<m-1?a[k+n]:a[k],l=i>0?a[k-1]:a[k],r=i<n-1?a[k+1]:a[k];b[k]=(a[k]+P.dif*(u+d+l+r-4*a[k]))*P.dec}
       s.a=b;s.b=a;for(let j=0;j<m;j++)for(let i=0;i<n;i++){const v=s.a[j*n+i];if(v>.02){g.fillStyle=`hsl(${260-v*245},100%,${10+v*55}%)`;g.fillRect(i*P.cell,j*P.cell,P.cell,P.cell)}}}
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
  }, [props.cell, props.dif, props.dec, props.str, props.rad]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#0a0612" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
