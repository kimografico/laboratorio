// @ts-nocheck
// Gatos minimalistas: Gatos de una sola figura (tu silueta SVG, cuerpo entero) con ojos de mancha blanca irregular y pupila, morro de triángulo y «3 tumbado», y dos bigotes por lado. Las pupilas siguen al puntero; clic = onda de saltitos.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface GatosMinimalistasBackgroundProps {
  /** Tamaño del gato (reinicia la escena) */
  size?: number;
  /** Separación horizontal (1 = sin solape) (reinicia la escena) */
  over?: number;
  /** Separación vertical (reinicia la escena) */
  rowv?: number;
  /** Desorden (reinicia la escena) */
  jit?: number;
  /** Proporción de gatos naranjas y pardos (reinicia la escena) */
  warm?: number;
  /** Variación entre gatos (reinicia la escena) */
  var?: number;
  /** Tamaño de los ojos */
  eyes?: number;
  /** Irregularidad de los ojos (reinicia la escena) */
  irr?: number;
  /** Dilatación de la pupila */
  dilate?: number;
  /** Largo de los bigotes */
  whisk?: number;
  /** Movimiento */
  bob?: number;
  /** Alcance del puntero */
  rad?: number;
  /** Opacidad del bloque completo (0 = transparente, 1 = opaco) */
  opacity?: number;
  className?: string;
}

const DEFAULTS = { size: 49, over: 0.85, rowv: 1.45, jit: 0.5, warm: 0.65, var: 1.25, eyes: 0.75, irr: 1.5, dilate: 2.5, whisk: 0.75, bob: 2.5, rad: 250, opacity: 0.5 };

