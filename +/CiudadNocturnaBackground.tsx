// @ts-nocheck
// Ciudad nocturna: Edificios con ventanas que se encienden y apagan. El puntero enciende las cercanas.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface CiudadNocturnaBackgroundProps {
  /** Ventanas encendidas (reinicia la escena) */
  on?: number;
  /** Parpadeo */
  rate?: number;
  /** Alcance */
  rad?: number;
  /** Altura (reinicia la escena) */
  h?: number;
  className?: string;
}

const DEFAULTS = { on: 0.35, rate: 0.4, rad: 120, h: 0.55 };

export default function CiudadNocturnaBackground(props: CiudadNocturnaBackgroundProps) {
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
      setup(s){s.b=[];let x=-10;while(x<W){const w=40+R()*70,h=H*P.h*(.3+.7*R()),c=[],cols=Math.floor(w/14),rows=Math.floor(h/18);
       for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)c.push({x:x+(w-cols*14)/2+i*14+3,y:H-h+8+j*18,l:R()<P.on});s.b.push({x,w,h,c,s:12+R()*14|0});x+=w+4+R()*10}},
      draw(s,t,dt){for(const b of s.b){g.fillStyle=`hsl(225,30%,${b.s}%)`;g.fillRect(b.x,H-b.h,b.w,b.h);
        for(const c of b.c){if(R()<dt*P.rate*.1)c.l=!c.l;if(ptr.on&&Math.hypot(c.x-ptr.x,c.y-ptr.y)<P.rad)c.l=true;g.fillStyle=c.l?'#ffd77a':'#1a2140';g.fillRect(c.x,c.y,8,10)}}
       g.fillStyle='#f4f1e0';g.beginPath();dot(g,W*.85,H*.18,22);g.fill()}
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
  }, [props.on, props.rate, props.rad, props.h]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#0d1226" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
