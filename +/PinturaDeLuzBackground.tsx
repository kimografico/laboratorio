// @ts-nocheck
// Pintura de luz: El puntero pinta con luz que se desvanece. Clic = cambia de color.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface PinturaDeLuzBackgroundProps {
  /** Duración (s) */
  life?: number;
  /** Grosor */
  w?: number;
  /** Brillo */
  glow?: number;
  /** Matiz inicial */
  hue?: number;
  /** Cambio de matiz */
  sp?: number;
  className?: string;
}

const DEFAULTS = { life: 2.5, w: 5, glow: 0.5, hue: 200, sp: 60 };

export default function PinturaDeLuzBackground(props: PinturaDeLuzBackgroundProps) {
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
      setup(s){s.p=[];s.h=P.hue},
      click(s){s.h+=120},
      draw(s,t,dt){s.h+=dt*P.sp;const x=ptr.on?ptr.x:W/2+Math.sin(t/900)*W*.3*Math.cos(t/2300),y=ptr.on?ptr.y:H/2+Math.sin(t/700+1)*H*.3;
       s.p.push({x,y,h:s.h,a:0});s.p=s.p.filter(p=>(p.a+=dt)<P.life);g.globalCompositeOperation='lighter';g.lineCap='round';
       for(let i=1;i<s.p.length;i++){const a=s.p[i-1],b=s.p[i],f=1-b.a/P.life;if(Math.hypot(b.x-a.x,b.y-a.y)>200)continue;g.strokeStyle=`hsl(${b.h},100%,60%)`;
        g.globalAlpha=f*P.glow*.4;g.lineWidth=P.w*4*f;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
        g.globalAlpha=f;g.lineWidth=P.w*f;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
       g.globalAlpha=1;g.globalCompositeOperation='source-over'}
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
  }, [props.life, props.w, props.glow, props.hue, props.sp]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#05060a" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
