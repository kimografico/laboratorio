// @ts-nocheck
// Día y noche: Ciclo de día y noche. Con el puntero encima, su posición horizontal elige la hora.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface DiaYNocheBackgroundProps {
  /** Velocidad del ciclo */
  sp?: number;
  /** Estrellas (reinicia la escena) */
  stars?: number;
  /** Colinas */
  hills?: number;
  className?: string;
}

const DEFAULTS = { sp: 0.03, stars: 120, hills: 0.6 };

export default function DiaYNocheBackground(props: DiaYNocheBackgroundProps) {
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
      setup(s){s.T=.3;s.s=Array.from({length:P.stars},()=>[R()*W,R()*H*.6,R()*TAU])},
      draw(s,t,dt){s.T=ptr.on?s.T+(ptr.x/W-s.T)*.1:(s.T+dt*P.sp)%1;const th=TAU*(s.T-.25),e=Math.sin(th);
       const S=[[-.3,[7,11,36],[26,34,80]],[0,[43,47,102],[240,128,90]],[.3,[74,144,217],[189,224,255]],[1,[59,130,214],[169,214,255]]];let i=0;while(i<2&&e>S[i+1][0])i++;
       const A=S[i],B=S[i+1],u=Math.max(0,Math.min(1,(e-A[0])/(B[0]-A[0]))),mx=(p,r)=>p.map((v,k)=>(v+(r[k]-v)*u)|0),T1=mx(A[1],B[1]),B1=mx(A[2],B[2]),gr=g.createLinearGradient(0,0,0,H);
       gr.addColorStop(0,`rgb(${T1})`);gr.addColorStop(1,`rgb(${B1})`);g.fillStyle=gr;g.fillRect(0,0,W,H);
       g.fillStyle='#fff';for(const k of s.s){g.globalAlpha=Math.max(0,Math.min(1,-e*3))*(.4+.6*Math.sin(t/500+k[2])**2);g.fillRect(k[0],k[1],1.6,1.6)}g.globalAlpha=1;
       const sx=W/2-Math.cos(th)*W*.45,sy=H*.85-Math.sin(th)*H*.7,mx2=W/2+Math.cos(th)*W*.45,my=H*.85+Math.sin(th)*H*.7;
       if(e>-.25){g.fillStyle='#fff3b0';for(const[r,a]of[[60,.08],[38,.15],[22,1]]){g.globalAlpha=a;g.beginPath();dot(g,sx,sy,r);g.fill()}g.globalAlpha=1}
       if(e<.25){g.fillStyle='#e8ecf5';g.globalAlpha=Math.min(1,.4-e);g.beginPath();dot(g,mx2,my,18);g.fill();g.globalAlpha=1}
       g.fillStyle=`rgb(${T1.map(v=>v*.3|0)})`;for(const[k,a,f,yy]of[[1,.04,90,.86],[2,.06,60,.92]]){g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=10)g.lineTo(x,H*yy+Math.sin(x/(f*2)+k*2)*H*a*P.hills);g.lineTo(W,H);g.fill()}}
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
  }, [props.sp, props.stars, props.hills]);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#000" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
