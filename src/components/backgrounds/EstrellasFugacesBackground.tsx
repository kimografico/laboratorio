// @ts-nocheck
// Estrellas fugaces: Cielo con estrellas parpadeantes. Clic = lanzas una; el ratón también las provoca.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface EstrellasFugacesBackgroundProps {
  /** Frecuencia */
  rate?: number;
  /** Velocidad */
  sp?: number;
  /** Cola */
  tail?: number;
  /** Ángulo */
  ang?: number;
  /** Estrellas (reinicia la escena) */
  st?: number;
  className?: string;
}

const DEFAULTS = { rate: 1.2, sp: 700, tail: 180, ang: 0.5, st: 150 };

export default function EstrellasFugacesBackground(props: EstrellasFugacesBackgroundProps) {
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
      setup(s){s.m=[];s.s=Array.from({length:P.st},()=>[R()*W,R()*H,R()*TAU,.5+R()*1.2])},
      launch(s,x,y){const v=P.sp*(.7+.6*R());s.m.push({x,y,vx:-Math.cos(P.ang)*v,vy:Math.sin(P.ang)*v})},
      click(s,x,y){this.launch(s,x,y)},
      draw(s,t,dt){if(R()<dt*P.rate)this.launch(s,R()*W*1.3,-20);if(ptr.on&&R()<dt*3)this.launch(s,ptr.x,ptr.y);
       g.fillStyle='#fff';for(const k of s.s){g.globalAlpha=.3+.5*Math.sin(t/700+k[2])**2;g.fillRect(k[0],k[1],k[3],k[3])}
       s.m=s.m.filter(m=>m.y<H+P.tail&&m.x>-P.tail);g.lineWidth=2;g.lineCap='round';g.strokeStyle='#cfe6ff';
       for(const m of s.m){m.x+=m.vx*dt;m.y+=m.vy*dt;const v=Math.hypot(m.vx,m.vy),ux=m.vx/v,uy=m.vy/v;for(let i=0;i<10;i++){g.globalAlpha=(1-i/10)**2;g.beginPath();g.moveTo(m.x-ux*P.tail*i/10,m.y-uy*P.tail*i/10);g.lineTo(m.x-ux*P.tail*(i+1)/10,m.y-uy*P.tail*(i+1)/10);g.stroke()}}g.globalAlpha=1}
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
  }, [props.rate, props.sp, props.tail, props.ang, props.st]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#070b1c" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