export default function GatosMinimalistasBackground(props: GatosMinimalistasBackgroundProps) {
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
      pal: [[0,3,265,10,13],[0,2,220,6,32],[0,3,215,7,50],[0,2,210,5,68],[0,1,200,4,78],[0,3,35,18,94],[1,2,38,55,84],[1,3,26,86,57],[1,2,32,78,72],[1,3,27,36,36],[1,2,34,38,60],[1,1,20,42,22],[1,1,21,52,42]],
      sil: "M57.5,26.4L37.4,1.6c-2.4-2.9-7.1-1.7-7.7,2c-6.8,38.6-32,186.1-29.5,250.6l0,0c64.8,35.3,143.2,35.3,208,0l0,0c2.4-64.5-22.7-212-29.5-250.6c-0.7-3.7-5.3-4.9-7.7-2l-20.1,24.7l0,0C120.2,18.9,88.2,18.9,57.5,26.4L57.5,26.4z",
      mk(x,y,z){const w0=this.pal.map(p=>p[1]*(p[0]?2*P.warm:2*(1-P.warm))+.001);let r0=R()*w0.reduce((a,b)=>a+b,0),i0=0;while(i0<w0.length-1&&r0>=w0[i0]){r0-=w0[i0];i0++}const p0=this.pal[i0],h=p0[2]+(R()-.5)*8*P.var,s=Math.max(0,Math.min(100,p0[3]+(R()-.5)*10*P.var)),l=Math.max(6,Math.min(97,p0[4]+(R()-.5)*8*P.var)),ir=P.irr,
       bl=()=>Array.from({length:10},(_,i)=>[i/10*TAU+(R()-.5)*.14*ir,1+(R()-.5)*.16*ir]),pb=()=>Array.from({length:8},(_,i)=>[i/8*TAU+(R()-.5)*.16*ir,1+(R()-.5)*.2*ir]);
       return{x,y,z,l,ink:l<34?'#f0e6e2':'#2a2030',nose:l<34?'#e8a3b3':'#2a2030',dl:0,col:`hsl(${h},${s}%,${l}%)`,hw:.94+R()*.12,w:[bl(),bl()],pu:[pb(),pb()],er:[(R()-.5)*.5*ir,(R()-.5)*.5*ir],es:[.92+R()*.16,.92+R()*.16],ej:[(R()-.5)*4,(R()-.5)*4],nj:Array.from({length:6},()=>(R()-.5)*2.4),wj:(R()-.5)*8,ph:R()*TAU,bt:R()*5,bl:0,hop:0,lift:0,lx:0,ly:0}},
      setup(s){s.sp=new Path2D(this.sil);s.c=[];s.w=[];const z0=P.size,dx=z0*2*P.over;let row=0;for(let y=-z0*.4;y<H+z0*.6;y+=z0*P.rowv,row++)for(let x=-z0+(row%2)*dx/2;x<W+z0;x+=dx){const z=z0*(1+(R()-.5)*.3*P.jit);s.c.push(this.mk(x+(R()-.5)*dx*P.jit*.5,y+(R()-.5)*z0*P.jit*.3,z))}s.c.sort((a,b)=>a.y-b.y)},
      click(s,x,y){s.w.push({x,y,r:0})},
      blob(cx,cy,rx,ry,pts,rot,bs){const n=pts.length,q=pts.map(p=>{const a=p[0]+rot;return[cx+Math.cos(a)*rx*p[1],cy+Math.sin(a)*ry*bs*p[1]]});g.moveTo((q[0][0]+q[n-1][0])/2,(q[0][1]+q[n-1][1])/2);for(let i=0;i<n;i++){const a=q[i],b=q[(i+1)%n];g.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}g.closePath()},
      cat(c,t,sp){const k=c.z/104.15,sc=1+c.lift*.1,ink=c.ink,n=c.nj;
       g.save();g.translate(c.x,c.y-c.lift*c.z*.18-c.hop*c.z*.5+Math.sin(t/650+c.ph)*.04*P.bob*c.z);g.scale(k*sc*c.hw,k*sc);g.translate(-104.15,-80);g.lineJoin='round';g.lineCap='round';
       g.fillStyle=c.col;g.fill(sp);
       const bs=c.bl>0?.15:1,es=P.eyes,ox=c.lx*7*es,oy=c.ly*6*es;
       const dl=Math.min(1,c.dl)*P.dilate,pf=1+1.1*dl,lk=1-.7*Math.min(1,c.dl);
       for(let i=0;i<2;i++){const ex=104.15+(i?43:-43),ey=80+c.ej[i],wr=19*es*c.es[i],wh=22*es*c.es[i];g.fillStyle='#fff';g.beginPath();this.blob(ex,ey,wr,wh,c.w[i],c.er[i],bs);g.fill();if(c.l>80){g.strokeStyle='rgba(42,32,48,.4)';g.lineWidth=1.6;g.stroke()}
        g.fillStyle='#1d1722';g.beginPath();this.blob(ex+ox*lk,ey+oy*lk*bs,Math.min(8.5*es*pf,wr*.88),Math.min(10.5*es*pf,wh*.88),c.pu[i],0,bs);g.fill()}
       g.fillStyle=c.nose;g.beginPath();g.moveTo(93.5+n[0],107+n[1]);g.lineTo(114.5+n[2],107+n[3]);g.lineTo(104.15+n[4],119+n[5]*.6);g.closePath();g.fill();
       g.strokeStyle=ink;g.lineWidth=4;g.beginPath();g.moveTo(104.15,119);g.lineTo(104.15,128);g.moveTo(78,128);g.quadraticCurveTo(91,146,104.15,128);g.quadraticCurveTo(117,146,130,128);g.stroke();
       if(P.whisk>0){g.lineWidth=2.4;g.beginPath();for(const sg of[-1,1]){g.moveTo(104.15+sg*56,111);g.lineTo(104.15+sg*(56+70*P.whisk),102+c.wj);g.moveTo(104.15+sg*56,122);g.lineTo(104.15+sg*(56+66*P.whisk),131-c.wj*.5)}g.stroke()}
       g.restore()},
      draw(s,t,dt){for(const w of s.w)w.r+=520*dt;s.w=s.w.filter(w=>w.r<Math.hypot(W,H)+120);
       for(const c of s.c){c.bt-=dt;if(c.bt<0){c.bl=.14;c.bt=2+R()*5}c.bl=Math.max(0,c.bl-dt);
        const dx=ptr.x-c.x,dy=ptr.y-c.y,d=Math.hypot(dx,dy),near=ptr.on?Math.max(0,1-d/P.rad):0,k=Math.min(1,dt*8);c.lift+=(near-c.lift)*k;c.dl+=((ptr.on?Math.max(0,1-d/(c.z*2.4)):0)-c.dl)*Math.min(1,dt*6);
        c.lx+=((ptr.on?Math.max(-1,Math.min(1,dx/(c.z*2.5))):0)-c.lx)*k;c.ly+=((ptr.on?Math.max(-1,Math.min(1,dy/(c.z*2.5))):0)-c.ly)*k;
        let hop=0;for(const w of s.w){const dd=Math.abs(Math.hypot(c.x-w.x,c.y-w.y)-w.r);if(dd<90)hop=Math.max(hop,Math.sin(Math.PI*(1-dd/90)))}c.hop=hop;
        this.cat(c,t,s.sp)}}
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
  }, [props.size, props.over, props.rowv, props.jit, props.warm, props.var, props.eyes, props.irr, props.dilate, props.whisk, props.bob, props.rad]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#fbeee6", opacity: props.opacity ?? DEFAULTS.opacity }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
