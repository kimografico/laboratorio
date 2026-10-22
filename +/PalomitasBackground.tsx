// @ts-nocheck
// Palomitas: El puntero calienta los granos del suelo; al alcanzar la temperatura saltan y se hacen palomita. Clic = explosión.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface PalomitasBackgroundProps {
  /** Granos (reinicia la escena) */
  n?: number;
  /** Radio de calor */
  rad?: number;
  /** Calor */
  rate?: number;
  /** Tamaño (reinicia la escena) */
  size?: number;
  /** Gravedad */
  gr?: number;
  /** Vida palomita (s) */
  life?: number;
  className?: string;
}

const DEFAULTS = { n: 260, rad: 110, rate: 1.2, size: 6, gr: 1000, life: 8 };

export default function PalomitasBackground(props: PalomitasBackgroundProps) {
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
      setup(s){s.k=Array.from({length:P.n},()=>{const y=H*(.7+.28*R());return{x:R()*W,y,y0:y,h:0,st:0,vx:0,vy:0,l:0,b:0,sh:Array.from({length:5},()=>[(R()-.5)*1.6,(R()-.5)*1.6,.5+.5*R()])}})},
      pop(k){k.st=1;k.vy=-(350+R()*450);k.vx=(R()-.5)*260;k.b=0},
      click(s,x,y){for(const k of s.k)if(k.st==0&&Math.hypot(k.x-x,k.y-y)<P.rad*1.2)this.pop(k)},
      draw(s,t,dt){for(const k of s.k){if(k.st==0){k.h=ptr.on&&Math.hypot(k.x-ptr.x,k.y-ptr.y)<P.rad?k.h+dt*P.rate:Math.max(0,k.h-dt*.3);if(k.h>1)this.pop(k)}
        else if(k.st==1){k.vy+=P.gr*dt;k.x+=k.vx*dt;k.y+=k.vy*dt;if(k.y>=k.y0){k.y=k.y0;if(k.b<1&&Math.abs(k.vy)>150){k.vy*=-.35;k.vx*=.5;k.b++}else{k.st=2;k.l=P.life*(.6+.8*R())}}}
        else{k.l-=dt;if(k.l<=0){k.st=0;k.h=0;k.x=R()*W}}}
       for(const k of s.k){const z=P.size;if(k.st==0){g.fillStyle=`rgb(${200+55*k.h|0},${150-60*k.h|0},40)`;g.beginPath();g.ellipse(k.x,k.y,z*.8,z*.55,0,0,TAU);g.fill()}
        else{const f=Math.min(1,k.l/1.5||1),zz=z*2.6;g.globalAlpha=k.st==2?Math.min(1,k.l):1;g.fillStyle='#fff3d1';g.beginPath();for(const[a,b,r]of k.sh)dot(g,k.x+a*zz*.6,k.y+b*zz*.6,r*zz*.5);g.fill();g.fillStyle='#f3c35c';g.beginPath();dot(g,k.x+k.sh[0][0]*zz*.3,k.y+k.sh[0][1]*zz*.3,zz*.18);g.fill();g.globalAlpha=1}}}
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
  }, [props.n, props.rad, props.rate, props.size, props.gr, props.life]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#2a1b2e" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
