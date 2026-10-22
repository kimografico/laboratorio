// @ts-nocheck
// Colonización del espacio: Una red ramificada (como venas de hoja o raíces) crece hacia puntos de auxina. El puntero siembra atractores y las ramas lo siguen; clic = nueva raíz.
// Generado desde el laboratorio de fondos. Los colores van fijos dentro de la escena.
import { useEffect, useId, useRef } from "react";

export interface ColonizacionDelEspacioBackgroundProps {
  /** Atractores (reinicia la escena) */
  na?: number;
  /** Radio de influencia (reinicia la escena) */
  rad?: number;
  /** Paso */
  step?: number;
  /** Radio de eliminación */
  kill?: number;
  /** Pasos por fotograma */
  it?: number;
  /** Siembra del puntero */
  dep?: number;
  className?: string;
}

const DEFAULTS = { na: 700, rad: 80, step: 4, kill: 14, it: 2, dep: 10 };

export default function ColonizacionDelEspacioBackground(props: ColonizacionDelEspacioBackgroundProps) {
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
      setup(s){s.n=[{x:W/2,y:H-10,p:-1}];s.a=Array.from({length:P.na},()=>[R()*W,R()*H*.95])},
      click(s,x,y){s.n.push({x,y,p:-1});for(let i=0;i<60;i++){const a=R()*TAU,d=R()*90;s.a.push([x+Math.cos(a)*d,y+Math.sin(a)*d])}},
      grow(s){const cs=P.rad,hs=new Map(),key=(i,j)=>i*4096+j;s.n.forEach((n,i)=>{const k=key(n.x/cs|0,n.y/cs|0);if(!hs.has(k))hs.set(k,[]);hs.get(k).push(i)});
       const acc=new Map(),keep=[];
       for(const a of s.a){const ci=a[0]/cs|0,cj=a[1]/cs|0;let best=-1,bd=P.rad;for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++){const l=hs.get(key(i,j));if(l)for(const ni of l){const n=s.n[ni],d=Math.hypot(a[0]-n.x,a[1]-n.y);if(d<bd){bd=d;best=ni}}}
        if(best<0){keep.push(a);continue}if(bd<P.kill)continue;keep.push(a);const n=s.n[best],c=acc.get(best)||[0,0,0];c[0]+=(a[0]-n.x)/bd;c[1]+=(a[1]-n.y)/bd;c[2]++;acc.set(best,c)}
       s.a=keep;for(const[ni,c]of acc){const n=s.n[ni],dx=c[0]/c[2]+(R()-.5)*.1,dy=c[1]/c[2]+(R()-.5)*.1,l=Math.hypot(dx,dy)||1;s.n.push({x:n.x+dx/l*P.step,y:n.y+dy/l*P.step,p:ni})}},
      draw(s,t,dt){if(ptr.on&&P.dep>0){const k=Math.floor(P.dep*dt*6+R());for(let i=0;i<k;i++)s.a.push([ptr.x+(R()-.5)*80,ptr.y+(R()-.5)*80]);if(s.a.length>4000)s.a.splice(0,s.a.length-4000)}
       if(s.a.length<P.na*.15&&R()<dt*3)for(let i=0;i<20;i++)s.a.push([R()*W,R()*H*.95]);
       for(let k=0;k<P.it;k++)if(s.n.length<6000)this.grow(s);
       const n=s.n,sum=new Float32Array(n.length).fill(1);for(let i=n.length-1;i>0;i--)if(n[i].p>=0)sum[n[i].p]+=sum[i];
       g.strokeStyle='#a8e57a';g.lineCap='round';
       for(let b=0;b<8;b++){g.lineWidth=.8+b*.7;g.globalAlpha=.55+b*.05;g.beginPath();for(let i=1;i<n.length;i++){if(n[i].p<0)continue;if(Math.min(7,(Math.sqrt(sum[i])*.5)|0)!==b)continue;const p=n[n[i].p];g.moveTo(p.x,p.y);g.lineTo(n[i].x,n[i].y)}g.stroke()}
       g.globalAlpha=1;g.fillStyle='rgba(120,160,100,.5)';g.beginPath();for(const a of s.a)dot(g,a[0],a[1],1.3);g.fill()}
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
  }, [props.na, props.rad, props.step, props.kill, props.it, props.dep]);

  return (
    <div className={`bg-canvas ${className ?? ""}`.trim()} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "#0f1b14" }}>
      <canvas ref={cRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", backgroundColor: "var(--panel)" }} />
      <canvas ref={oRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
