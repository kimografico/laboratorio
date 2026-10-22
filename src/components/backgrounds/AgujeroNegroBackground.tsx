// @ts-nocheck
// Agujero negro: Horizonte de sucesos, lente gravitacional sobre las estrellas y disco de acreción con su halo. El puntero lo mueve; clic = lanza una sonda que se congela y enrojece al caer.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface AgujeroNegroBackgroundProps {
  /** Radio del horizonte (reinicia la escena) */
  rs?: number;
  /** Lente (× horizonte) */
  ein?: number;
  /** Inclinación del disco */
  tilt?: number;
  /** Estrellas (reinicia la escena) */
  stars?: number;
  /** Partículas del disco (reinicia la escena) */
  disc?: number;
  /** Rotación */
  sp?: number;
  /** Brillo */
  glow?: number;
  /** Seguimiento del ratón */
  follow?: number;
  /** Easing del seguimiento */
  ease?: number;
  className?: string;
}

const DEFAULTS = { rs: 50, ein: 1, tilt: 0.15, stars: 2500, disc: 4000, sp: 2.5, glow: 1, follow: 0.3, ease: 0.01 };

export default function AgujeroNegroBackground(props: AgujeroNegroBackgroundProps) {
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
      setup(s){s.x=W/2;s.y=H/2;s.s=Array.from({length:P.stars},()=>({x:R()*W,y:R()*H,m:.6+R()*1.4,h:200+R()*80,tw:R()*TAU}));const r0=P.rs*2.4,r1=P.rs*7;s.d=Array.from({length:P.disc},()=>({r:r0+(r1-r0)*Math.pow(R(),1.4),a:R()*TAU}));s.p=[]},
      click(s,x,y){const r=Math.max(P.rs*3,Math.hypot(x-s.x,y-s.y));s.p.push({r,r0:r,a:Math.atan2(y-s.y,x-s.x),t:[]});if(s.p.length>10)s.p.shift()},
      lens(s,x,y){const dx=x-s.x,dy=y-s.y,b=Math.max(1,Math.hypot(dx,dy)),th=P.rs*P.ein,q2=Math.sqrt(b*b+4*th*th),u=b/th,mg=(u*u+2)/(u*Math.sqrt(u*u+4));return{a:[(b+q2)/2,.5*(mg+1)],b:[(b-q2)/2,.5*(mg-1)],ux:dx/b,uy:dy/b}},
      draw(s,t,dt){const hx=W/2+Math.cos(t/6000)*W*.1,hy=H/2+Math.sin(t/7000)*H*.07;s.x+=((ptr.on?hx+(ptr.x-hx)*P.follow:hx)-s.x)*P.ease;s.y+=((ptr.on?hy+(ptr.y-hy)*P.follow:hy)-s.y)*P.ease;
       const rs=P.rs,sT=Math.sin(P.tilt),r0=rs*2.4,r1=rs*7;
       const img=(x,y,col,al,z)=>{const L=this.lens(s,x,y);for(const[th,mu]of[L.a,L.b]){const a=Math.abs(th);if(a<rs*1.02)continue;const dim=Math.min(1,(a-rs)/(rs*1.3)),m=Math.min(mu,8);g.globalAlpha=Math.min(1,(.3+.25*m)*al)*dim;g.fillStyle=col;g.beginPath();dot(g,s.x+L.ux*th,s.y+L.uy*th,Math.min(5,z*Math.sqrt(m)));g.fill()}};
       g.globalCompositeOperation='lighter';
       for(const o of s.s)img(o.x,o.y,`hsl(${o.h},70%,75%)`,.6+.4*Math.sin(t/600+o.tw)**2,o.m);
       for(const p of s.d){p.a=(p.a+dt*P.sp*3*Math.pow(r0/p.r,1.5))%TAU;const sa=Math.sin(p.a);if(sa<0){const u=(p.r-r0)/(r1-r0);img(s.x+Math.cos(p.a)*p.r,s.y+sa*p.r*sT,`hsl(${45-40*u},100%,${80-40*u}%)`,(.55-.45*Math.cos(p.a))*P.glow*1.3,1.3)}}
       const gr=g.createRadialGradient(s.x,s.y,rs,s.x,s.y,rs*3.2);gr.addColorStop(0,`rgba(255,150,60,${.4*P.glow})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=1;g.fillStyle=gr;g.beginPath();dot(g,s.x,s.y,rs*3.2);g.fill();
       g.strokeStyle=`rgba(255,215,160,${.35+.4*P.glow})`;g.lineWidth=2;g.beginPath();g.arc(s.x,s.y,rs*1.14,0,TAU);g.stroke();
       g.globalCompositeOperation='source-over';g.fillStyle='#000';g.beginPath();dot(g,s.x,s.y,rs);g.fill();
       g.globalCompositeOperation='lighter';
       for(const p of s.d){const sa=Math.sin(p.a);if(sa>=0){const u=(p.r-r0)/(r1-r0);g.fillStyle=`hsl(${45-40*u},100%,${80-40*u}%)`;g.globalAlpha=Math.min(1,(.55-.45*Math.cos(p.a))*P.glow*1.3);g.beginPath();dot(g,s.x+Math.cos(p.a)*p.r,s.y+sa*p.r*sT,1.3);g.fill()}}
       for(const p of s.p){const f=Math.max(0,1-rs/p.r);p.r=Math.max(rs*1.0005,p.r-dt*80*f);p.a+=dt*(.5+P.sp)*Math.pow(rs*3/p.r,1.5)*Math.max(f,.02);p.t.push([Math.cos(p.a)*p.r,Math.sin(p.a)*p.r]);if(p.t.length>60)p.t.shift();
        const al=Math.pow(Math.max(0,(p.r-rs)/(p.r0-rs)),.35),col=`hsl(${15+35*al},100%,60%)`;g.strokeStyle=col;g.lineWidth=2;p.t.forEach((q2,i)=>{if(!i)return;const o=p.t[i-1];g.globalAlpha=al*i/p.t.length*.6;g.beginPath();g.moveTo(s.x+o[0],s.y+o[1]);g.lineTo(s.x+q2[0],s.y+q2[1]);g.stroke()});
        g.globalAlpha=al;g.fillStyle=col;g.beginPath();dot(g,s.x+Math.cos(p.a)*p.r,s.y+Math.sin(p.a)*p.r,2+3*al);g.fill()}
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
  }, [props.rs, props.ein, props.tilt, props.stars, props.disc, props.sp, props.glow, props.follow, props.ease]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#000" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
