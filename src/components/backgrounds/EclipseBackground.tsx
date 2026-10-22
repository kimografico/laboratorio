// @ts-nocheck
// Eclipse: Eclipse solar realista: el Sol brilla más por contraste al taparse, con glow blanco que vira a anaranjado en la totalidad; el limbo irregular de la Luna produce las perlas de Baily. La Luna es el puntero: pasa de azul casi blanco a negro al cubrir el Sol.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface EclipseBackgroundProps {
  /** Tamaño del Sol (reinicia la escena) */
  sun?: number;
  /** Luna (× Sol) */
  mr?: number;
  /** Movimiento automático */
  sp?: number;
  /** Corona */
  cor?: number;
  /** Perlas de Baily */
  bead?: number;
  /** Área solar visible máxima respecto al área lunar (%) */
  beadLimit?: number;
  /** Rugosidad del limbo lunar (%) */
  rough?: number;
  /** Estrellas (reinicia la escena) */
  stars?: number;
  className?: string;
}

const DEFAULTS = { sun: 60, mr: 1.04, sp: 0.6, cor: 1, bead: 1, beadLimit: 5, rough: 3, stars: 120 };

export default function EclipseBackground(props: EclipseBackgroundProps) {
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
      setup(s){s.mx=W*.2;s.my=H*.4;s.st=Array.from({length:P.stars},()=>[R()*W,R()*H*.9,R()*TAU]);const ph=[R()*TAU,R()*TAU,R()*TAU,R()*TAU];s.lr=Array.from({length:360},(_,i)=>{const a=i/360*TAU;return(Math.sin(a*5+ph[0])*.5+Math.sin(a*11+ph[1])*.35+Math.sin(a*23+ph[2])*.25+Math.sin(a*41+ph[3])*.15)/1.25})},
      lb(s,a){return 1+P.rough/100*s.lr[((((a%TAU)+TAU)%TAU)/TAU*360)|0]},
      draw(s,t,dt){const sx=W/2,sy=H*.4,Rs=P.sun,Rm=Rs*P.mr,tx=ptr.on?ptr.x:W/2+Math.sin(t/4000*P.sp)*W*.38,ty=ptr.on?ptr.y:sy+Math.sin(t/2600*P.sp+1)*Rs*.35;s.mx+=(tx-s.mx)*.12;s.my+=(ty-s.my)*.12;
       const d=Math.max(1,Math.hypot(s.mx-sx,s.my-sy));let ov=0;if(d<Rs+Rm){if(d<=Math.abs(Rs-Rm))ov=Math.PI*Math.min(Rs,Rm)**2;else ov=Rs*Rs*Math.acos((d*d+Rs*Rs-Rm*Rm)/(2*d*Rs))+Rm*Rm*Math.acos((d*d+Rm*Rm-Rs*Rs)/(2*d*Rm))-.5*Math.sqrt((-d+Rs+Rm)*(d+Rs-Rm)*(d-Rs+Rm)*(d+Rs+Rm))}
       const f=Math.min(1,ov/(Math.PI*Rs*Rs)),ss=(a,b,x)=>{const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u)},lerp=(a,b,u)=>a.map((v,i)=>v+(b[i]-v)*u),rgb=a=>a.map(v=>Math.round(v)).join(',');
       const dk=Math.pow(f,3)*.93,mx=(a,b)=>a.map((v,i)=>(v+(b[i]-v)*dk)|0),gr=g.createLinearGradient(0,0,0,H);
       gr.addColorStop(0,`rgb(${mx([74,144,217],[6,8,26])})`);gr.addColorStop(1,`rgb(${mx([170,214,255],[26,20,48])})`);g.fillStyle=gr;g.fillRect(0,0,W,H);
       const sa=Math.max(0,Math.min(1,(f-.88)/.12));g.fillStyle='#fff';for(const k of s.st){g.globalAlpha=sa*(.4+.6*Math.sin(t/500+k[2])**2);g.fillRect(k[0],k[1],1.6,1.6)}g.globalAlpha=1;
       g.globalCompositeOperation='lighter';
       const gk=(.28+.72*ss(0,.97,f))*Math.min(1,(1-f)*10),gc=lerp([255,250,235],[255,140,50],ss(.8,1,f));
       if(gk>0){const r2=Rs*(2.2+2.8*f),gl=g.createRadialGradient(sx,sy,Rs*.8,sx,sy,r2);gl.addColorStop(0,`rgba(${rgb(gc)},${.65*gk})`);gl.addColorStop(1,`rgba(${rgb(gc)},0)`);g.fillStyle=gl;g.beginPath();dot(g,sx,sy,r2);g.fill()}
       const ca=Math.min(1,P.cor*ss(.2,.75,f));
       if(ca>0){g.globalCompositeOperation='source-over';const r3=Rs*1.5,cg=g.createRadialGradient(sx,sy,Rs*.88,sx,sy,r3);cg.addColorStop(0,`rgba(255,115,25,${.72*ca})`);cg.addColorStop(.2,`rgba(255,90,15,${.58*ca})`);cg.addColorStop(.55,`rgba(255,75,10,${.2*ca})`);cg.addColorStop(1,'rgba(255,60,5,0)');g.fillStyle=cg;g.beginPath();dot(g,sx,sy,r3);g.fill()}
       g.globalCompositeOperation='source-over';
       g.fillStyle=`rgb(${rgb(lerp([255,244,194],[255,255,255],ss(0,.8,f)))})`;g.beginPath();dot(g,sx,sy,Rs);g.fill();
       g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,255,255,${.6*ss(0,.9,f)})`;g.beginPath();dot(g,sx,sy,Rs);g.fill();g.globalCompositeOperation='source-over';
       g.fillStyle=`rgb(${rgb(lerp([204,204,255],[6,7,10],ss(.15,.65,f)))})`;g.beginPath();for(let i=0;i<=240;i++){const a=i/240*TAU,r=Rm*this.lb(s,a),x=s.mx+Math.cos(a)*r,y=s.my+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fill();
       const stripRatio=((1-f)*Rs*Rs)/(Rm*Rm*(Math.max(.01,P.beadLimit)/100));
       const partial=d<Rs+Rm&&d>Math.abs(Rs-Rm);
       const bk=P.bead*(partial&&stripRatio>0&&stripRatio<1?1-ss(.35,1,stripRatio):0);
       if(bk>0){const N=240,dp=[],maxGap=Rm*.1;for(let i=0;i<N;i++){const a=i/N*TAU,px=sx+Math.cos(a)*Rs,py=sy+Math.sin(a)*Rs;dp.push(Math.hypot(px-s.mx,py-s.my)-Rm*this.lb(s,Math.atan2(py-s.my,px-s.mx)))}
        const visible=dp.map(v=>v>0&&v<=maxGap);
        const start=visible.findIndex(v=>!v);
        if(start>=0){g.globalCompositeOperation='lighter';
         const bead=(a,gap)=>{const px=sx+Math.cos(a)*Rs,py=sy+Math.sin(a)*Rs,level=Math.min(3,Math.floor(gap*4)),flicker=.78+.22*(.5+.5*Math.sin(t*.008+a*13)),glow=[.1,.15,.21,.28][level]*bk*flicker,core=[.3,.4,.52,.65][level]*bk*flicker;
          g.save();g.filter=`blur(${Math.max(1,Rs*.035)}px)`;g.fillStyle=`rgba(255,246,225,${glow})`;g.beginPath();dot(g,px,py,Rs*(.09+.08*gap));g.fill();g.restore();
          g.fillStyle=`rgba(255,255,255,${core})`;g.beginPath();dot(g,px,py,Rs*(.025+.025*gap));g.fill()};
         let k=1;
         while(k<=N){const i=(start+k)%N;if(visible[i]){const run=[];while(k<=N&&visible[(start+k)%N]){run.push((start+k)%N);k++}const count=Math.max(1,Math.ceil(run.length/8));for(let j=0;j<count;j++){const index=run[Math.floor((j+.5)*run.length/count)],gap=Math.min(1,dp[index]/maxGap);bead(index/N*TAU,gap)}}else k++}
         g.globalCompositeOperation='source-over'}}}
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
  }, [props.sun, props.mr, props.sp, props.cor, props.bead, props.beadLimit, props.rough, props.stars]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#000" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
