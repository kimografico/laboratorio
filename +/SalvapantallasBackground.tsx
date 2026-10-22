// @ts-nocheck
// Salvapantallas: Logotipos que rebotan y cambian de color al chocar. Clic = añade otro. El puntero los empuja.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface SalvapantallasBackgroundProps {
  /** Cantidad (reinicia la escena) */
  n?: number;
  /** Velocidad (reinicia la escena) */
  sp?: number;
  /** Ancho (reinicia la escena) */
  w?: number;
  /** Empuje */
  push?: number;
  className?: string;
}

const DEFAULTS = { n: 3, sp: 160, w: 90, push: 1 };

export default function SalvapantallasBackground(props: SalvapantallasBackgroundProps) {
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
      add(s,x,y){const a=R()*TAU;s.r.push({x,y,vx:Math.cos(a)*P.sp,vy:Math.sin(a)*P.sp,h:R()*360})},
      setup(s){s.r=[];for(let i=0;i<P.n;i++)this.add(s,R()*(W-P.w),R()*(H-P.w*.55))},
      click(s,x,y){this.add(s,x,y);if(s.r.length>60)s.r.shift()},
      draw(s,t,dt){const w=P.w,h=w*.55;g.font=`bold ${h*.5}px system-ui`;g.textAlign='center';g.textBaseline='middle';
       for(const r of s.r){if(ptr.on&&ptr.x>r.x&&ptr.x<r.x+w&&ptr.y>r.y&&ptr.y<r.y+h){const dx=r.x+w/2-ptr.x,dy=r.y+h/2-ptr.y,d=Math.hypot(dx,dy)||1;r.vx+=dx/d*P.push*400*dt;r.vy+=dy/d*P.push*400*dt}
        const v=Math.hypot(r.vx,r.vy)||1,k=Math.max(.98,Math.min(1.02,P.sp/v));r.vx*=k;r.vy*=k;r.x+=r.vx*dt;r.y+=r.vy*dt;
        if(r.x<0||r.x>W-w){r.vx*=-1;r.x=Math.max(0,Math.min(W-w,r.x));r.h+=70}if(r.y<0||r.y>H-h){r.vy*=-1;r.y=Math.max(0,Math.min(H-h,r.y));r.h+=70}
        g.fillStyle=`hsl(${r.h},85%,55%)`;g.beginPath();g.roundRect(r.x,r.y,w,h,h*.3);g.fill();g.fillStyle='#000';g.fillText('BOING',r.x+w/2,r.y+h/2)}}
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
  }, [props.n, props.sp, props.w, props.push]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#000" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
