// @ts-nocheck
// Láser: Un rayo láser sale del centro hacia el puntero y rebota en espejos. Clic = nuevos espejos.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface LaserBackgroundProps {
  /** Espejos (reinicia la escena) */
  n?: number;
  /** Rebotes */
  b?: number;
  /** Grosor */
  w?: number;
  /** Longitud espejo (reinicia la escena) */
  len?: number;
  className?: string;
}

const DEFAULTS = { n: 6, b: 12, w: 2, len: 140 };

export default function LaserBackground(props: LaserBackgroundProps) {
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
      setup(s){s.m=Array.from({length:P.n},()=>{const x=R()*W,y=R()*H,a=R()*Math.PI;return[x-Math.cos(a)*P.len/2,y-Math.sin(a)*P.len/2,x+Math.cos(a)*P.len/2,y+Math.sin(a)*P.len/2]});s.w=[[0,0,W,0],[W,0,W,H],[W,H,0,H],[0,H,0,0]]},
      click(s){this.setup(s)},
      draw(s,t,dt){let x=W/2,y=H/2,dx=(ptr.on?ptr.x:W/2+Math.cos(t/1500)*W*.4)-x,dy=(ptr.on?ptr.y:H/2+Math.sin(t/1100)*H*.4)-y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const all=s.m.concat(s.w),pts=[[x,y]];
       for(let k=0;k<P.b;k++){let best=1e9,bn=null;for(const m of all){const ex=m[2]-m[0],ey=m[3]-m[1],den=dx*ey-dy*ex;if(Math.abs(den)<1e-9)continue;const u=((m[0]-x)*ey-(m[1]-y)*ex)/den,v=((m[0]-x)*dy-(m[1]-y)*dx)/den;
         if(u>.001&&v>=0&&v<=1&&u<best){best=u;const el=Math.hypot(ex,ey);bn=[-ey/el,ex/el]}}
        if(!bn)break;x+=dx*best;y+=dy*best;pts.push([x,y]);const dd=dx*bn[0]+dy*bn[1];dx-=2*dd*bn[0];dy-=2*dd*bn[1]}
       g.strokeStyle='#8fb4ff';g.lineWidth=3;g.beginPath();for(const m of s.m){g.moveTo(m[0],m[1]);g.lineTo(m[2],m[3])}g.stroke();
       g.lineCap='round';g.lineJoin='round';g.strokeStyle='#ff2a3a';g.globalAlpha=.2;g.lineWidth=P.w*5;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
       g.globalAlpha=1;g.strokeStyle='#ffb0b8';g.lineWidth=P.w;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()}
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
  }, [props.n, props.b, props.w, props.len]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#07090f" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
