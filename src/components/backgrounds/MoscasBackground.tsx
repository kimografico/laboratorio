// @ts-nocheck
// Moscas: Moscas en vuelo errático que orbitan alrededor del puntero. Clic = manotazo: salen disparadas.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface MoscasBackgroundProps {
  /** Moscas (reinicia la escena) */
  n?: number;
  /** Erratismo */
  erra?: number;
  /** Atracción */
  att?: number;
  /** Velocidad máx. */
  max?: number;
  /** Tamaño */
  size?: number;
  className?: string;
}

const DEFAULTS = { n: 22, erra: 1.2, att: 0.8, max: 320, size: 3.5 };

export default function MoscasBackground(props: MoscasBackgroundProps) {
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
      setup(s){s.f=Array.from({length:P.n},()=>({x:R()*W,y:R()*H,vx:0,vy:0,p:R()*TAU,tx:R()*W,ty:R()*H}))},
      click(s,x,y){for(const f of s.f){const dx=f.x-x,dy=f.y-y,d=Math.hypot(dx,dy)||1;if(d<300){f.vx+=dx/d*P.max*2;f.vy+=dy/d*P.max*2}}},
      draw(s,t,dt){for(const f of s.f){let tx=f.tx,ty=f.ty;if(ptr.on){tx=ptr.x;ty=ptr.y}else if(R()<.01){f.tx=R()*W;f.ty=R()*H}
        const dx=tx-f.x,dy=ty-f.y,d=Math.hypot(dx,dy)||1;f.vx+=(dx/d*P.att*(d>60?1:-1)*400+(R()-.5)*2400*P.erra)*dt;f.vy+=(dy/d*P.att*(d>60?1:-1)*400+(R()-.5)*2400*P.erra)*dt;
        const v=Math.hypot(f.vx,f.vy);if(v>P.max){f.vx*=P.max/v;f.vy*=P.max/v}f.vx*=.985;f.vy*=.985;f.x+=f.vx*dt;f.y+=f.vy*dt;f.p+=dt*70;
        if(f.x<0||f.x>W)f.vx*=-1;if(f.y<0||f.y>H)f.vy*=-1;const a=Math.atan2(f.vy,f.vx),z=P.size,w=Math.abs(Math.sin(f.p));
        g.fillStyle='rgba(60,70,90,.25)';g.beginPath();for(const sg of[-1,1])dot(g,f.x-Math.sin(a)*sg*z*.9,f.y+Math.cos(a)*sg*z*.9,z*(.8+w*.8));g.fill();
        g.fillStyle='#1b1c20';g.beginPath();dot(g,f.x,f.y,z*.8);dot(g,f.x+Math.cos(a)*z*.9,f.y+Math.sin(a)*z*.9,z*.55);g.fill()}}
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
  }, [props.n, props.erra, props.att, props.max, props.size]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#d9d2bf" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
