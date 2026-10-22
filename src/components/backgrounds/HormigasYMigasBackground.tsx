// @ts-nocheck
// Hormigas y migas: Clic = migas de azúcar. Las hormigas las recogen y las llevan al hormiguero. Huyen del puntero.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface HormigasYMigasBackgroundProps {
  /** Hormigas (reinicia la escena) */
  n?: number;
  /** Velocidad */
  sp?: number;
  /** Migas por clic */
  am?: number;
  /** Radio de huida */
  flee?: number;
  /** Tamaño */
  size?: number;
  className?: string;
}

const DEFAULTS = { n: 30, sp: 90, am: 10, flee: 70, size: 2.6 };

export default function HormigasYMigasBackground(props: HormigasYMigasBackgroundProps) {
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
      setup(s){s.nx=W/2;s.ny=H*.9;s.c=[];s.a=Array.from({length:P.n},()=>({x:s.nx,y:s.ny,a:-Math.PI/2+(R()-.5),t:null,cr:false,w:R()*9}))},
      click(s,x,y){s.c.push({x,y,n:P.am})},
      draw(s,t,dt){g.fillStyle='#3a2a1a';g.beginPath();dot(g,s.nx,s.ny,16);g.fill();
       for(const c of s.c){g.fillStyle='#fffaf0';g.beginPath();for(let i=0;i<Math.min(c.n,12);i++)dot(g,c.x+Math.cos(i*2.4)*(2+i*.9),c.y+Math.sin(i*2.4)*(2+i*.9),2.3);g.fill()}
       for(const a of s.a){a.w+=dt*6;let tx=null,ty=null;
        if(a.cr){tx=s.nx;ty=s.ny}else{if(!a.t||a.t.n<=0){let b=1e9,bc=null;for(const c of s.c)if(c.n>0){const d=Math.hypot(c.x-a.x,c.y-a.y);if(d<b){b=d;bc=c}}a.t=bc}if(a.t){tx=a.t.x;ty=a.t.y}}
        if(tx==null){tx=a.x+Math.cos(a.a)*50;ty=a.y+Math.sin(a.a)*50;a.a+=Math.sin(a.w)*dt*3}
        let want=Math.atan2(ty-a.y,tx-a.x);
        if(ptr.on&&P.flee){const dx=a.x-ptr.x,dy=a.y-ptr.y;if(Math.hypot(dx,dy)<P.flee)want=Math.atan2(dy,dx)}
        a.a+=Math.sin(want-a.a)*dt*8+Math.sin(a.w*1.7)*dt*1.2;a.x+=Math.cos(a.a)*P.sp*dt;a.y+=Math.sin(a.a)*P.sp*dt;if(a.x<0||a.x>W)a.a=Math.PI-a.a;if(a.y<0||a.y>H)a.a=-a.a;
        if(Math.hypot(tx-a.x,ty-a.y)<8){if(a.cr)a.cr=false;else if(a.t&&a.t.n>0){a.t.n--;a.cr=true}}
        g.fillStyle='#2b1d12';ant(g,a.x,a.y,a.a,P.size);if(a.cr){g.fillStyle='#fffaf0';g.beginPath();dot(g,a.x+Math.cos(a.a)*P.size*2.6,a.y+Math.sin(a.a)*P.size*2.6,P.size*.8);g.fill()}}
       s.c=s.c.filter(c=>c.n>0)}
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
  }, [props.n, props.sp, props.am, props.flee, props.size]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#d9c9a3" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
