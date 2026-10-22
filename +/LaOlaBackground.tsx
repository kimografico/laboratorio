// @ts-nocheck
// La ola: Gradas llenas de público haciendo la ola. Clic = lanza una ola desde ese punto.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface LaOlaBackgroundProps {
  /** Filas (reinicia la escena) */
  rows?: number;
  /** Personas por fila (reinicia la escena) */
  cols?: number;
  /** Velocidad */
  sp?: number;
  /** Anchura de ola */
  wid?: number;
  /** Olas automáticas (s) */
  auto?: number;
  className?: string;
}

const DEFAULTS = { rows: 5, cols: 30, sp: 420, wid: 160, auto: 6 };

export default function LaOlaBackground(props: LaOlaBackgroundProps) {
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
      setup(s){s.w=[];s.t=0;s.p=[];for(let j=0;j<P.rows;j++)for(let i=0;i<P.cols;i++)s.p.push({x:(i+.5+(j%2)*.5)*W/(P.cols+.5),y:H*(.3+.65*(j+.5)/P.rows),h:(i*47+j*83)%360})},
      click(s,x){s.w.push({x,r:0})},
      draw(s,t,dt){s.t+=dt;if(P.auto&&s.t>P.auto){s.t=0;s.w.push({x:0,r:0,o:1})}for(const w of s.w)w.r+=P.sp*dt;s.w=s.w.filter(w=>w.r<W*1.2+P.wid);
       const z=Math.min(W/P.cols*.45,H/P.rows*.3);
       for(const p of s.p){let u=0;for(const w of s.w){const fs=w.o?[w.r]:[w.x+w.r,w.x-w.r];for(const f of fs){const d=(p.x-f)/P.wid;if(Math.abs(d)<1)u=Math.max(u,Math.cos(d*Math.PI/2)**2)}}
        const y=p.y-u*z*.6,col=`hsl(${p.h},60%,50%)`;g.fillStyle=col;g.beginPath();g.ellipse(p.x,y+z*.6,z*.7,z*.9,0,0,TAU);g.fill();
        g.strokeStyle=col;g.lineWidth=z*.35;g.lineCap='round';g.beginPath();for(const sg of[-1,1]){g.moveTo(p.x+sg*z*.6,y+z*.4);g.lineTo(p.x+sg*z*(.8+.2*u),y+z*.5-z*(.2+1.8*u))}g.stroke();
        g.fillStyle='#f1c9a0';g.beginPath();dot(g,p.x,y-z*.5,z*.55);g.fill()}}
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
  }, [props.rows, props.cols, props.sp, props.wid, props.auto]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#2f5d3a" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
