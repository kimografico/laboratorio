// @ts-nocheck
// Sombras largas: Columnas con sombras proyectadas desde el puntero, que hace de foco.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface SombrasLargasBackgroundProps {
  /** Objetos (reinicia la escena) */
  n?: number;
  /** Tamaño (reinicia la escena) */
  r?: number;
  /** Longitud sombra */
  len?: number;
  /** Opacidad */
  al?: number;
  className?: string;
}

const DEFAULTS = { n: 14, r: 26, len: 1200, al: 0.35 };

export default function SombrasLargasBackground(props: SombrasLargasBackgroundProps) {
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
      setup(s){s.o=Array.from({length:P.n},()=>({x:R()*W,y:R()*H,r:P.r*(.5+R()),h:R()*360}));s.x=W/2;s.y=H/2},
      draw(s,t,dt){s.x+=((ptr.on?ptr.x:W/2+Math.cos(t/1800)*W*.3)-s.x)*.15;s.y+=((ptr.on?ptr.y:H/2+Math.sin(t/1300)*H*.3)-s.y)*.15;
       const f=p=>{const e=Math.hypot(p[0]-s.x,p[1]-s.y)||1;return[p[0]+(p[0]-s.x)/e*P.len,p[1]+(p[1]-s.y)/e*P.len]};
       g.fillStyle=`rgba(40,30,60,${P.al})`;for(const o of s.o){const dx=o.x-s.x,dy=o.y-s.y,d=Math.hypot(dx,dy)||1,nx=-dy/d*o.r,ny=dx/d*o.r,a=[o.x+nx,o.y+ny],b=[o.x-nx,o.y-ny],fa=f(a),fb=f(b);
        g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(fa[0],fa[1]);g.lineTo(fb[0],fb[1]);g.lineTo(b[0],b[1]);g.closePath();g.fill()}
       for(const o of s.o){g.fillStyle=`hsl(${o.h},55%,55%)`;g.beginPath();dot(g,o.x,o.y,o.r);g.fill()}
       g.fillStyle='#fff8d0';g.beginPath();dot(g,s.x,s.y,10);g.fill()}
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
  }, [props.n, props.r, props.len, props.al]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#f1e8d4" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
