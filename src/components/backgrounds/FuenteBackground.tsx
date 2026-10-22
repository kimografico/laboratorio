// @ts-nocheck
// Fuente: Chorros de agua con gravedad. El puntero mueve la fuente de lado a lado.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface FuenteBackgroundProps {
  /** Chorros */
  jets?: number;
  /** Gotas por segundo */
  rate?: number;
  /** Potencia */
  pw?: number;
  /** Gravedad */
  gr?: number;
  /** Dispersión */
  spr?: number;
  /** Gota */
  size?: number;
  className?: string;
}

const DEFAULTS = { jets: 5, rate: 900, pw: 720, gr: 1000, spr: 0.12, size: 2.2 };

export default function FuenteBackground(props: FuenteBackgroundProps) {
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
      setup(s){s.p=[];s.x=W/2;s.acc=0},
      draw(s,t,dt){s.x+=((ptr.on?ptr.x:W/2+Math.sin(t/2500)*W*.25)-s.x)*.1;const by=H*.9,add=[];s.acc+=dt*P.rate;
       while(s.acc>=1){s.acc--;const j=R()*P.jets|0,c=j-(P.jets-1)/2,ang=c*.22+(R()-.5)*P.spr*2,v=P.pw*(.85+.3*R())*(1-Math.abs(c)*.06);s.p.push({x:s.x,y:by,vx:Math.sin(ang)*v,vy:-Math.cos(ang)*v,s:0})}
       g.fillStyle='#2f86c4';g.beginPath();
       s.p=s.p.filter(p=>{p.vy+=P.gr*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.y>=by&&p.vy>0){if(!p.s&&R()<.5)add.push({x:p.x,y:by,vx:(R()-.5)*120,vy:-40-120*R(),s:1});return false}dot(g,p.x,p.y,P.size*(p.s?.7:1));return true}).concat(add);g.fill();
       g.fillStyle='#8fc7e8';g.fillRect(0,by,W,H-by);g.fillStyle='#6a7f8f';g.fillRect(s.x-30,by-8,60,14)}
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
  }, [props.jets, props.rate, props.pw, props.gr, props.spr, props.size]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#cfe8f5" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
