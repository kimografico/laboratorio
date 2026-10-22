// @ts-nocheck
// Radar 2: Un barrido ilumina los objetivos al pasar. Clic = añade un objetivo.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface RadarBackgroundProps {
  /** Objetivos (reinicia la escena) */
  n?: number;
  /** Giro */
  sp?: number;
  /** Desvanecer */
  fade?: number;
  /** Anillos */
  rings?: number;
  className?: string;
}

const DEFAULTS = { n: 18, sp: 1.2, fade: 0.7, rings: 5 };

export default function RadarBackground(props: RadarBackgroundProps) {
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
      setup(s){s.a=0;s.b=Array.from({length:P.n},()=>({x:R()*W,y:R()*H,l:0,vx:(R()-.5)*8,vy:(R()-.5)*8}))},
      click(s,x,y){s.b.push({x,y,l:1,vx:0,vy:0});if(s.b.length>120)s.b.shift()},
      draw(s,t,dt){const cx=W/2,cy=H/2,D=Math.hypot(W,H)/2,sw=P.sp*dt;s.a=(s.a+sw)%TAU;g.strokeStyle='#38d96b';g.lineWidth=1;g.globalAlpha=.3;g.beginPath();for(let i=1;i<=P.rings;i++){g.moveTo(cx+D*i/P.rings,cy);g.arc(cx,cy,D*i/P.rings,0,TAU)}g.moveTo(cx-D,cy);g.lineTo(cx+D,cy);g.moveTo(cx,cy-D);g.lineTo(cx,cy+D);g.stroke();
       g.fillStyle='#38d96b';for(let i=0;i<30;i++){g.globalAlpha=.2*(1-i/30)**2;g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,D,s.a-(i+1)*.04,s.a-i*.04);g.fill()}
       g.globalAlpha=1;g.strokeStyle='#8dffb0';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(s.a)*D,cy+Math.sin(s.a)*D);g.stroke();
       g.beginPath();for(const b of s.b){b.x=(b.x+b.vx*dt+W)%W;b.y=(b.y+b.vy*dt+H)%H;const an=(Math.atan2(b.y-cy,b.x-cx)+TAU)%TAU;if(((s.a-an)%TAU+TAU)%TAU<sw+.001)b.l=1;b.l=Math.max(0,b.l-dt/P.fade);g.globalAlpha=b.l;g.beginPath();dot(g,b.x,b.y,4+4*b.l);g.fillStyle='#b6ffcb';g.fill()}g.globalAlpha=1}
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
  }, [props.n, props.sp, props.fade, props.rings]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#06140c" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
