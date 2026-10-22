// @ts-nocheck
// Marquesina LED: Letrero de puntos con texto que se desplaza. El puntero ilumina los puntos cercanos.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface MarquesinaLEDBackgroundProps {
  /** Tamaño punto (reinicia la escena) */
  cell?: number;
  /** Filas (reinicia la escena) */
  rows?: number;
  /** Velocidad */
  sp?: number;
  /** Brillo del puntero */
  rad?: number;
  className?: string;
}

const DEFAULTS = { cell: 12, rows: 9, sp: 14, rad: 90 };

export default function MarquesinaLEDBackground(props: MarquesinaLEDBackgroundProps) {
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
      setup(s){const o=document.createElement('canvas'),x=o.getContext('2d'),txt='   FONDOS ANIMADOS  ·  LABORATORIO   ',f='bold '+P.rows+'px sans-serif';x.font=f;const w=Math.ceil(x.measureText(txt).width)+2;o.width=w;o.height=P.rows;
       x.font=f;x.fillStyle='#fff';x.textBaseline='middle';x.fillText(txt,0,P.rows/2+1);const d=x.getImageData(0,0,w,P.rows).data;s.w=w;s.t=Array.from({length:P.rows},(_,j)=>Array.from({length:w},(_,i)=>d[(j*w+i)*4+3]>110));s.o=0},
      draw(s,t,dt){s.o=(s.o+dt*P.sp)%s.w;const cols=Math.ceil(W/P.cell),y0=(H-P.rows*P.cell)/2,lit=[];g.fillStyle='#24130c';g.beginPath();
       for(let j=0;j<P.rows;j++)for(let i=0;i<cols;i++){const x=i*P.cell+P.cell/2,y=y0+j*P.cell+P.cell/2,on=s.t[j][(i+Math.floor(s.o))%s.w],near=ptr.on&&Math.hypot(x-ptr.x,y-ptr.y)<P.rad;if(on||near)lit.push([x,y,on]);else dot(g,x,y,P.cell*.32)}g.fill();
       for(const[x,y,on]of lit){g.fillStyle=on?'#ff9a4a':'#5a2e18';g.globalAlpha=on?.25:.4;g.beginPath();dot(g,x,y,P.cell*.55);g.fill();g.globalAlpha=1;g.beginPath();dot(g,x,y,P.cell*.34);g.fill()}}
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
  }, [props.cell, props.rows, props.sp, props.rad]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#0b0706" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
